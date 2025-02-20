import { useState, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  detectedLanguage?: string;
  summary?: string;
  translation?: string;
  targetLanguage: string;
  isProcessing: boolean;
  error?: string;
}

const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'es', name: 'Spanish' },
  { code: 'ru', name: 'Russian' },
  { code: 'tr', name: 'Turkish' },
  { code: 'fr', name: 'French' },
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [apisAvailable, setApisAvailable] = useState(true);

  useEffect(() => {
    if (!chrome.ai?.languageDetection || !chrome.ai?.summarizer || !chrome.ai?.translator) {
      setApisAvailable(false);
    }
  }, []);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      targetLanguage: 'en',
      isProcessing: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');

    try {
      const [detection] = await chrome.ai.languageDetection.detect(newMessage.text);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id
            ? { ...msg, detectedLanguage: detection.language, isProcessing: false }
            : msg
        )
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id
            ? { ...msg, error: 'Language detection failed', isProcessing: false }
            : msg
        )
      );
    }
  };

  const handleSummarize = async (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isProcessing: true, error: undefined } : msg
      )
    );

    try {
      const message = messages.find((msg) => msg.id === messageId);
      if (!message) return;

      const summary = await chrome.ai.summarizer.summarize(message.text);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, summary, isProcessing: false } : msg
        )
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, error: 'Summarization failed', isProcessing: false }
            : msg
        )
      );
    }
  };

  const handleTranslate = async (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isProcessing: true, error: undefined } : msg
      )
    );

    try {
      const message = messages.find((msg) => msg.id === messageId);
      if (!message) return;

      const translation = await chrome.ai.translator.translate({
        text: message.text,
        targetLanguage: message.targetLanguage,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, translation: translation.text, isProcessing: false }
            : msg
        )
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, error: 'Translation failed', isProcessing: false }
            : msg
        )
      );
    }
  };

  if (!apisAvailable) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h2 className="text-xl font-semibold text-red-600">Chrome AI APIs not available</h2>
        <p className="text-gray-600 mt-2">
          Please enable experimental features in Chrome flags to use this application.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className="bg-white rounded-lg p-4 shadow-md max-w-[80%] self-start"
          >
            <p className="mb-2 leading-relaxed">{message.text}</p>
            {message.detectedLanguage && (
              <div className="text-sm text-gray-600 mb-2">
                Detected: {
                  supportedLanguages.find((lang) => lang.code === message.detectedLanguage)?.name ||
                  message.detectedLanguage
                }
              </div>
            )}
            {message.error && <div className="text-red-600 mt-2 text-sm">{message.error}</div>}
            {message.summary && (
              <div className="mt-4 p-2 bg-gray-200 rounded">
                <h4 className="font-semibold">Summary:</h4>
                <p>{message.summary}</p>
              </div>
            )}
            {message.translation && (
              <div className="mt-4 p-2 bg-gray-200 rounded">
                <h4 className="font-semibold">
                  Translation ({
                    supportedLanguages.find((lang) => lang.code === message.targetLanguage)?.name ||
                    message.targetLanguage
                  }):
                </h4>
                <p>{message.translation}</p>
              </div>
            )}
            <div className="flex gap-2 mt-4">
              {message.detectedLanguage === 'en' && message.text.length >= 150 && (
                <button
                  onClick={() => handleSummarize(message.id)}
                  disabled={message.isProcessing}
                  className="px-4 py-2 bg-blue-600 text-white rounded opacity-100 hover:opacity-80 disabled:bg-gray-400"
                >
                  {message.isProcessing ? 'Processing...' : 'Summarize'}
                </button>
              )}
              <select
                value={message.targetLanguage}
                onChange={(e) =>
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === message.id ? { ...msg, targetLanguage: e.target.value } : msg
                    )
                  )
                }
                className="px-2 py-1 border rounded border-gray-300"
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleTranslate(message.id)}
                disabled={message.isProcessing}
                className="px-4 py-2 bg-blue-600 text-white rounded opacity-100 hover:opacity-80 disabled:bg-gray-400"
              >
                {message.isProcessing ? 'Processing...' : 'Translate'}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 p-4 bg-white border-t border-gray-200">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text here..."
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          className="flex-1 p-3 border rounded border-gray-300 resize-none min-h-[100px]"
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded opacity-100 hover:opacity-80 disabled:bg-gray-400"
        >
          Send
        </button>
      </div>
    </div>
  );
}