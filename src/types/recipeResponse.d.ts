export interface RecipeResponse {
  summary: Summary
  recipe: Recipe
}

export interface Recipe {
  title: string
  metadata?: Metadata
  description?: string
  ingredients: IngredientListContent
  instructions: InstructionListContent
  notes?: Note[]
}

export interface Metadata {
  yield?: string
  prepTime?: string
  cookTime?: string
  totalTime?: string
}

export interface IngredientListContent {
  items: ListItem[]
}

export interface InstructionListContent {
  items: InstructionItem[]
}

export interface ListItem {
  text: string
  marks?: Mark[]
}

export interface InstructionItem extends ListItem {
  completed: boolean
  current: boolean
  notes?: string[]
}

export interface Note {
  title?: string
  content: Paragraph[]
}

export interface Paragraph {
  text: string
  marks?: Mark[]
}

export type Mark = "em" | "strong" | "sub" | "sup" | "strike"

export interface Summary {
  content: string
}
