import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar } from 'lucide-react';
import publicService from '../../services/publicService';
import AirportCombobox from '../common/AirportCombobox'; // Yeni bileşeni import et
import { toast } from 'react-toastify';

const SearchForm = () => {
  const navigate = useNavigate();
  const [airports, setAirports] = useState([]);
  
  // State yapısı
  const [searchData, setSearchData] = useState({ 
    from: '', // Airport ID tutacak
    to: '',   // Airport ID tutacak
    date: '' 
  });

  // 1. Component mount olduğunda havalimanlarını çek
  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const data = await publicService.getAirports();
        setAirports(data);
      } catch (error) {
        console.error("Havalimanları yüklenemedi:", error);
        toast.error("Havalimanı listesi alınamadı.");
      }
    };
    fetchAirports();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Basit Validasyon
    if (!searchData.from || !searchData.to || !searchData.date) {
      toast.warning("Lütfen tüm alanları doldurun.");
      return;
    }
    if (searchData.from === searchData.to) {
      toast.warning("Kalkış ve varış noktası aynı olamaz.");
      return;
    }

    // Arama sayfasına yönlendir
    navigate(`/flights?from=${searchData.from}&to=${searchData.to}&date=${searchData.date}`);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-2xl max-w-5xl mx-auto -mt-10 relative z-10 border border-gray-100">
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
        
        {/* NEREDEN Combobox */}
        <div className="md:col-span-2">
          <AirportCombobox 
            label="Nereden" 
            airports={airports}
            selectedId={searchData.from}
            onSelect={(id) => setSearchData({ ...searchData, from: id })}
          />
        </div>

        {/* NEREYE Combobox */}
        <div className="md:col-span-2">
          <AirportCombobox 
            label="Nereye" 
            airports={airports}
            selectedId={searchData.to}
            onSelect={(id) => setSearchData({ ...searchData, to: id })}
          />
        </div>

        {/* TARİH Seçimi */}
        <div className="md:col-span-2">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Gidiş Tarihi</label>
          <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 p-3 cursor-pointer hover:border-blue-400 transition bg-white h-[50px]">
            <Calendar className="text-blue-600 mr-2" size={20} />
            <input 
              type="date" 
              className="bg-transparent w-full outline-none text-gray-700 font-medium cursor-pointer"
              value={searchData.date}
              min={new Date().toISOString().split('T')[0]} // Geçmiş tarih seçilemesin
              onChange={(e) => setSearchData({...searchData, date: e.target.value})}
              required
            />
          </div>
        </div>

        {/* ARA Butonu */}
        <div className="md:col-span-1">
          <button 
            type="submit" 
            className="w-full h-[50px] bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition shadow-lg flex justify-center items-center gap-2"
          >
            <Search size={20} /> Ara
          </button>
        </div>

      </form>
    </div>
  );
};

export default SearchForm;