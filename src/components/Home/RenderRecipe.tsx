import { useRecipe } from "@/components/Layout/RecipeContext"
import {
  RecipeResponse,
  ContentBlock,
  Section,
  Note,
  Paragraph,
  TextContent,
  ListContent,
  ListItem,
  Metadata,
} from "@/types/AIResponse"

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
    summary: { content: "Perhaps a recipe is loading?" },
  }

  const recipeJson = rawRecipe?.recipe || defaultRecipe.recipe

  const renderTextContent = (textContent: TextContent): React.ReactNode => {
    let content: React.ReactNode = textContent.text
    if (textContent.marks) {
      textContent.marks.forEach((mark) => {
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
          default:
            break
        }
      })
    }
    return content
  }

  const renderParagraph = (paragraph: Paragraph): React.ReactNode => (
    <p className="recipe-paragraph-content">
      {paragraph.content.map((textContent, idx) => (
        <span key={idx}>{renderTextContent(textContent)}</span>
      ))}
    </p>
  )

  const renderList = (list: ListContent): React.ReactNode => {
    const renderListItem = (item: ListItem, idx: number): React.ReactNode => {
      let liClass = "p-3 regular-recipe-list-item"
      if (item.completed) {
        liClass = "p-3 completed-recipe-list-item bg-gray-300"
      } else if (item.current) {
        liClass = "p-3 current-recipe-list-item bg-green-200"
      }
      return (
        <li key={idx} className={liClass}>
          {renderTextContent({ text: item.text, marks: item.marks })}
          {item.notes && item.notes.length > 0 && (
            <div className="list-item-note flex flex-col gap-1 p-2 bg-gray-50">
              {item.notes.map((note, nIdx) => (
                <p key={nIdx} className="italic text-gray-700">
                  {note}
                </p>
              ))}
            </div>
          )}
        </li>
      )
    }
    return list.ordered ? (
      <ol>{list.items.map((item, idx) => renderListItem(item, idx))}</ol>
    ) : (
      <ul>{list.items.map((item, idx) => renderListItem(item, idx))}</ul>
    )
  }

  const renderSection = (section: Section): React.ReactNode => (
    <div className="recipe-section">
      <h2 className="recipe-section-title">{section.title}</h2>
      {section.content.type === "paragraph"
        ? renderParagraph(section.content)
        : renderList(section.content)}
    </div>
  )

  const renderNote = (note: Note): React.ReactNode => (
    <div className="recipe-note bg-gray-50 p-3">
      {note.title && <h3>{note.title}</h3>}
      <div className="italic text-gray-700">
        {note.content.map((paragraph, idx) => (
          <div key={idx}>{renderParagraph(paragraph)}</div>
        ))}
      </div>
    </div>
  )

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

  const renderContentBlock = (
    block: ContentBlock,
    idx: number
  ): React.ReactNode => {
    if (block.type === "section") {
      return <div key={idx}>{renderSection(block)}</div>
    } else if (block.type === "note") {
      return <div key={idx}>{renderNote(block)}</div>
    }
    return null
  }

  return (
    <div className="full-rendered-recipe rendered-recipe-content">
      <h1>{recipeJson.title}</h1>
      {recipeJson.metadata && renderMetadata(recipeJson.metadata)}
      {recipeJson.description && (
        <div className="recipe-description bg-gray-50 p-4">
          <p>{recipeJson.description}</p>
        </div>
      )}
      {recipeJson.content.map((block, idx) => renderContentBlock(block, idx))}
    </div>
  )
}
