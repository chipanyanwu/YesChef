import { Section } from "@/types/AIResponse";
import RenderRecipeList from "./RenderRecipeList";
import RenderRecipeParagraph from "./RenderRecipeParagraph";

type Props = {
    section: Section;
};

export default function RenderRecipeSection({ section }: Props) {
    return (
        <div>
            <h2 className="recipe-section-title">{section.title}</h2>
            {section.content.type === "paragraph" ? (
                <RenderRecipeParagraph paragraph={section.content} />
            ) : (
                <RenderRecipeList list={section.content} />
            )}
        </div>
    );
}
