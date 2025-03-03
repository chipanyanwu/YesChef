import { RecipeResponse } from "@/types/AIResponse";
import { ChatMessage } from "@/types/chats";
import { createContext, ReactNode, useContext, useState } from "react";

interface RecipeContextType {
  rawRecipe: RecipeResponse | null;
  prevRecipe: RecipeResponse | null;
  updateRecipe: (newRecipe: RecipeResponse) => void;
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  notInit: () => void;
  callInit: () => void;
  showRendering: boolean;
  isInit: boolean;
}

const RecipeContext = createContext<RecipeContextType>({
  rawRecipe: null,
  prevRecipe: null,
  updateRecipe: () => {},
  chatHistory: [],
  setChatHistory: () => {},
  notInit: () => {},
  callInit: () => {},
  showRendering: false,
  isInit: true,
});

// eslint-disable-next-line react-refresh/only-export-components
export const useRecipe = () => useContext(RecipeContext);

export const RecipeProvider = ({ children }: { children: ReactNode }) => {
  const [rawRecipe, setRawRecipe] = useState<RecipeResponse | null>(null);
  const [prevRecipe, setPrevRecipe] = useState<RecipeResponse | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const [isInit, setIsInit] = useState(true);
  const [showRendering, setShowRendering] = useState(false);
  const delayMS = 1200;

  async function delay(ms: number) {
    return new Promise<void>((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  async function notInit() {
    setIsInit(!isInit);
    await delay(delayMS);
    setShowRendering(!showRendering);
  }

  async function callInit() {
    setShowRendering(false);
    setIsInit(true);
  }

  function updateRecipe(newRecipe: RecipeResponse) {
    // function to update recipe to preserve a backup if AI gives us garbage
    setPrevRecipe(rawRecipe);
    setRawRecipe(newRecipe);
  }

  const value = {
    rawRecipe,
    prevRecipe,
    updateRecipe,
    chatHistory,
    setChatHistory,
    notInit,
    callInit,
    showRendering,
    isInit,
  };

  return (
    <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>
  );
};
