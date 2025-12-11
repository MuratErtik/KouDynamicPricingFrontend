import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import flightSearchService from '../../services/flightSearchService';
import { ArrowRight, Calendar } from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';
import { tr } from 'date-fns/locale';
import PassengerStepContainer from '../../components/booking/steps/PassengerStepContainer';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const [allFlightData, setAllFlightData] = useState(null);
  const [selectedDateTab, setSelectedDateTab] = useState('selected');
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const navigate = useNavigate();

  const fromCode = searchParams.get('departureAirportIataCode');
  const toCode = searchParams.get('arrivalAirportIataCode');
  const departureDate = searchParams.get('departureDate');
  const passengerCount = parseInt(searchParams.get('passengers') || '1', 10);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        if (!fromCode || !toCode || !departureDate) {
          console.error("Eksik parametreler:", { fromCode, toCode, departureDate });
          setLoading(false);
          return;
        }

        const result = await flightSearchService.searchFlightsWithNeighbors(
          fromCode,
          toCode,
          departureDate
        );

        setAllFlightData(result);
        setFlights(result.selectedDate.data);
        setSelectedDateTab("selected");
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlights();
  }, [fromCode, toCode, departureDate]);


  // ------------------------------------------------------
  // ÜST TARİH BAR BUTONLARI
  // ------------------------------------------------------

  const handleDateTabClick = (tabKey) => {
    setSelectedDateTab(tabKey);

    if (tabKey === "prev" && allFlightData?.prevDay) {
      setFlights(allFlightData.prevDay.data);
    } else if (tabKey === "selected") {
      setFlights(allFlightData.selectedDate.data);
    } else if (tabKey === "next") {
      setFlights(allFlightData.nextDay.data);
    }
  };

  const formatDateTab = (dateObj) => {
    return format(dateObj, "d MMM EEEE", { locale: tr });
  };


  // ------------------------------------------------------
  // HELPER: UÇUŞ SÜRESİ
  // ------------------------------------------------------

  const getDuration = (start, end) => {
    const diff = differenceInMinutes(new Date(end), new Date(start));
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours}sa ${minutes}dk`;
  };


  const handleFlightSelect = (flight) => {
    setSelectedFlight(flight);

    // Scroll passenger form into view after state updates
    setTimeout(() => {
      const formSection = document.getElementById('passenger-form-section');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handlePassengerInfoComplete = (payload) => {
    if (!selectedFlight) return;
    navigate(`/book/${selectedFlight.id}`, {
      state: {
        passengerData: payload,
        selectedFlight,
      },
    });
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
              onClick={() => handleDateTabClick("prev")}
              className={`flex-1 py-3 px-3 rounded-lg transition-all ${
                selectedDateTab === "prev"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <Calendar size={18} />
                <span className="text-sm font-semibold">
                  {formatDateTab(allFlightData.prevDay.date)}
                </span>
                <span className="text-xs opacity-80">
                  {allFlightData.prevDay.data.length} uçuş
                </span>
              </div>
            </button>
          )}

          {/* Bugün */}
          <button
            onClick={() => handleDateTabClick("selected")}
            className={`flex-1 py-3 px-3 rounded-lg transition-all ${
              selectedDateTab === "selected"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <Calendar size={18} />
              <span className="text-sm font-semibold">
                {formatDateTab(allFlightData.selectedDate.date)}
              </span>
              <span className="text-xs opacity-80">
                {allFlightData.selectedDate.data.length} uçuş
              </span>
            </div>
          </button>

          {/* Sonraki Gün */}
          <button
            onClick={() => handleDateTabClick("next")}
            className={`flex-1 py-3 px-3 rounded-lg transition-all ${
              selectedDateTab === "next"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <Calendar size={18} />
              <span className="text-sm font-semibold">
                {formatDateTab(allFlightData.nextDay.date)}
              </span>
              <span className="text-xs opacity-80">
                {allFlightData.nextDay.data.length} uçuş
              </span>
            </div>
          </button>
        </div>
      )}


      {/* -------------------------------------------------- */}
      {/* UÇUŞ LİSTESİ */}
      {/* -------------------------------------------------- */}
      {flights.length === 0 ? (
        <div className="bg-red-50 p-4 rounded text-red-600">
          Aradığınız kriterlere uygun uçuş bulunamadı.
        </div>
      ) : (
        <div className="space-y-4">

          {flights.map((flight) => {
            const isSelected = selectedFlight?.id === flight.id;
            const dep = new Date(flight.departureTime);
            const arr = new Date(flight.arrivalTime);

            return (
              <div
                key={flight.id}
                className={`bg-white p-6 rounded-lg shadow hover:shadow-md transition border flex flex-col md:flex-row justify-between items-center ${
                  isSelected ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-100'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-lg font-bold text-gray-800">
                      {format(dep, "HH:mm")}
                    </span>

                    <div className="h-[2px] w-20 bg-gray-300 relative flex justify-center">
                      <span className="absolute -top-3 text-gray-400 text-xs">Direkt</span>
                    </div>

                    <span className="text-lg font-bold text-gray-800">
                      {format(arr, "HH:mm")}
                    </span>
                  </div>

                  <div className="flex gap-4 text-gray-500 text-sm items-center">
                    <span>{flight.departureAirport.city}</span>
                    <ArrowRight size={16} />
                    <span>{flight.arrivalAirport.city}</span>

                    {/* Süre */}
                    <span className="ml-3 text-xs text-gray-400">
                      {getDuration(flight.departureTime, flight.arrivalTime)}
                    </span>
                  </div>
                </div>

                <div className="text-right mt-4 md:mt-0">
                  <div className="text-2xl font-bold text-blue-600">
                    {flight.currentPrice.toFixed(2)} $
                  </div>
                  <button
                    onClick={() => handleFlightSelect(flight)}
                    className={`mt-2 px-6 py-2 rounded-full font-medium transition ${
                      isSelected
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isSelected ? 'Seçildi' : 'Seç'}
                  </button>
                </div>
              </div>
            );
          })}

        </div>
      )}

      {selectedFlight && (
        <div id="passenger-form-section" className="mt-10 space-y-6">
          <div className="bg-white border border-blue-100 rounded-2xl shadow-sm p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-500">Seçilen Uçuş</p>
                <h3 className="text-xl font-bold text-gray-800">#{selectedFlight.flightNumber}</h3>
                <p className="text-gray-500 text-sm">
                  {selectedFlight.departureAirport?.city} ({selectedFlight.departureAirport?.iataCode})
                  {' '}
                  <ArrowRight size={16} className="inline mx-1 text-blue-500" />
                  {selectedFlight.arrivalAirport?.city} ({selectedFlight.arrivalAirport?.iataCode})
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Güncel Fiyat</p>
                <p className="text-2xl font-bold text-blue-600">
                  {selectedFlight.currentPrice?.toFixed(2)} $
                </p>
              </div>
            </div>
          </div>

          <PassengerStepContainer
            passengerCount={passengerCount}
            onNext={handlePassengerInfoComplete}
            resetKey={selectedFlight.id}
          />
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
