import "regenerator-runtime/runtime"
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition"
import { Button } from "../ui/button"
import { useEffect, useRef } from "react"

interface VoiceControlProps {
  onTranscription: (spokenText: string) => void
  disabled: boolean
  onSubmit: (transcribedText: string) => void
}

const VoiceControl = ({
  onTranscription,
  disabled,
  onSubmit,
}: VoiceControlProps) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition()
  const debounceTimerRef = useRef<number | null>(null);

  const toggle = () => {
    if (disabled) return
    if (listening) {
      SpeechRecognition.stopListening()
    } else {
      resetTranscript()
      SpeechRecognition.startListening({ continuous: true })
    }
  }

  useEffect(() => {
    if (listening) {
      onTranscription(transcript)
    }
  }, [listening, transcript, onTranscription])

  useEffect(() => {
    if (listening) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = window.setTimeout(() => {
        if (transcript.trim() !== "") {
          onSubmit(transcript);
          resetTranscript();
        }
      }, 2000);
    }
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [transcript, listening, onSubmit, resetTranscript]);

  useEffect(() => {
    if (disabled && listening) {
      SpeechRecognition.stopListening()
    }
  }, [disabled, listening])

  return (
    <>
      {browserSupportsSpeechRecognition && (
        <Button
          variant="default"
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