import { useRecipe } from "@/context/RecipeContext"
import { queryGemini_2_0 } from "@/lib/gemini/Gemini"
import { ChatMessage } from "@/types/chat-entry"
import { useEffect, useRef, useState } from "react"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { ChatBubble } from "./ChatBubble"

export const ChatWindow = () => {
  // considered using card here but may make more sense to just design our own.
  // this chat window expects to take up the full dimensions offered to it, so it should
  // be placed in a div which decides its dimensions when called.

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const endOfMessagesRef = useRef<HTMLDivElement>(null)
  const [inputContent, setInputContent] = useState("")
  const [generationState, setGenerationState] = useState(false) // not currently generating a response
  const textAreaMaxHeightPx = 275
  const { updateRecipe, rawRecipe, chatHistory, setChatHistory } = useRecipe()

  const adjustTextAreaHeight = () => {
    if (inputRef.current) {
      // reset height to auto calculate new height
      inputRef.current.style.height = "auto"

      // make sure it doesn't go over the max
      inputRef.current.style.height = `${Math.min(
        inputRef.current.scrollHeight,
        textAreaMaxHeightPx
      )}px`
    }
  }

  function handleInputChange(curr: string) {
    // controlled component
    setInputContent(curr)
  }

  async function handleInputSubmit() {
    if (!inputContent) {
      return
    }
    setChatHistory((prev: ChatMessage[]) => {
      const ch = [
        ...prev,
        { message: inputContent, role: "USER" } as ChatMessage,
      ]
      return ch
    })

    const query = inputContent
    setInputContent("")

    // here is where we will actually send the user input to the ai.
    // for now we pretend it immediately sends back a reponse.

    setGenerationState(true)
    const response = await queryGemini_2_0(query, rawRecipe, chatHistory)

    let updatedRecipe = rawRecipe
    let newBotResponse =
      "Sorry, something went wrong on my end, try asking again in a second?"

    if (response?.editedHTML && response?.summary) {
      updatedRecipe = response.editedHTML
      newBotResponse = response.summary
    }
    setGenerationState(false)

    setChatHistory((prev: ChatMessage[]) => {
      const ch = [
        ...prev,
        { message: newBotResponse, role: "BOT" } as ChatMessage,
      ]
      return ch
    })

    updateRecipe(updatedRecipe)
  }

  useEffect(() => {
    if (inputRef.current) {
      adjustTextAreaHeight()
    }
  }, [inputContent])

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatHistory])

  return (
    <div
      className="w-full h-full bg-inherit rounded-lg py-3 px-2 relative overflow-y-auto mx-10"
      style={{
        boxShadow: `inset 0 0 30px 10px rgba(0, 0, 0, 0.03)`,
      }}
    >
      {/* LOGIC FOR RENDERING DIFFERENT CHATS */}
      <div className="flex flex-col gap-2 max-h-[90%] overflow-y-auto">
        {chatHistory.length > 0 ? (
          chatHistory.map((chatMsg, idx) => (
            <ChatBubble message={chatMsg} key={idx} />
          ))
        ) : (
          <p className="text-center w-full mt-5">
            Upload a recipe, or start asking Chef some questions!
          </p>
        )}

        <div className="scrollTo-ref" ref={endOfMessagesRef} />
      </div>

      <div className="user-input-field absolute bottom-2 w-full -ml-3 p-2 flex justify-center items-end gap-3 z-30">
        <Textarea
          className="w-[80%] overflow-y-auto resize-none "
          placeholder="Ask Chef..."
          ref={inputRef}
          value={inputContent}
          onChange={(e) => {
            e.preventDefault()
            handleInputChange(e.target.value) // update the actual text entered
          }}
          disabled={generationState}
        />

        <Button
          variant={"default"}
          className="bg-app_teal hover:bg-app_teal_dark h-[60px] w-[15%] object-scale-down"
          onClick={handleInputSubmit}
        >
          <img
            src={`/vectors/chef-hat-and-spatula.svg`}
            className="scale-[0.8]"
          />
        </Button>
      </div>
    </div>
  )
}
