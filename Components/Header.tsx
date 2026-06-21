import React from 'react';
import { GraduationCap } from 'lucide-react';

const Header: React.FC = () => {
  return (
    // Thêm flex-shrink-0, bỏ sticky top-0
    <header className="bg-white/80 backdrop-blur-md border-b border-teal-100 flex-shrink-0 z-10">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-center gap-2">
        <div className="bg-teal-600 p-2 rounded-lg text-white">
            <GraduationCap size={24} />
        </div>
        <div>
            <h1 className="text-xl font-bold text-teal-800">Trợ Lý Toán Thầy Phúc</h1>
            <p className="text-xs text-teal-600 font-medium">Hỗ trợ giải bài tập & OCR LaTeX</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
