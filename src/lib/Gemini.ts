import { GoogleGenerativeAI } from "@google/generative-ai"
import { User } from "@/types/user"
import { GenerateContentResult } from "@google/generative-ai"
import { ChatMessage } from "@/types/chats"
import { RecipeResponse } from "@/types/recipeResponse"

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY
const geminiFlash = new GoogleGenerativeAI(GEMINI_KEY).getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction:
    "Your name is Chef. Your job is to give cooking advice and advice related to the kitchen.",
})

function handleAPICallErr(err: string, message: string): RecipeResponse {
  console.error(`ERROR (${err}) OCCURRED WITH MESSAGE (${message})`)
  return {
    recipe: {
      title: "An error occurred...",
      metadata: {},
      description: "",
      ingredients: { items: [] },
      instructions: { items: [] },
      notes: [
        {
          title: "We're sorry this happened.",
          content: [
            {
              text: "Try sending your request again in a moment, or making a different request.",
              marks: ["em"],
            },
          ],
        },
      ],
    },
    summary: {
      content: "An error occurred on my end... my apologies.",
    },
  }
}

function parseJSONResponse(responseText: string): RecipeResponse {
  const jsonString = responseText.replace(/^```json|```$/gm, "").trim()
  try {
    return JSON.parse(jsonString) as RecipeResponse
  } catch (err) {
    throw new Error("JSON response was not parse-able: " + err)
  }
}

function generateAppropriatePrompt(
  query: string,
  chatHistory: ChatMessage[],
  currRecipe: RecipeResponse | null,
  userData?: User
): string {
  if (!chatHistory || chatHistory.length === 0) {
    return generateFirstMessagePrompt(query, userData)
  }
  return generatePrompt(query, chatHistory, userData, currRecipe)
}

