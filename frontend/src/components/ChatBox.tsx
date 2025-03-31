
import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import socket from '@/socket'; // import your socket instance
import { ScrollArea } from '@/components/ui/scroll-area';


interface Message {
  id: number;
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
}

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'bot',
      content: 'Look at the top-right corner, you can upload PDFs from there.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for bot responses from the backend
  useEffect(() => {
    socket.on('bot_response', (data) => {
      const newBotMsg: Message = {
        id: messages.length + 1,
        type: 'bot',
        content: data.answer + "\n",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, newBotMsg]);
    });
    return () => {
      socket.off('bot_response');
    };
  }, [messages]);

  const handleSendMessage = (content: string) => {
    const newUserMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    
    // Emit the user question to the backend
    socket.emit('ask_question', { question: content });
  };

  return (
    
    <div className="flex flex-col h-full rounded-lg border border-secondary bg-card shadow-lg">
      <div className="bg-secondary p-4 border-b border-secondary">
        <h2 className="font-semibold text-lg">Chat</h2>
      </div>
      
      <div className="flex-1 relative min-h-0">
        <ScrollArea className="absolute inset-0 h-full">
          <div className="p-4">
            {messages.map(message => (
              <ChatMessage
                key={message.id}
                type={message.type}
                content={message.content}
                timestamp={message.timestamp}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>
      
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatBox;