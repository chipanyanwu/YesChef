import { useEffect, useState } from 'react';

const VoiceControl: React.FC = () => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const SpeechRecognitionConstructor = 
    window.SpeechRecognition || (window as any).webkitSpeechRecognition;
  let recognition: SpeechRecognition | null = null;

  useEffect(() => {
    if (SpeechRecognitionConstructor) {
      recognition = new SpeechRecognitionConstructor();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const lastResultIndex = event.results.length - 1;
        const spokenText = event.results[lastResultIndex][0].transcript;
        setTranscript(spokenText);
        speakText(`You said: ${spokenText}`);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event);
      };

      recognition.onend = () => {
        setListening(false);
      };
    } else {
      console.warn('Speech Recognition API not supported in this browser.');
    }

    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!listening) {
      startListening();
    } else {
      stopListening();
    }
  };

  const startListening = () => {
    if (recognition) {
      setListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setListening(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech synthesis api not supported in this browser.');
    }
  };

  return (
    <div className="voice-control p-4 border rounded shadow">
      <button
        onClick={toggleListening}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {listening ? 'Stop Listening' : 'Start Listening'}
      </button>
      {transcript && (
        <div className="mt-4">
          <p>Recognized Text: {transcript}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceControl;
