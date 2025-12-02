import React, { useState, useEffect, useRef } from 'react';
import { Plane, Check, ChevronDown, Search } from 'lucide-react';

const AirportCombobox = ({ label, airports, selectedId, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef(null);

  // Seçili olan havalimanı objesini bul
  const selectedAirport = airports.find((a) => a.id === Number(selectedId));

  // Arama filtresi: Şehir, İsim veya IATA koduna göre
  const filteredAirports = query === ''
    ? airports
    : airports.filter((airport) =>
        airport.city.toLowerCase().includes(query.toLowerCase()) ||
        airport.name.toLowerCase().includes(query.toLowerCase()) ||
        airport.iataCode.toLowerCase().includes(query.toLowerCase())
      );

  // Dışarı tıklandığında dropdown'ı kapatmak için
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">
        {label}
      </label>
      
      {/* Görünen Input Alanı */}
      <div 
        className="flex items-center border border-gray-200 rounded-lg bg-gray-50 p-3 cursor-pointer hover:border-blue-400 transition bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Plane className={`mr-2 ${selectedId ? 'text-blue-600' : 'text-gray-400'}`} size={20} />
        
        <input
          type="text"
          className="bg-transparent w-full outline-none text-gray-700 font-medium placeholder-gray-400 cursor-pointer"
          placeholder="Şehir veya Havalimanı ara..."
          value={isOpen ? query : (selectedAirport ? `${selectedAirport.city} (${selectedAirport.iataCode})` : '')}
          onChange={(e) => setQuery(e.target.value)}
          onClick={() => setIsOpen(true)}
          readOnly={!isOpen} // Sadece açıldığında yazılabilir olsun
        />
        
        <ChevronDown size={16} className="text-gray-400" />
      </div>

      {/* Dropdown Listesi */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-xl max-h-60 overflow-auto animate-in fade-in zoom-in-95 duration-100">
          {filteredAirports.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 text-center">Sonuç bulunamadı.</div>
          ) : (
            <ul>
              {filteredAirports.map((airport) => (
                <li
                  key={airport.id}
                  className={`
                    px-4 py-3 cursor-pointer flex justify-between items-center transition
                    ${selectedId === airport.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}
                  `}
                  onClick={() => {
                    onSelect(airport.id);
                    setIsOpen(false);
                    setQuery(''); // Aramayı sıfırla
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">{airport.city}</span>
                    <span className="text-xs text-gray-500">{airport.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-gray-200 text-gray-600 px-2 py-1 rounded">
                      {airport.iataCode}
                    </span>
                    {selectedId === airport.id && <Check size={16} />}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default AirportCombobox;