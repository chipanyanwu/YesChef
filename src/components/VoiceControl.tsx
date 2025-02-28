import "regenerator-runtime/runtime"
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition"
import { Button } from "./ui/button"
import { useEffect } from "react"

interface VoiceControlProps {
  isListening: boolean
  toggleListening: () => void
  onTranscription: (spokenText: string) => void
  disabled: boolean
  continuous?: boolean
}

const VoiceControl = ({
  isListening,
  toggleListening,
  onTranscription,
  disabled,
  continuous = false,
}: VoiceControlProps) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition()

  useEffect(() => {
    if (continuous) {
      if (isListening && !listening) {
        resetTranscript()
        SpeechRecognition.startListening({ continuous: continuous })
      } else if (!isListening && listening) {
        SpeechRecognition.stopListening()
      }
    }
  }, [continuous, isListening, listening, resetTranscript])

  useEffect(() => {
    if (listening) {
      onTranscription(transcript)
    }
  }, [listening, onTranscription, transcript])

  const toggle = () => {
    if (continuous) {
      toggleListening()
      return
    }

    if (listening) {
      SpeechRecognition.stopListening()
    } else {
      resetTranscript()
      SpeechRecognition.startListening()
    }
  }

  return (
    <>
      {browserSupportsSpeechRecognition && (
        <Button
          variant={"default"}
          onClick={toggle}
          className="bg-app_teal hover:bg-app_teal_dark h-[60px] w-[15%] object-contain"
          disabled={disabled}
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
      )}
    </>
  )
}

export default VoiceControl
