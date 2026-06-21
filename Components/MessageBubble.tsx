import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ChatMessage, Role } from '../types';
import { User, Bot } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex max-w-[95%] md:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-teal-600 text-white' : 'bg-white border border-teal-200 text-teal-600'}`}>
          {isUser ? <User size={18} /> : <Bot size={18} />}
        </div>

        {/* Content Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full min-w-0`}>
          
          {/* Image Preview for User */}
          {message.imageUrl && (
            <div className="mb-2 rounded-lg overflow-hidden border border-gray-200 max-w-full md:max-w-lg shadow-sm">
              <img src={message.imageUrl} alt="Uploaded content" className="w-full h-auto object-contain max-h-[500px]" />
            </div>
          )}

          <div
            // Đã đổi overflow-hidden thành overflow-x-auto để cuộn ngang được công thức toán dài
            className={`px-4 py-3 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed overflow-x-auto max-w-full
              ${isUser 
                ? 'bg-teal-600 text-white rounded-tr-none' 
                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
              }
              ${message.isError ? 'bg-red-50 text-red-600 border-red-200' : ''}
            `}
          >
            {/* Markdown Renderer with Math Support */}
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                code: ({ children }) => <code className="bg-black/10 px-1 rounded font-mono text-xs">{children}</code>
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
