import React, { useState, useRef, ChangeEvent, KeyboardEvent, ClipboardEvent } from 'react';
import { Send, Image as ImageIcon, X, Loader2 } from 'lucide-react';

interface InputAreaProps {
  onSend: (text: string, imageFile: File | null) => void;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading }) => {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        // Tìm thấy ảnh trong clipboard
        const file = item.getAsFile();
        if (file) {
          e.preventDefault(); // Ngăn chặn việc dán nhị phân vào textarea
          processFile(file);
          return; // Chỉ xử lý ảnh đầu tiên tìm thấy
        }
      }
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = () => {
    if ((!text.trim() && !imageFile) || isLoading) return;
    
    onSend(text, imageFile);
    setText('');
    clearImage();
    // Reset textarea height
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const adjustTextareaHeight = (e: ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
      e.target.style.height = 'auto';
      e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pb-4">
      {/* Image Preview Container */}
      {imagePreview && (
        <div className="mb-3 relative inline-block group">
          <div className="relative rounded-xl overflow-hidden border border-teal-200 shadow-md bg-gray-50">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="max-h-60 w-auto object-contain block" 
            />
            <button 
              onClick={clearImage}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors backdrop-blur-sm"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="bg-white rounded-3xl shadow-xl border border-teal-100 p-2 flex items-end gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-3 text-teal-600 hover:bg-teal-50 rounded-full transition-colors flex-shrink-0"
          title="Tải ảnh lên"
          disabled={isLoading}
        >
          <ImageIcon size={24} />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />

        <textarea
          ref={textareaRef}
          value={text}
          onChange={adjustTextareaHeight}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Nhập câu hỏi, dán ảnh (Ctrl+V) hoặc gửi file..."
          className="flex-grow max-h-[150px] py-3 px-2 text-gray-700 bg-transparent resize-none focus:outline-none placeholder-gray-400"
          rows={1}
          disabled={isLoading}
        />

        <button
          onClick={handleSend}
          disabled={(!text.trim() && !imageFile) || isLoading}
          className={`p-3 rounded-full transition-all duration-200 flex-shrink-0 ${
            (!text.trim() && !imageFile) || isLoading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-teal-600 text-white hover:bg-teal-700 shadow-md'
          }`}
        >
          {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
        </button>
      </div>
    </div>
  );
};

export default InputArea;
