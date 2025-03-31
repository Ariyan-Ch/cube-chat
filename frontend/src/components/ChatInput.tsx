
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && message.trim()) {
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-2 p-4 border-t border-secondary bg-background rounded-b-lg">
      <Input
        type="text"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-secondary border-none focus-visible:ring-1 focus-visible:ring-purple-light"
      />
      <Button 
        onClick={handleSend}
        className="bg-purple-DEFAULT hover:bg-purple-dark transition-colors"
      >
        Send
      </Button>
    </div>
  );
};

export default ChatInput;
