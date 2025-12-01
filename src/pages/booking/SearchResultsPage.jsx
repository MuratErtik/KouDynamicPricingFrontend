import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import publicService from '../../services/publicService';
import { Clock, ArrowRight } from 'lucide-react';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const data = await publicService.searchFlights(
          searchParams.get('from'),
          searchParams.get('to'),
          searchParams.get('date')
        );
        setFlights(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlights();
  }, [searchParams]);

  if (loading) return <div className="text-center mt-20">Uçuşlar aranıyor...</div>;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Uçuş Sonuçları</h2>
      {flights.length === 0 ? (
        <div className="bg-red-50 p-4 rounded text-red-600">Aradığınız kriterlere uygun uçuş bulunamadı.</div>
      ) : (
        <div className="space-y-4">
          {flights.map((flight) => (
            <div key={flight.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition border border-gray-100 flex flex-col md:flex-row justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-lg font-bold text-gray-800">{new Date(flight.departureTime).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</span>
                  <div className="h-[2px] w-20 bg-gray-300 relative flex justify-center">
                    <span className="absolute -top-3 text-gray-400 text-xs">Direkt</span>
                  </div>
                  <span className="text-lg font-bold text-gray-800">--:--</span>
                </div>
                <div className="flex gap-4 text-gray-500 text-sm">
                  <span>{flight.departureCity}</span>
                  <ArrowRight size={16} />
                  <span>{flight.arrivalCity}</span>
                </div>
              </div>
              
              <div className="text-right mt-4 md:mt-0">
                <div className="text-2xl font-bold text-blue-600">{flight.price} ₺</div>
                <button 
                  onClick={() => navigate(`/book/${flight.id}`)}
                  className="mt-2 bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition"
                >
                  Seç
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;