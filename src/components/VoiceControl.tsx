import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition"
import { Button } from "./ui/button"
import { useEffect } from "react"

interface VoiceControlProps {
  isDisabled: boolean
  setTranscript: React.Dispatch<React.SetStateAction<string>>
}

const VoiceControl = ({ isDisabled, setTranscript }: VoiceControlProps) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition()

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening()
      resetTranscript()
    } else {
      SpeechRecognition.startListening()
    }
  }

  useEffect(() => {
    setTranscript(transcript)
  }, [setTranscript, transcript])

  return (
    <>
      {browserSupportsSpeechRecognition && (
        <div className="voice-control p-4 border rounded shadow">
          <Button
            variant={"default"}
            onClick={toggleListening}
            className="bg-app_teal hover:bg-app_teal_dark h-[60px] w-[15%] object-contain"
            disabled={isDisabled}
          >
            <img
              src={
                listening
                  ? `/vectors/microphone-on.svg`
                  : `/vectors/microphone-off.svg`
              }
              className="h-full"
              alt={listening ? "Microphone On" : "Microphone Off"}
            />
          </Button>
        </div>
      )}
    </>
  )
}

export default VoiceControl
