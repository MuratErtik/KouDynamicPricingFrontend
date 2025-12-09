import React, { useState, useRef, useEffect } from 'react';
import { Users, Plus, Minus } from 'lucide-react';

const PassengerCounter = ({ count, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const increment = () => {
    if (count < 9) onChange(count + 1);
  };

  const decrement = () => {
    if (count > 1) onChange(count - 1);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
        Yolcu
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-800 hover:bg-white hover:border-blue-400 focus:ring-2 focus:ring-blue-500 transition-all text-left"
      >
        <div className="absolute left-3 text-blue-500">
          <Users size={20} />
        </div>
        {count} Yolcu
      </button>

      {isOpen && (
        <div className="absolute z-50 right-0 mt-2 w-full md:w-64 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">Yolcu Sayısı</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={decrement}
                disabled={count <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Minus size={16} />
              </button>
              <span className="font-bold text-lg w-4 text-center">{count}</span>
              <button
                type="button"
                onClick={increment}
                disabled={count >= 9}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">Maksimum 9 yolcu seçebilirsiniz.</p>
        </div>
      )}
    </div>
  );
};

export default PassengerCounter;