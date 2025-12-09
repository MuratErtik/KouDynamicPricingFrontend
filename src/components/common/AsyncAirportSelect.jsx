import React, { useState, useEffect, useRef } from 'react';
import { Plane, Loader2 } from 'lucide-react';
import airportSearchService from '../../services/airportSearchService';

const AsyncAirportSelect = ({ label, icon: Icon, placeholder, onSelect, selectedValue, disabledId }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Seçim yapıldığında aramayı tetiklememek için flag
  const selectionRef = useRef(false);
  const wrapperRef = useRef(null);

  // Dışarıdan seçim değişirse (örn: swap işlemi) inputu güncelle
  useEffect(() => {
    if (selectedValue) {
      setQuery(`${selectedValue.city} (${selectedValue.iataCode})`);
      selectionRef.current = true; // Programatik değişim, arama yapma
    } else {
      setQuery('');
    }
  }, [selectedValue]);

  // Arama Mantığı
  useEffect(() => {
    // Eğer değişim bir seçimden kaynaklıysa arama yapma
    if (selectionRef.current) {
      selectionRef.current = false; // Flag'i sıfırla
      return;
    }

    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        const data = await airportSearchService.searchAirports(query);
        
        // FİLTRELEME: Diğer kutuda seçili olan ID'yi listeden çıkar
        const filteredData = disabledId 
          ? data.filter(airport => airport.id !== disabledId)
          : data;

        setResults(filteredData);
        setLoading(false);
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, disabledId]);

  // Tıklama Yönetimi
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSelect = (airport) => {
    selectionRef.current = true; // Seçim yapıldığını işaretle
    setQuery(`${airport.city} (${airport.iataCode})`);
    onSelect(airport);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    selectionRef.current = false; // Kullanıcı elle yazıyor, aramayı aktif et
    if (selectedValue) onSelect(null); // Seçimi temizle
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500">
          <Icon size={20} />
        </div>
        <input
          type="text"
          className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            // Focuslanınca eğer sonuç varsa ve seçim yapılmamışsa aç
            if (results.length > 0 && !selectedValue) setIsOpen(true);
          }}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="animate-spin text-gray-400" size={18} />
          </div>
        )}
      </div>

      {/* Sonuç Listesi */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
          <ul>
            {results.map((airport) => (
              <li
                key={airport.id}
                onClick={() => handleSelect(airport)}
                className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <Plane size={16} className="text-gray-500 group-hover:text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{airport.city}</p>
                    <p className="text-xs text-gray-500">{airport.name}</p>
                  </div>
                </div>
                <span className="text-sm font-bold bg-gray-200 text-gray-600 px-2 py-1 rounded group-hover:bg-blue-200 group-hover:text-blue-800">
                  {airport.iataCode}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Sonuç Yok Mesajı */}
      {/* isOpen kontrolü ve loading kontrolü sayesinde sadece arama yaparken görünür */}
      {isOpen && results.length === 0 && !loading && query.length >= 2 && !selectedValue && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 p-4 text-center text-gray-500 text-sm">
          Sonuç bulunamadı.
        </div>
      )}
    </div>
  );
};

export default AsyncAirportSelect;