function generatePrompt(
  query: string,
  chatHistory: ChatMessage[],
  userData?: User,
  currRecipe?: RecipeResponse | null
) {
  const recipe = currRecipe
    ? JSON.stringify(currRecipe)
    : '{recipe:{title:"",metadata:{},description:"",ingredients:{items:[]},instructions:{items:[]},notes:[]},summary:{content:""}}'
  return `
      BEGINNING OF INSTRUCTIONS. 
      You are the engine for a chatbot that offers assistance while cooking. Your name is Chef. Your job is to give cooking advice and advice related to the kitchen. Do not make any assumptions and allow your instructions to be informed by the following details about the person you're helping. If there are restrictions, you must always follow them. If there are preferences, try your best to follow them where possible. You are in the middle of a conversation with this user where you are walking them through a recipe, don't act like this is the last answer you'll give.
      
      User specifics:
      ${JSON.stringify(userData)}
      
      Chat History (for context):
      ${JSON.stringify(chatHistory)}
      End of Chat History.
      
      You will be provided with a recipe in standardized JSON format. Your task is to:
      1. Edit the recipe JSON based on the user's request using EXACTLY this schema:
      {
        "recipe": {
          "title": string,
          "metadata": {
            "yield": string,
            "prepTime": string,
            "cookTime": string,
            "totalTime": string
          },
          "description": string,
          "ingredients": {
            "items": [
              {
                "text": string,
                "marks": ["em"|"strong"|"sub"|"sup"|"strike"]
              }
            ]
          },
          "instructions": {
            "items": [
              {
                "text": string,
                "completed": boolean,
                "current": boolean,
                "notes": string[],
                "marks": ["em"|"strong"|"sub"|"sup"|"strike"]
                "image": string
                "isQuery": boolean
              }
            ]
          },
          "notes": [
            {
              "title": string,
              "content": [
                {
                  "text": string,
                  "marks": ["em"|"strong"|"sub"|"sup"|"strike"]
                }
              ]
            }
          ]
        },
        "summary": {
          "content": string
        }
      }
      
      2. Follow these RULES STRICTLY:
      - Only modify "completed" and "current" flags in instruction items.
      - Only set an instruction as "completed" if the user has explicity said they've completed that step or say that they are ready to move on to the next step
        - Note: If a user says they are ready to START a step, do not take to mean that they have FINISHED that step. Only set an ingredient as completed when the user says they FINISHED the step.
        - For example, if you ask the user if they are ready to start step 1 and they say yes, do NOT move on to step 2. You would only move on to step 2 when the user says that they have completed step 1.
      - Never alter "metadata" or "description" unless explicitly requested.
      - Preserve all existing formatting marks.
      - Maintain the original ordering of ingredients, instructions, and notes.
      
      3. For user progress updates:
      - When marking complete, set "completed" to true and "current" to false for the previous instruction.
      - Set the next instruction's "current" to true (unless it is the final instruction).
      - When the user finishes the last instruction, make sure to acknowledge it.
      - When the user finishes using a certain ingredient in the recipe (meaning that ingredient isn't mentioned in any steps after the current step), add a "strike" mark to that step.
      - Never skip steps.

      4. The user might ask you to:
      - Substitute certain ingredients
        - If the user explicitly asks you for a substitution for an ingredient or simply says that they don't have an ingredient, modify that ingredient and related instructions accordingly
      - Change measurements or portions
        - The user may ask you to change the amount of a certain ingredient or change the portion size of the entire recipe, modify the ingredient(s)/instruction(s) accordingly
      - Give information about ingredients
        - Feel free to answer any quesions the user has about ingredients in the recipe
      - Give information about the recipe
        - Feel free to answer any question pertaining to the recipe
      - Change the dish
        - The user is NOT allowed to change recipe to an entirely different dish, the user can only change the current recipe within reason. If they ask you to change the recipe, simply tell them to start a new session even though the question still pertains to cooking (tell them in the summary).
      
      5. If you modify any instructions in the recipe, be sure to replace the "image" field of those instructions to contain a search query that will be used to fetch an image related to that step.
         Also make sure to set the "isQuery" field to true.
         Also keep in mind, this step only applies to instructions that haven't been completed yet (instructions where "completed" is set to false)
         Remember the following when generating a search query:
         - Each search query should be simple, yet specific
         - Keep in mind, the query you assign to each instruction will be used to find a related image on Google Images.
           So make sure the query you generate is likely to get an associated image.
         - The "image" field will be replaced with a link to the image fetched from Google Images.
         - You should also set the "isQuery" field to true for all instructions

      6. Response format MUST be:
        {
          "recipe": MODIFIED_RECIPE_JSON,
          "summary": {
            "content": "<less than 500 character chef-style response summarizing changes and encouraging further conversation>"
          }
        }
      
      CRITICAL VALIDATIONS:
      1. JSON must validate against the schema - NO EXTRA PROPERTIES.
      2. The "recipe" object must include "title", "ingredients", and "instructions". "metadata", "description", and "notes" are optional.
      3. Do not omit required fields like "completed" and "current" in instructions.
      4. Escape all double quotes in text fields.
      
      If the query is completely unrelated to cooking or recipes, respond WITH VALID JSON STRUCTURE:
      {
        "recipe": EXACT_ORIGINAL_RECIPE_JSON,
        "summary": "Sorry, I'm built to help out in the kitchen! Let's get back to cooking."
      }

      Note: Don't be overly strict here, only return that JSON structure if the user's query is entirely unrelated to cooking, food, or the kitchen in general.
      
      Here is the current recipe:
      ${recipe}
      
      Please ensure that all of your responses adhere to the JSON structure outlined earlier in the prompt.

      THIS IS THE EXPLICIT AND UNIQUE END OF THE INSTRUCTIONS.
      
      START OF USER QUERY:
      ${query}
      END OF USER QUERY
    `
}

