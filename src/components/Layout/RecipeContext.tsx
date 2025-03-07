import { RecipeResponse } from "@/types/recipeResponse"
import { ChatMessage } from "@/types/chats"
import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react"

interface RecipeContextType {
  rawRecipe: RecipeResponse | null
  prevRecipe: RecipeResponse | null
  updateRecipe: (newRecipe: RecipeResponse) => void
  chatHistory: ChatMessage[]
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  notInit: () => Promise<void>
  callInit: () => void
  showRendering: boolean
  isInit: boolean
}

const RecipeContext = createContext<RecipeContextType>({
  rawRecipe: null,
  prevRecipe: null,
  updateRecipe: () => {},
  chatHistory: [],
  setChatHistory: () => {},
  notInit: async () => {},
  callInit: () => {},
  showRendering: false,
  isInit: true,
})

// eslint-disable-next-line react-refresh/only-export-components
export const useRecipe = () => useContext(RecipeContext)

export const RecipeProvider = ({ children }: { children: ReactNode }) => {
  const [rawRecipe, setRawRecipe] = useState<RecipeResponse | null>(null)
  const [prevRecipe, setPrevRecipe] = useState<RecipeResponse | null>(null)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [isInit, setIsInit] = useState(true)
  const [showRendering, setShowRendering] = useState(false)

  const delay = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms))

  const notInit = useCallback(async () => {
    setIsInit(false)
    await delay(1200)
    setShowRendering(true)
  }, [])

  const callInit = useCallback(() => {
    setShowRendering(false)
    setIsInit(true)
  }, [])

  const updateRecipe = useCallback(
    (newRecipe: RecipeResponse) => {
      setPrevRecipe(rawRecipe)
      setRawRecipe(newRecipe)
    },
    [rawRecipe]
  )

  const value = useMemo(
    () => ({
      rawRecipe,
      prevRecipe,
      updateRecipe,
      chatHistory,
      setChatHistory,
      notInit,
      callInit,
      showRendering,
      isInit,
    }),
    [
      rawRecipe,
      prevRecipe,
      updateRecipe,
      chatHistory,
      notInit,
      callInit,
      showRendering,
      isInit,
    ]
  )

  return (
    <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>
  )
}
