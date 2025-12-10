import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import flightSearchService from '../../services/flightSearchService';
import { ArrowRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const [allFlightData, setAllFlightData] = useState(null);
  const [selectedDateTab, setSelectedDateTab] = useState('selected');
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const fromCode = searchParams.get('departureAirportIataCode');
        const toCode = searchParams.get('arrivalAirportIataCode');
        const departureDate = searchParams.get('departureDate');

        if (!fromCode || !toCode || !departureDate) {
          console.error('Eksik parametreler:', { fromCode, toCode, departureDate });
          setLoading(false);
          return;
        }

        const result = await flightSearchService.searchFlightsWithNeighbors(
          fromCode,
          toCode,
          departureDate
        );

        setAllFlightData(result);
        // Varsayılan olarak seçilen tarihi göster
        setFlights(result.selectedDate.data);
        setSelectedDateTab('selected');
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlights();
  }, [searchParams]);

  const handleDateTabClick = (tabKey) => {
    setSelectedDateTab(tabKey);
    if (tabKey === 'prev' && allFlightData?.prevDay) {
      setFlights(allFlightData.prevDay.data);
    } else if (tabKey === 'selected') {
      setFlights(allFlightData.selectedDate.data);
    } else if (tabKey === 'next') {
      setFlights(allFlightData.nextDay.data);
    }
  };

  const formatDateTab = (dateObj) => {
    return format(dateObj, 'd MMM EEEE', { locale: tr });
  };

  if (loading) return <div className="text-center mt-20">Uçuşlar aranıyor...</div>;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Uçuş Sonuçları</h2>

      {/* Tarih Navigation */}
      {allFlightData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 mb-6 flex gap-2">
          {/* Önceki Gün */}
          {allFlightData.prevDay && (
            <button
              onClick={() => handleDateTabClick('prev')}
              className={`flex-1 py-3 px-4 rounded-lg transition-all ${
                selectedDateTab === 'prev'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <Calendar size={18} />
                <span className="text-sm font-semibold">{formatDateTab(allFlightData.prevDay.date)}</span>
                <span className="text-xs opacity-80">{allFlightData.prevDay.data.length} uçuş</span>
              </div>
            </button>
          )}

          {/* Seçilen Gün */}
          <button
            onClick={() => handleDateTabClick('selected')}
            className={`flex-1 py-3 px-4 rounded-lg transition-all ${
              selectedDateTab === 'selected'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <Calendar size={18} />
              <span className="text-sm font-semibold">{formatDateTab(allFlightData.selectedDate.date)}</span>
              <span className="text-xs opacity-80">{allFlightData.selectedDate.data.length} uçuş</span>
            </div>
          </button>

          {/* Sonraki Gün */}
          <button
            onClick={() => handleDateTabClick('next')}
            className={`flex-1 py-3 px-4 rounded-lg transition-all ${
              selectedDateTab === 'next'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <Calendar size={18} />
              <span className="text-sm font-semibold">{formatDateTab(allFlightData.nextDay.date)}</span>
              <span className="text-xs opacity-80">{allFlightData.nextDay.data.length} uçuş</span>
            </div>
          </button>
        </div>
      )}

      {/* Uçuş Listesi */}
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
                  <span>{flight.departureAirport?.city}</span>
                  <ArrowRight size={16} />
                  <span>{flight.arrivalAirport?.city}</span>
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