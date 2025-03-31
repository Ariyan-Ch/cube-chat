
import React from 'react';
import { cn } from '@/lib/utils';

type MessageType = 'user' | 'bot';

interface ChatMessageProps {
  type: MessageType;
  content: string;
  timestamp: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ type, content, timestamp }) => {
  return (
    <div
      className={cn(
        "flex mb-4",
        type === 'user' ? "justify-end" : "justify-start"
      )}
    >
      {type === 'bot' && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-dark flex items-center justify-center mr-2">
          <span className="text-white text-xs font-bold">AI</span>
        </div>
      )}
      
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2",
          type === 'user' 
            ? "bg-purple-light text-white rounded-tr-none" 
            : "bg-secondary text-secondary-foreground rounded-tl-none"
        )}
      >
        <p className="text-sm">{content}</p>
        <div className={cn(
          "text-xs mt-1",
          type === 'user' ? "text-purple-100" : "text-muted-foreground"
        )}>{timestamp}</div>
      </div>
      
      {type === 'user' && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-light flex items-center justify-center ml-2">
          <span className="text-white text-xs font-bold">You</span>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
