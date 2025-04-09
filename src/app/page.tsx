"use client"
import { useRef, useState } from 'react';
import { askGemini } from '@/app/chat';
//tes

export default function Page() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; content: string }[]>([]);
  const [listening, setListening] = useState(false);
  const [persona, setPersona] = useState('You are a helpful assistant.');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const speak = (text: string) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.onend = () => startListening();
    synth.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Speech recognition not supported');

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      handleAsk(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setListening(false);
      if (event.error === 'no-speech') startListening();
    };

    recognition.onend = () => setListening(false);

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopAll = () => {
    recognitionRef.current?.stop();
    window.speechSynthesis.cancel();
    setListening(false);
  };

  const handleAsk = async (prompt?: string) => {
    const text = prompt ?? input;
    if (!text.trim()) return;
    
    const newMessages: { role: 'user' | 'bot'; content: string }[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    const res = await askGemini('You are a helpful assistant.', text);
    const botReply: { role: 'user' | 'bot'; content: string } = { role: 'bot', content: res };
    setMessages([...newMessages, botReply]);
    speak(res);
    
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Talk to Gemini</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Choose Role / Persona</label>
        <select
          className="border p-2 rounded w-full"
          value={persona}
          onChange={(e) => setPersona(e.target.value)}
        >
          <option className='text-black' value="You are a helpful assistant.">Helpful Assistant</option>
          <option className='text-black' value="You are a friendly doctor who gives health advice in simple terms.">Doctor</option>
          <option className='text-black' value="You are a tech support agent who helps troubleshoot software issues.">Tech Support</option>
          <option className='text-black' value="You are a wise philosopher who answers with deep thought.">Philosopher</option>
        </select>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={listening ? stopAll : startListening}
          className={`px-4 py-2 rounded text-white ${listening ? 'bg-red-500' : 'bg-green-500'}`}
        >
          {listening ? '🛑 Stop All' : '🎙️ Start Listening'}
        </button>
        <button
          onClick={() => setMessages([])}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Clear Chat
        </button>
      </div>

      <div className='h-full flex justify-center items-center'>
        {listening && (
          <div className="loader my-4">
            <div className="box">
              <div className="logo">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 94 94"
                  className="svg"
                >
                  <path d="M38.0481 4.82927C38.0481 2.16214 40.018 0 42.4481 0H51.2391C53.6692 0 55.6391 2.16214 55.6391 4.82927V40.1401C55.6391 48.8912 53.2343 55.6657 48.4248 60.4636C43.6153 65.2277 36.7304 67.6098 27.7701 67.6098C18.8099 67.6098 11.925 65.2953 7.11548 60.6663C2.37183 56.0036 3.8147e-06 49.2967 3.8147e-06 40.5456V4.82927C3.8147e-06 2.16213 1.96995 0 4.4 0H13.2405C15.6705 0 17.6405 2.16214 17.6405 4.82927V39.1265C17.6405 43.7892 18.4805 47.2018 20.1605 49.3642C21.8735 51.5267 24.4759 52.6079 27.9678 52.6079C31.4596 52.6079 34.0127 51.5436 35.6268 49.4149C37.241 47.2863 38.0481 43.8399 38.0481 39.0758V4.82927Z" />
                  <path d="M86.9 61.8682C86.9 64.5353 84.9301 66.6975 82.5 66.6975H73.6595C71.2295 66.6975 69.2595 64.5353 69.2595 61.8682V4.82927C69.2595 2.16214 71.2295 0 73.6595 0H82.5C84.9301 0 86.9 2.16214 86.9 4.82927V61.8682Z" />
                  <path d="M2.86102e-06 83.2195C2.86102e-06 80.5524 1.96995 78.3902 4.4 78.3902H83.6C86.0301 78.3902 88 80.5524 88 83.2195V89.1707C88 91.8379 86.0301 94 83.6 94H4.4C1.96995 94 0 91.8379 0 89.1707L2.86102e-06 83.2195Z" />
                </svg>
              </div>
            </div>
            <div className="box"></div>
            <div className="box"></div>
            <div className="box"></div>
            <div className="box"></div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 mb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[75%] rounded-lg px-4 py-2 ${
              msg.role === 'user'
                ? 'bg-indigo-500 text-black self-end text-right'
                : 'bg-gray-100 text-black self-start text-left'
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>
    </div>
  );
}
