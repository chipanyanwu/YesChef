import { useEffect, useRef, useState } from "react"
import { useRecipe } from "@/context/RecipeContext"
import { geminiPreliminaryMessage, queryGemini_2_0 } from "@/lib/gemini/Gemini"
import { ChatMessage } from "@/types/chats"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { ChatBubble } from "./ChatBubble"
import VoiceControl from "../VoiceControl"

export const ChatWindow = () => {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const endOfMessagesRef = useRef<HTMLDivElement>(null)
  const [inputContent, setInputContent] = useState("")
  const [generationState, setGenerationState] = useState(false)
  const textAreaMaxHeightPx = 275
  const { updateRecipe, rawRecipe, chatHistory, setChatHistory, notInit } =
    useRecipe()

  // Callback for handling voice transcriptions from VoiceControl
  const handleVoiceTranscription = (spokenText: string) => {
    setInputContent(spokenText)
  }

  const adjustTextAreaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      inputRef.current.style.height = `${Math.min(
        inputRef.current.scrollHeight,
        textAreaMaxHeightPx
      )}px`
    }
  }

  function handleInputChange(curr: string) {
    setInputContent(curr)
  }

  async function handleInputSubmit() {
    if (!inputContent) return

    // add user message
    setChatHistory((prev: ChatMessage[]) => [
      ...prev,
      { message: inputContent, role: "USER" },
    ])
    const query = inputContent
    setInputContent("")
    setGenerationState(true)

    // FIRST MESSAGE: use geminiPreliminaryMessage
    if (chatHistory.length <= 1) {
      const response = await geminiPreliminaryMessage(query)
      setGenerationState(false)
      setChatHistory((prev: ChatMessage[]) => [
        ...prev,
        { message: response.summary, role: "BOT" },
      ])
      updateRecipe(response.editedHTML)
      return
    }

    // Subsequent messages: use queryGemini_2_0
    const response = await queryGemini_2_0(query, rawRecipe, chatHistory)
    let updatedRecipe = rawRecipe
    let newBotResponse =
      "Sorry, something went wrong on my end, try asking again in a second?"
    if (response?.editedHTML && response?.summary) {
      updatedRecipe = response.editedHTML
      newBotResponse = response.summary
    }
    setGenerationState(false)
    setChatHistory((prev: ChatMessage[]) => [
      ...prev,
      { message: newBotResponse, role: "BOT" },
    ])
    updateRecipe(updatedRecipe)
  }

  useEffect(() => {
    if (inputRef.current) {
      adjustTextAreaHeight()
    }
  }, [inputContent])

  useEffect(() => {
    if (chatHistory.length === 1) {
      notInit()
    }
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatHistory, notInit])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleInputSubmit()
    } else if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault()
      setInputContent((prev) => prev + "\n")
    }
  }

  return (
    <div
      className="w-full h-full bg-inherit rounded-lg py-3 px-2 relative overflow-y-auto"
      style={{ boxShadow: `inset 0 0 30px 10px rgba(0, 0, 0, 0.03)` }}
    >
      <div className="flex flex-col gap-2 max-h-[86%] overflow-y-auto">
        {chatHistory.length > 0 ? (
          chatHistory.map((chatMsg, idx) => (
            <ChatBubble message={chatMsg} key={idx} />
          ))
        ) : (
          <p className="text-center w-full mt-5">
            Paste a recipe, or start asking Chef some questions!
          </p>
        )}
        <div className="scrollTo-ref" ref={endOfMessagesRef} />
      </div>

      <div className="user-input-field absolute bottom-2 w-full -ml-3 p-2 flex justify-center items-end gap-3 z-30">
        <Textarea
          className="w-[80%] overflow-y-auto resize-none bg-white z-40"
          placeholder="Ask Chef..."
          ref={inputRef}
          value={inputContent}
          onChange={(e) => {
            e.preventDefault()
            handleInputChange(e.target.value)
          }}
          disabled={generationState}
          onKeyDown={handleKeyDown}
        />

        {/* The VoiceControl component now handles speech-to-text */}
        <VoiceControl
          onTranscription={handleVoiceTranscription}
          disabled={generationState}
        />

        <Button
          variant={"default"}
          className="bg-app_teal hover:bg-app_teal_dark h-[60px] w-[15%] object-contain"
          onClick={handleInputSubmit}
          disabled={generationState}
        >
          <img src={`/vectors/chef-hat-and-spatula.svg`} className="h-full" />
        </Button>
      </div>
    </div>
  )
}
