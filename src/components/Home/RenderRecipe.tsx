import { useRecipe } from "@/components/Layout/RecipeContext"
import {
  RecipeResponse,
  Metadata,
  IngredientListContent,
  InstructionListContent,
  ListItem,
  InstructionItem,
  Note,
  Paragraph,
  Mark,
} from "@/types/recipeResponse"

export default function RenderRecipe() {
  const { rawRecipe } = useRecipe()
  const defaultRecipe: RecipeResponse = {
    recipe: {
      title: "Loading...",
      metadata: {},
      description: "",
      ingredients: { items: [] },
      instructions: { items: [] },
      notes: [],
    },
    summary: { content: "Perhaps a recipe is loading?" },
  }

  const recipeJson = rawRecipe?.recipe || defaultRecipe.recipe

  const renderTextContent = (
    textContent: ListItem | Paragraph
  ): React.ReactNode => {
    let content: React.ReactNode = textContent.text
    if (textContent.marks) {
      textContent.marks.forEach((mark: Mark) => {
        switch (mark) {
          case "em":
            content = <em>{content}</em>
            break
          case "strong":
            content = <strong>{content}</strong>
            break
          case "sub":
            content = <sub>{content}</sub>
            break
          case "sup":
            content = <sup>{content}</sup>
            break
          case "strike":
            content = <s>{content}</s>
            break
          default:
            break
        }
      })
    }
    return content
  }

  const renderParagraph = (paragraph: Paragraph): React.ReactNode => (
    <p className="recipe-paragraph-content">
      {renderTextContent({
        text: paragraph.text,
        marks: paragraph.marks || [],
      })}
    </p>
  )

  const renderIngredients = (
    ingredients: IngredientListContent
  ): React.ReactNode => {
    const renderIngredientItem = (
      item: ListItem,
      idx: number
    ): React.ReactNode => (
      <li key={idx} className="p-3 regular-ingredient-item">
        {renderTextContent({ text: item.text, marks: item.marks || [] })}
      </li>
    )
    return (
      <>
        {ingredients.items.length > 0 && (
          <div className="recipe-ingredients">
            <h2 className="section-title">Ingredients</h2>
            <ul>
              {ingredients.items.map((item, idx) =>
                renderIngredientItem(item, idx)
              )}
            </ul>
          </div>
        )}
      </>
    )
  }

  const renderInstructions = (
    instructions: InstructionListContent
  ): React.ReactNode => {
    const renderInstructionItem = (
      item: InstructionItem,
      idx: number
    ): React.ReactNode => {
      let liClass = "p-3 regular-instruction-item"
      if (item.completed) {
        liClass = "p-3 completed-instruction-item bg-gray-300"
      } else if (item.current) {
        liClass = "p-3 current-instruction-item bg-green-200"
      }
      return (
        <li key={idx} className={liClass}>
          {renderTextContent({ text: item.text, marks: item.marks || [] })}
        </li>
      )
    }

    return (
      <>
        {instructions.items.length > 0 && (
          <div className="recipe-instructions">
            <h2 className="section-title">Instructions</h2>
            <ol>
              {instructions.items.map((item, idx) =>
                renderInstructionItem(item, idx)
              )}
            </ol>
          </div>
        )}
      </>
    )
  }

  const renderNotes = (notes: Note[]): React.ReactNode => {
    return (
      <div className="recipe-notes">
        {notes.map((note, idx) => (
          <div key={idx} className="recipe-note bg-gray-50 p-3">
            {note.title && <h3>{note.title}</h3>}
            {note.content.map((paragraph, pIdx) => (
              <div key={pIdx}>{renderParagraph(paragraph)}</div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  const renderMetadata = (meta: Metadata): React.ReactNode => (
    <div className="recipe-metadata flex my-4 gap-4">
      {meta.yield && (
        <div className="metadata-yield rounded-full px-4 shadow-inner bg-gray-100">
          <p>Yield: {meta.yield}</p>
        </div>
      )}
      {meta.prepTime && (
        <div className="metadata-prepTime rounded-full px-4 shadow-inner bg-gray-100">
          <p>Prep Time: {meta.prepTime}</p>
        </div>
      )}
      {meta.cookTime && (
        <div className="metadata-cookTime rounded-full px-4 shadow-inner bg-gray-100">
          <p>Cook Time: {meta.cookTime}</p>
        </div>
      )}
      {meta.totalTime && (
        <div className="metadata-totalTime rounded-full px-4 shadow-inner bg-gray-100">
          <p>Total: {meta.totalTime}</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="full-rendered-recipe rendered-recipe-content">
      <h1>{recipeJson.title}</h1>
      {recipeJson.metadata && renderMetadata(recipeJson.metadata)}
      {recipeJson.description && (
        <div className="recipe-description bg-gray-50 p-4">
          <p>{recipeJson.description}</p>
        </div>
      )}
      {renderIngredients(recipeJson.ingredients)}
      {renderInstructions(recipeJson.instructions)}
      {recipeJson.notes &&
        recipeJson.notes.length > 0 &&
        renderNotes(recipeJson.notes)}
    </div>
  )
}
