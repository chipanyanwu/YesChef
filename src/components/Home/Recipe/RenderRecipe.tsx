import { useRecipe } from "@/components/Layout/RecipeContext"
import { ContentBlock, RecipeResponse } from "@/types/AIResponse"
import RenderRecipeContentBlock from "./RenderRecipeContentBlock"
import { RenderRecipeMetadata } from "./RenderRecipeMetadata"

export default function RenderRecipe() {
  const { rawRecipe } = useRecipe()
  const defaultRecipe: RecipeResponse = {
    recipe: {
      title: "No recipe to display...",
      content: [
        {
          type: "note",
          title: "Info",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  text: "Try sending a recipe, or asking for some cooking tips!",
                },
              ],
            },
          ],
        },
      ],
    },
    summary: {
      content: "Perhaps a recipe is loading?",
    },
  }

  const recipeJson = rawRecipe?.recipe || defaultRecipe.recipe

  return (
    <div className="full-rendered-recipe rendered-recipe-content">
      <h1>{recipeJson.title}</h1>
      {recipeJson.metadata && (
        <RenderRecipeMetadata meta={recipeJson.metadata} />
      )}
      {recipeJson.description && (
        <div className="recipe-description bg-gray-50 p-4">
          <p>{recipeJson.description}</p>
        </div>
      )}
      {recipeJson.content.map((contentBlock: ContentBlock, index: number) => (
        <RenderRecipeContentBlock key={index} content={contentBlock} />
      ))}
    </div>
  )
}
