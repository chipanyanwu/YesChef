import { Metadata } from "@/types/AIResponse";

type Props = {
    meta: Metadata;
};

export const RenderRecipeMetadata = ({ meta }: Props) => {
    return (
        <div className="recipe-metadata flex my-2">
            {meta.yield && (
                <div className="metadata-yield rounded-full px-2 py-1 bg-gray-100">
                    <p>Yield : {meta.yield}</p>
                </div>
            )}
            {meta.prepTime && (
                <div className="metadata-yield rounded-full px-2 py-1 bg-gray-100">
                    <p>Preparation Time : {meta.prepTime} minutes</p>
                </div>
            )}
            {meta.cookTime && (
                <div className="metadata-yield rounded-full px-2 py-1 bg-gray-100">
                    <p>Cook Time : {meta.cookTime} minutes</p>
                </div>
            )}
            {meta.totalTime && (
                <div className="metadata-yield rounded-full px-2 py-1 bg-gray-100">
                    <p>Total : {meta.totalTime} minutes</p>
                </div>
            )}
        </div>
    );
};
