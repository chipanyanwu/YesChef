import { useRecipe } from "@/context/RecipeContext";
import { ContentBlock, RecipeResponse } from "@/types/AIResponse";
import RenderRecipeContentBlock from "./RenderRecipeContentBlock";
import { RenderRecipeMetadata } from "./RenderRecipeMetadata";

type Props = {};

export default function RenderRecipe({}: Props) {
    // render the recipe, item by item

    const { rawRecipe } = useRecipe();
    let rawJSON = {
        recipe: {
            title: "No recipe to display...",
            content: [
                {
                    type: "note",
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
    } as RecipeResponse;

    if (rawRecipe) {
        rawJSON = rawRecipe;
    }

    const recipeJson = rawJSON.recipe;

    return (
        <div className="full-rendered-recipe rendered-recipe-content  ">
            <h1>{recipeJson.title}</h1>

            {recipeJson.metadata && (
                <RenderRecipeMetadata meta={recipeJson.metadata} />
            )}

            {recipeJson.description && (
                <div className="recipe-description bg-gray-50 p-4">
                    <p>{recipeJson.description}</p>
                </div>
            )}

            {recipeJson.content.map((contentBlock: ContentBlock) => (
                <RenderRecipeContentBlock content={contentBlock} />
            ))}
        </div>
    );
}
