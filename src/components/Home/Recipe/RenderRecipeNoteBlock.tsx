import { Note, Paragraph } from "@/types/AIResponse";
import RenderRecipeParagraph from "./RenderRecipeParagraph";

type Props = {
    note: Note;
};

export default function RenderRecipeNoteBlock({ note }: Props) {
    return (
        <div className="recipe-note bg-gray-50 p-3">
            {note.title && <h3>{note.title}</h3>}
            <div className="italic text-gray-700">
                {note.content.map((p: Paragraph, idx) => (
                    <RenderRecipeParagraph paragraph={p} key={idx} />
                ))}
            </div>
        </div>
    );
}
