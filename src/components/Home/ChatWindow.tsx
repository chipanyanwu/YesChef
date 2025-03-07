import { useEffect, useRef, useState, useCallback } from "react"
import { useRecipe } from "../Layout/RecipeContext"
import { queryGemini } from "@/lib/Gemini"
import { ChatMessage } from "@/types/chats"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { ChatBubble } from "./ChatBubble"
import VoiceControl from "./VoiceControl"

export const ChatWindow = () => {
  const CONTINUOUS_LISTENING = false
  const [listening, setListening] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const endOfMessagesRef = useRef<HTMLDivElement>(null)
  const [inputContent, setInputContent] = useState("")
  const [generationState, setGenerationState] = useState(false)
  const {
    updateRecipe,
    rawRecipe,
    chatHistory,
    setChatHistory,
    notInit,
    isInit,
  } = useRecipe()

  // Adjust textarea height when input changes.
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      inputRef.current.style.height = "auto"
      inputRef.current.style.height = `${Math.min(
        inputRef.current.scrollHeight,
        275
      )}px`
    }
  }, [inputContent])

  // Auto-scroll to the latest message.
  useEffect(() => {
    if (chatHistory.length === 1 && isInit) {
      notInit()
    }
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatHistory, notInit, isInit])

  const handleVoiceTranscription = useCallback(
    (spokenText: string) => {
      if (listening || !CONTINUOUS_LISTENING) {
        setInputContent(spokenText)
      }
    },
    [CONTINUOUS_LISTENING, listening]
  )

  const handleInputChange = useCallback((value: string) => {
    setInputContent(value)
  }, [])

  const speakMessage = useCallback((message: string) => {
    if ("speechSynthesis" in window) {
      const voices = window.speechSynthesis.getVoices()
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.voice = voices[1] || voices[0]
      utterance.lang = "en-US"
      window.speechSynthesis.speak(utterance)
    } else {
      console.warn("Speech synthesis API not supported in this browser.")
    }
  }, [])

  const handleInputSubmit = useCallback(async () => {
    if (!inputContent.trim()) return

    // Add user message.
    setChatHistory((prev: ChatMessage[]) => [
      ...prev,
      { message: inputContent, role: "USER" },
    ])
    setListening(false)
    setInputContent("")
    setGenerationState(true)

    try {
      // Always call the unified queryGemini function.
      const response = await queryGemini(inputContent, rawRecipe, chatHistory)
      setChatHistory((prev: ChatMessage[]) => [
        ...prev,
        { message: response.summary.content, role: "BOT" },
      ])
      speakMessage(response.summary.content)
      updateRecipe(response)
    } catch (error) {
      console.error("Error during input submission", error)
    } finally {
      setGenerationState(false)
    }
  }, [
    inputContent,
    chatHistory,
    rawRecipe,
    setChatHistory,
    updateRecipe,
    speakMessage,
  ])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleInputSubmit()
    } else if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault()
      setInputContent((prev) => prev + "\n")
    }
  }

  const toggleListening = () => setListening((prev) => !prev)

  return (
    <div className="shadow-inner w-full h-full bg-white rounded-lg py-3 px-4 relative overflow-y-auto border">
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
        <div ref={endOfMessagesRef} />
      </div>

      <div className="user-input-field absolute bottom-2 w-full -ml-4 p-2 flex justify-center items-end gap-3 z-30">
        <Textarea
          className="w-[80%] overflow-y-auto resize-none bg-white z-40"
          placeholder="Ask Chef..."
          ref={inputRef}
          value={inputContent}
          onChange={(e) => handleInputChange(e.target.value)}
          disabled={generationState}
          onKeyDown={handleKeyDown}
        />

        <VoiceControl
          isListening={listening}
          toggleListening={toggleListening}
          onTranscription={handleVoiceTranscription}
          disabled={generationState}
          continuous={CONTINUOUS_LISTENING}
        />

        <Button
          variant="default"
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
