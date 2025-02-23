type MessageInputProps = {
    inputText: string;
    onInputChange: (text: string) => void;
    onSend: () => void;
  };
  
  export const MessageInput = ({ inputText, onInputChange, onSend }: MessageInputProps) => (
    <div className="flex gap-2 p-4 bg-white border-t border-gray-200">
      <textarea
        value={inputText}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder="Enter text here..."
        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
        className="flex-1 p-3 border rounded border-gray-300 resize-none min-h-[100px]"
      />
      <button
        onClick={onSend}
        disabled={!inputText.trim()}
        className="px-4 py-2 bg-blue-600 text-white rounded opacity-100 hover:opacity-80 disabled:bg-gray-400"
      >
        Send
      </button>
    </div>
  );