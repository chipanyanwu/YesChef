export type RecipeResponse = {
    recipe: Recipe;
    summary: Summary;
};

type Recipe = {
    title: string;
    metadata?: Metadata;
    description?: string;
    content: ContentBlock[];
};

type Metadata = {
    yield?: string;
    prepTime?: string;
    cookTime?: string;
    totalTime?: string;
};

type ContentBlock = Section | Note;

type Section = {
    type: "section";
    title: string;
    content: ListContent | Paragraph;
};

type Note = {
    type: "note";
    title?: string;
    content: Paragraph[];
};

type ListContent = {
    type: "list";
    ordered: boolean;
    items: ListItem[];
};

type ListItem = {
    text: string;
    completed?: boolean; // Optional, only for instruction steps
    current?: boolean; // Optional, only for instruction steps
    notes?: string[];
    marks?: Mark[];
};

type Paragraph = {
    type: "paragraph";
    content: TextContent[];
};

type TextContent = {
    text: string;
    marks?: Mark[];
};

type Mark = "em" | "strong" | "sub" | "sup"; // Add more as needed

type Summary = {
    content: string;
};
