import { useEffect, useRef, useState, useCallback } from "react"
import { useRecipe } from "../Layout/RecipeContext"
import { queryGemini } from "@/lib/Gemini"
import { ChatMessage } from "@/types/chats"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { ChatBubble } from "./ChatBubble"
import VoiceControl from "./VoiceControl"
import SpeechRecognition from "react-speech-recognition"

export const ChatWindow = () => {
  const [listening, setListening] = useState<boolean>(false)
  const [inputContent, setInputContent] = useState("")
  const [generationState, setGenerationState] = useState(false)
  const [isChefSpeaking, setIsChefSpeaking] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const endOfMessagesRef = useRef<HTMLDivElement>(null)
  const {
    updateRecipe,
    rawRecipe,
    chatHistory,
    setChatHistory,
    notInit,
    isInit,
  } = useRecipe()

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      inputRef.current.style.height = `${Math.min(
        inputRef.current.scrollHeight,
        275
      )}px`
    }
  }, [inputContent])

  useEffect(() => {
    if (chatHistory.length === 1 && isInit) {
      notInit()
    }
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatHistory, notInit, isInit])

  const handleInputChange = useCallback((value: string) => {
    setInputContent(value)
  }, [])

  const speakMessage = useCallback(
    (message: string) => {
      if ("speechSynthesis" in window) {
        if (listening) {
          SpeechRecognition.stopListening()
        }

        const voices = window.speechSynthesis.getVoices()
        const utterance = new SpeechSynthesisUtterance(message)
        utterance.voice = voices[0]
        utterance.lang = "en-US"
        setIsChefSpeaking(true)
        utterance.onend = () => {
          setIsChefSpeaking(false)
          if (listening) {
            SpeechRecognition.startListening({ continuous: true })
          }
        }
        window.speechSynthesis.speak(utterance)
      } else {
        console.warn("Speech synthesis API not supported in this browser.")
      }
    },
    [listening]
  )

  const handleInputSubmit = useCallback(
    async (overrideText?: string) => {
      const messageText =
        overrideText !== undefined ? overrideText : inputContent
      if (!messageText.trim()) return

      setChatHistory((prev: ChatMessage[]) => [
        ...prev,
        { message: messageText, role: "USER" },
      ])
      setInputContent("")
      setGenerationState(true)

      try {
        const response = await queryGemini(messageText, rawRecipe, chatHistory)
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
    },
    [
      inputContent,
      chatHistory,
      rawRecipe,
      setChatHistory,
      updateRecipe,
      speakMessage,
    ]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleInputSubmit()
    } else if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault()
      setInputContent((prev) => prev + "\n")
    }
  }

  const handleVoiceSubmit = useCallback(
    (transcribedText: string) => {
      handleInputSubmit(transcribedText)
    },
    [handleInputSubmit]
  )

  return (
    <div className="shadow-inner w-full h-full bg-white rounded-lg py-3 px-4 relative overflow-y-auto border">
      <div className="flex flex-col gap-2 max-h-[86%] overflow-y-auto">
        {chatHistory.length > 0 ? (
          chatHistory.map((chatMsg, idx) => (
            <ChatBubble message={chatMsg} key={idx} />
          ))
        ) : (
          <>
            <p className="text-center w-full mt-5 font-bold">
              Welcome to YesChef! Paste a recipe page (all ads and pictures
              included) to get started.
            </p>
            <p className="text-center w-full">
              YesChef! will start a user session and guide you through the
              recipe, one step at a time.
            </p>
          </>
        )}
        {generationState && <ChatBubble loading key="loading" />}
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
          toggleListening={() => setListening((prev) => !prev)}
          onTranscription={handleInputChange}
          onSubmit={handleVoiceSubmit}
          disabled={generationState || isChefSpeaking}
        />
        <Button
          variant="default"
          className="bg-app_teal hover:bg-app_teal_dark h-[60px] w-[15%] object-contain"
          onClick={() => handleInputSubmit()}
          disabled={generationState}
        >
          <img
            src={`/vectors/chef-hat-and-spatula.svg`}
            className="h-full"
            alt="Submit"
          />
        </Button>
      </div>
    </div>
  )
}

export default ChatWindow
