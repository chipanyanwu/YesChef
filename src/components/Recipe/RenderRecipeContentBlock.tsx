import { ContentBlock } from "@/types/AIResponse";
import RenderRecipeNoteBlock from "./RenderRecipeNoteBlock";
import RenderRecipeSection from "./RenderRecipeSection";

type Props = {
    content: ContentBlock;
};

export default function RenderRecipeContentBlock({ content }: Props) {
    return (
        <div className="recipe-content-block">
            {content.type === "section" ? (
                // type === section || note -- if not section then note
                <RenderRecipeSection section={content} />
            ) : (
                <RenderRecipeNoteBlock note={content} />
            )}
        </div>
    );
}
