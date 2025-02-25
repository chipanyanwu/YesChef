import { useRecipe } from "@/context/RecipeContext"
import { geminiPreliminaryMessage, queryGemini_2_0 } from "@/lib/gemini/Gemini"
import { ChatMessage } from "@/types/chat-entry"
import { useEffect, useRef, useState } from "react"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { ChatBubble } from "./ChatBubble"

export const ChatWindow = () => {
  // considered using card here but may make more sense to just design our own.
  // this chat window expects to take up the full dimensions offered to it, so it should
  // be placed in a div which decides its dimensions when called.

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const endOfMessagesRef = useRef<HTMLDivElement>(null)
  const [inputContent, setInputContent] = useState("")
  const [generationState, setGenerationState] = useState(false) // not currently generating a response
  const textAreaMaxHeightPx = 275
  const { updateRecipe, rawRecipe, chatHistory, setChatHistory, notInit } = useRecipe()

  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)


  function handleInputChange(curr: string) {
    // controlled component
    setInputContent(curr)
  }

  async function handleInputSubmit() {

    // console.log(`call to input submit`);
    if (!inputContent) {
      return
    }
    setChatHistory((prev: ChatMessage[]) => {
      const ch = [
        ...prev,
        { message: inputContent, role: "USER" } as ChatMessage,
      ]
      return ch
    })

    const query = inputContent
    setInputContent("")

    // here is where we will actually send the user input to the ai.
    // for now we pretend it immediately sends back a reponse.

    setGenerationState(true)

    // handle FIRST MESSAGE case
    if (chatHistory.length <= 1) { // we have already added this message to the list
      const response = await geminiPreliminaryMessage(query); // add user context once we have it

      const generatedHTML = response.editedHTML;
      const generatedResp = response.summary;

      setGenerationState(false);

      setChatHistory((prev: ChatMessage[]) => {
        const ch = [
          ...prev,
          { message: generatedResp, role: "BOT" } as ChatMessage,
        ]
        return ch
      });

      updateRecipe(generatedHTML);

      return;

    }

    const response = await queryGemini_2_0(query, rawRecipe, chatHistory)

    let updatedRecipe = rawRecipe
    let newBotResponse =
      "Sorry, something went wrong on my end, try asking again in a second?"

    if (response?.editedHTML && response?.summary) {
      updatedRecipe = response.editedHTML
      newBotResponse = response.summary
    }
    setGenerationState(false)

    setChatHistory((prev: ChatMessage[]) => {
      const ch = [
        ...prev,
        { message: newBotResponse, role: "BOT" } as ChatMessage,
      ]
      return ch
    })

    updateRecipe(updatedRecipe)
  }

  useEffect(() => {
    const SpeechRecognitionConstructor =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognitionConstructor) {
      recognitionRef.current = new SpeechRecognitionConstructor()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const lastResultIndex = event.results.length - 1
        const spokenText = event.results[lastResultIndex][0].transcript

        setInputContent(prev => (prev ? prev + " " : "") + spokenText)
        
        // after listening to the user, it should automatically submit to the ai

        
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event)
      }

      recognitionRef.current.onend = () => {

        setListening(false)
        // console.log(`RESULT OCCURRED : ${spokenText}`);
      }

    } else {
      console.warn("Speech Recognition API not supported in this browser.")
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  const toggleListening = () => {
    if (!listening) {
      if (recognitionRef.current) {
        setListening(true)
        recognitionRef.current.start()
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        setListening(false)
      }
    }
  }

  const adjustTextAreaHeight = () => {
    if (inputRef.current) {
      // reset height to auto calculate new height
      inputRef.current.style.height = "auto"

      // make sure it doesn't go over the max
      inputRef.current.style.height = `${Math.min(
        inputRef.current.scrollHeight,
        textAreaMaxHeightPx
      )}px`
    }
  }



  useEffect(() => {
    if (inputRef.current) {
      adjustTextAreaHeight()
    }
  }, [inputContent])

  useEffect(() => {
    if (chatHistory.length === 1) { // since it starts at 0 and can't be removed, this is good
      notInit();
    }

    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatHistory])

  function handleKeyDown(e : React.KeyboardEvent<HTMLTextAreaElement>) {

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleInputSubmit();
    } else if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      setInputContent((prev) => {
        return prev + "\n";
      });
    }

  }

  return (
    <div
      className="w-full h-full bg-inherit rounded-lg py-3 px-2 relative overflow-y-auto"
      style={{
        boxShadow: `inset 0 0 30px 10px rgba(0, 0, 0, 0.03)`,
      }}
    >
      {/* LOGIC FOR RENDERING DIFFERENT CHATS */}
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
            handleInputChange(e.target.value) // update the actual text entered
          }}
          disabled={generationState}
          onKeyDown={handleKeyDown}
        />
        
        <Button
          variant={"default"}
          onClick={toggleListening}
          className="bg-app_teal hover:bg-app_teal_dark h-[60px] w-[15%] object-contain"
          disabled={generationState}
        >
          <img
            src={listening ? `/vectors/microphone-on.svg` : `/vectors/microphone-off.svg`}
            className="h-[80%]"
            alt={listening ? "Microphone On" : "Microphone Off"}
          />
        </Button>

        <Button
          variant={"default"}
          className="bg-app_teal hover:bg-app_teal_dark h-[60px] w-[15%] object-contain"
          onClick={handleInputSubmit}
          disabled={generationState}
        >
          <img
            src={`/vectors/chef-hat-and-spatula.svg`}
            className="h-full"
          />
        </Button>
      </div>
    </div>
  )
}
