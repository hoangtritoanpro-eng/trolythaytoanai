import React, { useState, useRef, useEffect } from 'react';
import Header from './Components/Header';
import MessageBubble from './Components/MessageBubble';
import InputArea from './Components/InputArea';
import { ChatMessage, Role } from './types';
import { sendMessageToGemini } from './services/geminiService';

const generateId = () => Math.random().toString(36).substring(2, 9);

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: Role.MODEL,
      text: 'Chào em! Thầy là Phúc. Em có bài toán khó nào cần thầy giúp không? Em có thể gõ đề bài hoặc chụp ảnh gửi cho thầy nhé.',
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Dùng tham chiếu đến thẻ main thay vì thẻ div trống ở cuối
  const mainRef = useRef<HTMLElement>(null);

  const scrollToBottom = () => {
    // Chỉ cuộn bên trong không gian của thẻ main, không cuộn toàn trang
    if (mainRef.current) {
      mainRef.current.scrollTo({
        top: mainRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSend = async (text: string, imageFile: File | null) => {
    const messageId = generateId();
    let imageBase64: string | undefined;
    if (imageFile) {
      try {
        imageBase64 = await convertFileToBase64(imageFile);
      } catch (e) {
        console.error("Error reading file", e);
        return;
      }
    }
    const newUserMessage: ChatMessage = {
      id: messageId,
      role: Role.USER,
      text: text,
      imageUrl: imageBase64
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    try {
      const responseText = await sendMessageToGemini({
        text,
        imageBase64,
        mimeType: imageFile?.type
      }, messages);
      const newModelMessage: ChatMessage = {
        id: generateId(),
        role: Role.MODEL,
        text: responseText
      };
      setMessages(prev => [...prev, newModelMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: Role.MODEL,
        text: "Thầy xin lỗi, hiện tại thầy đang gặp chút sự cố kết nối. Em thử lại sau nhé!",
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Dùng h-[100dvh] (dynamic viewport height) để chuẩn hơn trên các thiết bị mobile
    <div className="flex flex-col h-[100dvh] w-full bg-gray-50 overflow-hidden">
      <Header />
      
      {/* Gắn ref vào đây */}
      <main ref={mainRef} className="flex-1 overflow-y-auto min-h-0 px-4 py-6 scrollbar-thin scrollbar-thumb-teal-200 scrollbar-track-transparent">
        <div className="max-w-5xl mx-auto space-y-6">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isLoading && (
            <div className="flex justify-start mb-6">
              <div className="flex items-center gap-2 bg-white border border-teal-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <div className="bg-white border-t border-teal-100 pt-2 flex-shrink-0">
        <InputArea onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default App;
