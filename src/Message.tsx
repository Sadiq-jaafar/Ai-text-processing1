import {  supportedLanguages } from './types';

export interface Message {
    id: string;
    text: string;
    detectedLanguage?: string;
    summary?: string;
    translation?: string;
    targetLanguage: string;
    isProcessing: boolean;
    error?: string;
  }

type MessageProps = {
  message: Message;
  onSummarize: (messageId: string) => void;
  onTranslate: (messageId: string) => void;
  onLanguageChange: (messageId: string, targetLanguage: string) => void;
};

export const Message = ({ message, onSummarize, onTranslate, onLanguageChange }: MessageProps) => (
  <div className="bg-white rounded-lg p-4 shadow-md max-w-[80%] self-start">
    <p className="mb-2 leading-relaxed">{message.text}</p>
    {message.detectedLanguage && (
      <div className="text-sm text-gray-600 mb-2">
        Detected: {supportedLanguages.find(lang => lang.code === message.detectedLanguage)?.name || message.detectedLanguage}
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
          Translation ({supportedLanguages.find(lang => lang.code === message.targetLanguage)?.name || message.targetLanguage}):
        </h4>
        <p>{message.translation}</p>
      </div>
    )}
    <div className="flex gap-2 mt-4">
      {message.detectedLanguage === 'en' && message.text.length >= 150 && (
        <button
          onClick={() => onSummarize(message.id)}
          disabled={message.isProcessing}
          className="px-4 py-2 bg-blue-600 text-white rounded opacity-100 hover:opacity-80 disabled:bg-gray-400"
        >
          {message.isProcessing ? 'Processing...' : 'Summarize'}
        </button>
      )}
      <select
        value={message.targetLanguage}
        onChange={(e) => onLanguageChange(message.id, e.target.value)}
        className="px-2 py-1 border rounded border-gray-300"
      >
        {supportedLanguages.map(lang => (
          <option key={lang.code} value={lang.code}>{lang.name}</option>
        ))}
      </select>
      <button
        onClick={() => onTranslate(message.id)}
        disabled={message.isProcessing}
        className="px-4 py-2 bg-blue-600 text-white rounded opacity-100 hover:opacity-80 disabled:bg-gray-400"
      >
        {message.isProcessing ? 'Processing...' : 'Translate'}
      </button>
    </div>
  </div>
);