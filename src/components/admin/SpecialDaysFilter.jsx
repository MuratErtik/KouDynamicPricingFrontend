import React, { useState } from 'react';
import { Search, Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

const SpecialDaysFilter = ({ onSearch, onClear, countries }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Başlangıç Değerleri
  const initialFilters = {
    name: "",
    targetCountry: "",
    targetCity: "", // Şehir aramasını text olarak bıraktık (esneklik için)
    minMultiplier: "",
    maxMultiplier: "",
    startDate: "",
    endDate: "",
    isRecurring: "" // "" = Hepsi, "true" = Evet, "false" = Hayır
  };

  const [filters, setFilters] = useState(initialFilters);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters(initialFilters);
    onClear();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
      {/* Header - Tıklanabilir (Aç/Kapa) */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
      >
        <div className="flex items-center gap-2 text-blue-800 font-bold">
          <Filter size={20} />
          <span>Gelişmiş Arama & Filtreleme</span>
        </div>
        {isOpen ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
      </div>

      {/* Form Area */}
      {isOpen && (
        <form onSubmit={handleSubmit} className="p-5 border-t border-gray-100 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* 1. Satır */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Kural Adı</label>
              <input 
                type="text" name="name" placeholder="Örn: Yılbaşı" 
                value={filters.name} onChange={handleChange}
                className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Ülke</label>
              <select 
                name="targetCountry" 
                value={filters.targetCountry} onChange={handleChange}
                className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500 bg-white"
              >
                <option value="">Tümü</option>
                {countries.map((c, i) => <option key={i} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Şehir</label>
              <input 
                type="text" name="targetCity" placeholder="Örn: Istanbul" 
                value={filters.targetCity} onChange={handleChange}
                className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Tekrar Durumu</label>
              <select 
                name="isRecurring" 
                value={filters.isRecurring} onChange={handleChange}
                className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500 bg-white"
              >
                <option value="">Hepsi</option>
                <option value="true">Evet (Yıllık)</option>
                <option value="false">Hayır (Tek Seferlik)</option>
              </select>
            </div>

            {/* 2. Satır - Aralıklar */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Min Çarpan (x)</label>
              <input 
                type="number" step="0.1" name="minMultiplier" 
                value={filters.minMultiplier} onChange={handleChange}
                className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Max Çarpan (x)</label>
              <input 
                type="number" step="0.1" name="maxMultiplier" 
                value={filters.maxMultiplier} onChange={handleChange}
                className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Başlangıç Tarihi</label>
              <input 
                type="date" name="startDate" 
                value={filters.startDate} onChange={handleChange}
                className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Bitiş Tarihi</label>
              <input 
                type="date" name="endDate" 
                value={filters.endDate} onChange={handleChange}
                className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 mt-6 border-t pt-4">
            <button 
              type="button" onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border rounded-lg hover:bg-gray-50 transition"
            >
              <RotateCcw size={16} /> Temizle
            </button>
            <button 
              type="submit"
              className="flex items-center gap-2 px-6 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md transition"
            >
              <Search size={16} /> Ara
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SpecialDaysFilter;