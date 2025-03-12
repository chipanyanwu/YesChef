import { useState, useEffect } from "react";
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
import { googleImageSearch } from "@/lib/googleImageSearch"
//mport { getImageUrl } from "@/lib/pixabayFetcher";

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
  const [ingredientImage, setIngredientImage] = useState<string | null>(null)
  const [instructionImage, setInstructionImage] = useState<string | null>(null)

  useEffect(() => {
    if (ingredientImage) {
      const timer = setTimeout(() => setIngredientImage(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [ingredientImage]);

  useEffect(() => {
    let isMounted = true;
    
    const BLOCKED_DOMAINS = ["instagram.com", "tiktok.com"];
    function isBlockedDomain(url: string): boolean {
      try {
        const domain = new URL(url).hostname.toLowerCase();
        return BLOCKED_DOMAINS.some((blocked) => domain.includes(blocked));
      } catch {
        return true;
      }
    }

    async function fetchInstructionImage() {
      const currentInstruction = recipeJson.instructions.items.find(
        (item) => item.current
      );
      if (!currentInstruction) {
        setInstructionImage(null);
        return;
      }
  
      const searchTerm = parseInstructionText(currentInstruction.text);
      if (!searchTerm) {
        setInstructionImage(null);
        return;
      }
  
      try {
        const results = await googleImageSearch(searchTerm);
        if (!isMounted) return; 
        const valid = results.filter((url) => !isBlockedDomain(url));
        if (valid.length > 0) {
          setInstructionImage(valid[0]);
        } else {
          setInstructionImage(null);
        }
      } catch (err) {
        console.error("Error while fetching instruction image:", err);
        if (isMounted) setInstructionImage(null);
      }
    }
  
    fetchInstructionImage();
  
    return () => {
      isMounted = false;
    };
  }, [recipeJson.instructions])

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

  function parseIngredientName(fullText: string): string {
    return fullText
      .replace(/\([^)]*\)/g, "")
      .replace(/\b(\d+(\.\d+)?|\d*\/\d+)\b/g, "")
      .replace(/[¼½¾]/g, "")
      .replace(
        /\b(teaspoons?|tsp|sticks?|tablespoons?|tbsp|cups?|pounds?|lbs?|oz|ounces?|grams?|g|kg|of)\b/gi,
        ""
      )
      .trim();
  }
  
  const handleIngredientClick = async (ingredient: string) => {
    const coreName = parseIngredientName(ingredient)
    //console.log("Parsed ingredient name:", coreName)
  
    const results = await googleImageSearch(coreName)
  
      if (results) {
        setIngredientImage(results[0]);
      } else {
        setIngredientImage(null);
      }
  }

  const renderIngredients = (
    ingredients: IngredientListContent
  ): React.ReactNode => {
    const renderIngredientItem = (
      item: ListItem,
      idx: number
    ): React.ReactNode => (
      <li
        key={idx}
        className="p-3 regular-ingredient-item cursor-pointer"
        onClick={() => handleIngredientClick(item.text)}
      >
        {renderTextContent({ text: item.text, marks: item.marks || [] })}
      </li>
    );
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

  function parseInstructionText(fullText: string): string {

    let result = fullText.replace(/\([^)]*\)/g, "")
  
    result = result.replace(/[°]/g, "")
  
    result = result.replace(/[.,!?]/g, "")
    result = result.replace(/\d+/g, "")
  
    const words = result.split(/\s+/)
  
    const fillerWords = new Set([
      "in", "a", "the", "over", "for", "until", "and", 
      "of", "on", "to", "preheat", "F"
    ])
  
    const filtered = words.filter((word) => {
      if (!word.trim()) return false
      return !fillerWords.has(word.toLowerCase())
    })
  
    const trimmed = filtered.slice(0, 7)
  
    return trimmed.join(" ")
  }
  
  function renderInstructions(instructions: InstructionListContent): React.ReactNode {
    const renderInstructionItem = (item: InstructionItem, idx: number): React.ReactNode => {
      let liClass = "p-3 regular-instruction-item";
      if (item.completed) {
        liClass = "p-3 completed-instruction-item bg-gray-300";
      } else if (item.current) {
        liClass = "p-3 current-instruction-item bg-green-200";
      }
      return (
        <li key={idx} className={liClass}>
          {renderTextContent({ text: item.text, marks: item.marks || [] })}

          {item.current && instructionImage && (
            <div className="instruction-image-display">
              <img src={instructionImage} alt="Instruction Step" />
            </div>
          )}

          {item.notes && item.notes.length > 0 && (
            <div className="instruction-notes flex flex-col gap-1 p-2 bg-gray-50">
              {item.notes.map((note, nIdx) => (
                <p key={nIdx} className="italic text-gray-700">
                  {note}
                </p>
              ))}
            </div>
          )}
        </li>
      );
    };

    return (
      <>
        {instructions.items.length > 0 && (
          <div className="recipe-instructions">
            <h2 className="section-title">Instructions</h2>
            <ol>
              {instructions.items.map((item, idx) => renderInstructionItem(item, idx))}
            </ol>
          </div>
        )}
      </>
    );
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
      {ingredientImage && (
        <div className="ingredient-image-display">
          <img src={ingredientImage} alt="Ingredient" />
        </div>
      )}
      {renderInstructions(recipeJson.instructions)}
      {recipeJson.notes &&
        recipeJson.notes.length > 0 &&
        renderNotes(recipeJson.notes)}
    </div>
  )
}
