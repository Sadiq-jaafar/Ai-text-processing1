import { useState, useEffect } from 'react';
import { Message } from './Message';
import { MessageInput } from './MessageInput';
import { ApiErrorBanner } from './ApiErrorBanner';
import { Message as MessageType, DetectorInstance } from './types';

export default function App() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputText, setInputText] = useState('');
  const [apisAvailable, setApisAvailable] = useState(true);
  const [detector, setDetector] = useState<DetectorInstance | null>(null);

  useEffect(() => {
    const initializeAPIs = async () => {
      if (!window.ai) {
        setApisAvailable(false);
        return;
      }

      try {
        const languageDetectorCapabilities = await window.ai.languageDetector.capabilities();
        const canDetect = languageDetectorCapabilities.capabilities;

        if (canDetect === 'no') throw new Error('Language detection not available');

        const detectorInstance = canDetect === 'readily' 
          ? await window.ai.languageDetector.create()
          : await window.ai.languageDetector.create({
              monitor(m) {
                m.addEventListener('downloadprogress', (e) => {
                  console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
                });
              }
            });
        
        if (canDetect !== 'readily') await detectorInstance.ready;
        setDetector(detectorInstance);
        setApisAvailable(true);
      } catch (error) {
        setApisAvailable(false);
        console.log(error)
      }
    };

    initializeAPIs();
  }, []);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const newMessage: MessageType = {
      id: Date.now().toString(),
      text: inputText.trim(),
      targetLanguage: 'en',
      isProcessing: true,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    try {
      if (!detector) throw new Error('Language detector not initialized');
      const results = await detector.detect(newMessage.text);
      const detectedLanguage = results[0]?.detectedLanguage || 'unknown';

      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, detectedLanguage, isProcessing: false } : msg
      ));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Language detection failed';
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, error: errorMessage, isProcessing: false } : msg
      ));
    }
  };

  const handleSummarize = async (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isProcessing: true, error: undefined } : msg
    ));

    try {
      const message = messages.find(msg => msg.id === messageId);
      if (!message || !window.ai?.summarizer) return;

      const summary = await window.ai.summarizer.summarize(message.text, {
        context: 'This text is intended for general audience.',
      });
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, summary, isProcessing: false } : msg
      ));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Summarization failed';
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, error: errorMessage, isProcessing: false } : msg
      ));
    }
  };

  const handleTranslate = async (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isProcessing: true, error: undefined } : msg
    ));

    try {
      const message = messages.find(msg => msg.id === messageId);
      if (!message) return;

      const translator = await window.ai.translator.create({
        sourceLanguage: message.detectedLanguage || 'en',
        targetLanguage: message.targetLanguage
      });

      const translation = await translator.translate(message.text);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, translation, isProcessing: false } : msg
      ));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Translation failed';
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, error: errorMessage, isProcessing: false } : msg
      ));
    }
  };

  const handleLanguageChange = (messageId: string, targetLanguage: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, targetLanguage } : msg
    ));
  };

  if (!apisAvailable) return <ApiErrorBanner />;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
        {messages.map(message => (
          <Message
            key={message.id}
            message={message}
            onSummarize={handleSummarize}
            onTranslate={handleTranslate}
            onLanguageChange={handleLanguageChange}
          />
        ))}
      </div>
      <MessageInput
        inputText={inputText}
        onInputChange={setInputText}
        onSend={handleSend}
      />
    </div>
  );
}