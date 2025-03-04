import { ListContent, ListItem, TextContent } from "@/types/AIResponse";
import { renderTextContent } from "./RenderRecipeParagraph";

/**
 * 
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

 */

type Props = {
    list: ListContent;
};

function RenderRecipeList({ list }: Props) {
    const renderListItem = (listItem: ListItem, idx: number) => {
        let content: React.ReactNode = listItem.text;

        // rendering <li> guys for everything -- format on completion
        if (listItem.completed ?? false) {
            content = (
                <li key={idx}>
                    <div className="completed-recipe-list-item bg-gray-300 p-3">
                        {renderTextContent({
                            text: listItem.text,
                            marks: listItem.marks,
                        } as TextContent)}
                    </div>
                </li>
            );
        } else if (listItem.current) {
            content = (
                <li key={idx}>
                    <div className="current-recipe-list-item bg-green-200 p-3">
                        {renderTextContent({
                            text: listItem.text,
                            marks: listItem.marks,
                        } as TextContent)}
                    </div>
                </li>
            );
        } else {
            // list item jus regular no current no completed:
            content = (
                <li key={idx}>
                    <div className="regular-recipe-list-item p-3">
                        {renderTextContent({
                            text: listItem.text,
                            marks: listItem.marks,
                        } as TextContent)}
                    </div>
                </li>
            );
        }

        if (listItem.notes && listItem.notes.length > 0) {
            content = (
                <div className="list-item-with-notes" key={idx}>
                    {content}
                    <div className="list-item-note flex flex-col gap-1 p-2 bg-gray-50">
                        {listItem.notes.map((note: string) => (
                            <p className="italic text-gray-700">{note}</p>
                        ))}
                    </div>
                </div>
            );
        }

        return content;
    };

    return (
        <div className="recipe-list-block">
            {list.ordered ? (
                <ol>
                    {list.items.map((item: ListItem, idx) => {
                        return renderListItem(item, idx);
                    })}
                </ol>
            ) : (
                <ul>
                    {list.items.map((item: ListItem, idx) => {
                        return renderListItem(item, idx);
                    })}
                </ul>
            )}
        </div>
    );
}

export default RenderRecipeList;