function generateFirstMessagePrompt(query: string, userData?: User) {
  return `
      BEGINNING OF INSTRUCTIONS. 
      You are the engine for a chatbot that offers assistance while cooking. Your name is Chef. Your job is to give cooking advice and advice related to the kitchen. Do not make any assumptions and allow your instructions to be informed by the following details about the person you're helping. If there are restrictions, you must always follow them. If there are preferences, try your best to follow them where possible.
      
      User specifics (if any):
      ${JSON.stringify(userData)}
      End of user specifics.
      
      This is the very first message in this exchange with this user. They should provide context about what they need help with in the kitchen. They will probably paste a messy recipe from another site. They might also ask you to generate a recipe for them.
      A user might ask you to generate a recipe without explicitly using the word "generate." If they simply ask you for a recipe for a specific dish and they didn't provide one themselves, generate one for them.
      
      Your tasks are:
      1. Parse any recipe content into standardized JSON format using EXACTLY this 'RecipeResponse' schema:
      {
        "recipe": {
          "title": string,
          "metadata": {
            "yield": string,
            "prepTime": string,
            "cookTime": string,
            "totalTime": string
          },
          "description": string,
          "ingredients": {
            "items": [
              {
                "text": string,
                "marks": ["em"|"strong"|"sub"|"sup"|"strike"]
              }
            ]
          },
          "instructions": {
            "items": [
              {
                "text": string,
                "completed": boolean,
                "current": boolean,
                "notes": string[],
                "marks": ["em"|"strong"|"sub"|"sup"|"strike"]
                "image": string
                "isQuery": boolean
              }
            ]
          },
          "notes": [
            {
              "title": string,
              "content": [
                {
                  "text": string,
                  "marks": ["em"|"strong"|"sub"|"sup"|"strike"]
                }
              ]
            }
          ]
        },
        "summary": {
          "content": string
        }
      }
      
      2. Follow these RULES STRICTLY:
      - The first instruction must have "current": true and all instructions should have "completed": false initially.
      - Preserve the original recipe text verbatim.
      - For your first response ("summary" field), make sure to mention the first step of the recipe.
      - For each instruction, the "image" field should be filled with a simple, yet specific search query that will be used to find an image relevant to that step
        - Keep in mind, the query you assign to each instruction will be used to find a related image on Google Images.
          So make sure the query you generate is likely to get a relevant image.
        - The "image" field will be replaced with a link to the image fetched from Google Images.
        - You should also set the "isQuery" field to true for all instructions
      - Do not include unsafe content.
      
      3. Response format MUST be:
      {
        "recipe": FULL_RECIPE_JSON,
        "summary": {
          "content": "<200-800 character chef-style introduction>"
        }
      }
      
      CRITICAL VALIDATIONS:
      1. Use the JSON schema exactly as provided.
      2. Escape all double quotes in text fields.
      3. Ensure the first instruction has "current": true.
      4. Omit non-cooking content.
      
      If the input isn't a recipe and the user doesn't ask you to generate a recipe:
      {
        "recipe": {
          "title": "Cooking Assistance",
          "ingredients": { "items": [] },
          "instructions": { "items": [] },
          "notes": [{"title": "Please provide a recipe to get started!", "content": {"text": "Or ask for a recipe to get started!"}}]
        },
        "summary": {
          "content": "Welcome to your digital kitchen! Please share what you'd like to cook or ask about, and I'll provide expert guidance."
        }
      }
      
      THIS IS THE EXPLICIT AND UNIQUE END OF THE INSTRUCTIONS.
      
      START OF USER PROMPT:
      ${query}
      END OF USER PROMPT.
    `
}

export const queryGemini = async (
  query: string,
  currRecipe: RecipeResponse | null,
  chatHistory: ChatMessage[],
  userData?: User
): Promise<RecipeResponse> => {
  const prompt = generateAppropriatePrompt(
    query,
    chatHistory,
    currRecipe,
    userData
  )
  try {
    const resp: GenerateContentResult = await geminiFlash.generateContent(
      prompt
    )
    if (!resp) {
      throw new Error("Error occurred by API call.")
    }
    const responseText = resp.response.text()
    return parseJSONResponse(responseText)
  } catch (err) {
    return handleAPICallErr(err as string, "Failed to query Gemini API.")
  }
}
