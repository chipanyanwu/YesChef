import { Paragraph, TextContent } from "@/types/AIResponse";

type Props = {
    paragraph: Paragraph;
};

export const renderTextContent = (textContent: TextContent) => {
    let content: React.ReactNode = textContent.text;

    // Apply marks in order of priority (if multiple marks exist)
    if (textContent.marks) {
        textContent.marks.forEach((mark) => {
            switch (mark) {
                case "em":
                    content = <em>{content}</em>;
                    break;
                case "strong":
                    content = <strong>{content}</strong>;
                    break;
                case "sub":
                    content = <sub>{content}</sub>;
                    break;
                case "sup":
                    content = <sup>{content}</sup>;
                    break;
                default:
                    break;
            }
        });
    }

    return content;
};

export default function RenderRecipeParagraph({ paragraph }: Props) {
    return (
        <div className="recipe-paragraph">
            <p className="recipe-paragraph-content">
                {paragraph.content.map((textContent, index) => (
                    <span key={index}>{renderTextContent(textContent)}</span>
                ))}
            </p>
        </div>
    );
}
