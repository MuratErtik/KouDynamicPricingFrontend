import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, MapPin } from 'lucide-react';
import publicService from '../../services/publicService';

const SearchForm = () => {
  const navigate = useNavigate();
  const [airports, setAirports] = useState([]);
  const [searchData, setSearchData] = useState({ from: '', to: '', date: '' });

  useEffect(() => {
    publicService.getAirports().then(setAirports).catch(console.error);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Query string ile sonuç sayfasına yönlendir
    navigate(`/flights?from=${searchData.from}&to=${searchData.to}&date=${searchData.date}`);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-2xl max-w-4xl mx-auto -mt-10 relative z-10 border border-gray-100">
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nereden</label>
          <div className="flex items-center border rounded-lg bg-gray-50 p-3">
            <MapPin className="text-blue-500 mr-2" size={20} />
            <select 
              className="bg-transparent w-full outline-none text-gray-700"
              onChange={(e) => setSearchData({...searchData, from: e.target.value})}
              required
            >
              <option value="">Şehir Seçin</option>
              {airports.map(a => <option key={a.id} value={a.id}>{a.city}</option>)}
            </select>
          </div>
        </div>

        <div className="relative">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nereye</label>
          <div className="flex items-center border rounded-lg bg-gray-50 p-3">
            <MapPin className="text-blue-500 mr-2" size={20} />
            <select 
              className="bg-transparent w-full outline-none text-gray-700"
              onChange={(e) => setSearchData({...searchData, to: e.target.value})}
              required
            >
              <option value="">Şehir Seçin</option>
              {airports.map(a => <option key={a.id} value={a.id}>{a.city}</option>)}
            </select>
          </div>
        </div>

        <div className="relative">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Gidiş Tarihi</label>
          <div className="flex items-center border rounded-lg bg-gray-50 p-3">
            <Calendar className="text-blue-500 mr-2" size={20} />
            <input 
              type="date" 
              className="bg-transparent w-full outline-none text-gray-700"
              onChange={(e) => setSearchData({...searchData, date: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="flex items-end">
          <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-lg transition shadow-lg flex justify-center items-center gap-2">
            <Search /> Bilet Bul
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;