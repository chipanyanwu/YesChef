import { ListContent, ListItem } from "@/types/AIResponse";
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
    const renderListItem = (listItem: ListItem) => {
        let content: React.ReactNode = listItem.text;

        // rendering <li> guys for everything
        if (listItem.completed ?? false) {
            content = (
                <li>
                    <div className="completed-list-item bg-gray-100 p-3">
                        {renderTextContent({
                            text: listItem.text,
                            marks: listItem.marks,
                        })}
                    </div>
                </li>
            );
        }
    };

    return <div>RenderRecipeList</div>;
}

export default RenderRecipeList;
