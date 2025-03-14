import { RecipeResponse } from "@/types/recipeResponse"
import { ChatMessage } from "@/types/chats"
import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react"
import { googleImageSearch } from "@/lib/googleImageSearch"

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
  showImage: boolean
  setShowImage: React.Dispatch<React.SetStateAction<boolean>>
  currentImages: string[]
  currentInstruction: number
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
  showImage: false,
  setShowImage: () => {},
  currentImages: [],
  currentInstruction: -1,
})

// eslint-disable-next-line react-refresh/only-export-components
export const useRecipe = () => useContext(RecipeContext)

export const RecipeProvider = ({ children }: { children: ReactNode }) => {
  const [rawRecipe, setRawRecipe] = useState<RecipeResponse | null>(null)
  const [prevRecipe, setPrevRecipe] = useState<RecipeResponse | null>(null)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [isInit, setIsInit] = useState(true)
  const [showRendering, setShowRendering] = useState(false)
  const [showImage, setShowImage] = useState(false)
  const [currentImages, setCurrentImages] = useState<string[]>([])
  const [currentInstruction, setCurrentInstruction] = useState(-1)

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
    async (newRecipe: RecipeResponse) => {
      setPrevRecipe(rawRecipe)

      const instructions = newRecipe.recipe.instructions.items

      const updatedInstructions = await Promise.all(
        instructions.map(async (instruction) => {
          if (instruction.isQuery && typeof instruction.image == "string") {
            const query = instruction.image
            const photoLinks = await googleImageSearch(query)
            if (photoLinks) {
              photoLinks.push("https://placehold.co/300x200")
              return {
                ...instruction,
                image: photoLinks,
                isQuery: false,
              }
            } else {
              return instruction
            }
          } else {
            return instruction
          }
        })
      )

      const updatedRecipe = {
        ...newRecipe,
        recipe: {
          ...newRecipe.recipe,
          instructions: {
            ...newRecipe.recipe.instructions,
            items: updatedInstructions,
          },
        },
      }

      setRawRecipe(updatedRecipe)
    },
    [rawRecipe]
  )

  useEffect(() => {
    if (rawRecipe) {
      const instructions = rawRecipe.recipe.instructions.items
      const currentIndex = instructions.findIndex(
        (instruction) => instruction.current
      )

      if (currentIndex !== -1) {
        setCurrentInstruction(currentIndex)

        const currInstruction = instructions[currentIndex]
        if (
          !currInstruction.isQuery &&
          currInstruction.image &&
          typeof currInstruction.image == "object"
        ) {
          setCurrentImages(currInstruction.image)
          setShowImage(true)
        }
      } else {
        setShowImage(false)
      }
    }
  }, [rawRecipe])

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
      showImage,
      setShowImage,
      currentImages,
      currentInstruction,
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
      showImage,
      setShowImage,
      currentImages,
      currentInstruction,
    ]
  )

  return (
    <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>
  )
}
