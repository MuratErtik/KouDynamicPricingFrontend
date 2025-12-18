import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import flightSearchService from '../../services/flightSearchService';
import { ArrowRight, Calendar, CheckCircle2, Plane, Percent } from 'lucide-react'; // Percent ikonu eklendi
import { format, differenceInMinutes } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useBooking } from '../../context/BookingContext';
import { toast } from 'react-toastify';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { selectDepartureFlight, selectReturnFlight } = useBooking();

  // URL'den parametreler
  const tripType = searchParams.get('tripType') || 'one-way';
  const fromCode = searchParams.get('departureAirportIataCode');
  const toCode = searchParams.get('arrivalAirportIataCode');
  const departureDate = searchParams.get('departureDate');
  const returnDate = searchParams.get('returnDate');

  // State
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState('departure'); // 'departure' veya 'return'

  // Gidiş uçuşları
  const [departureFlightData, setDepartureFlightData] = useState(null);
  const [selectedDepartureDateTab, setSelectedDepartureDateTab] = useState('selected');
  const [departureFlights, setDepartureFlights] = useState([]);
  const [selectedDepartureFlight, setSelectedDepartureFlight] = useState(null);

  // Dönüş uçuşları
  const [returnFlightData, setReturnFlightData] = useState(null);
  const [selectedReturnDateTab, setSelectedReturnDateTab] = useState('selected');
  const [returnFlights, setReturnFlights] = useState([]);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState(null);

  // Uçuşları yükle
  useEffect(() => {
    const fetchFlights = async () => {
      try {
        if (!fromCode || !toCode || !departureDate) {
          console.error("Eksik parametreler:", { fromCode, toCode, departureDate });
          setLoading(false);
          return;
        }

        if (tripType === 'round-trip' && returnDate) {
          // Gidiş-Dönüş
          const result = await flightSearchService.searchRoundTripFlights(
            fromCode,
            toCode,
            departureDate,
            returnDate
          );

          setDepartureFlightData(result.departure);
          setDepartureFlights(result.departure.selectedDate.data);

          setReturnFlightData(result.return);
          setReturnFlights(result.return.selectedDate.data);
        } else {
          // Tek Yön
          const result = await flightSearchService.searchFlightsWithNeighbors(
            fromCode,
            toCode,
            departureDate,
            false
          );

          setDepartureFlightData(result);
          setDepartureFlights(result.selectedDate.data);
        }
      } catch (error) {
        console.error("API Error:", error);
        toast.error('Uçuşlar yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [fromCode, toCode, departureDate, returnDate, tripType]);

  // Gidiş tarih sekmesi değiştir
  const handleDepartureDateTabClick = (tabKey) => {
    setSelectedDepartureDateTab(tabKey);
    if (tabKey === "prev" && departureFlightData?.prevDay) {
      setDepartureFlights(departureFlightData.prevDay.data);
    } else if (tabKey === "selected") {
      setDepartureFlights(departureFlightData.selectedDate.data);
    } else if (tabKey === "next") {
      setDepartureFlights(departureFlightData.nextDay.data);
    }
  };

  // Dönüş tarih sekmesi değiştir
  const handleReturnDateTabClick = (tabKey) => {
    setSelectedReturnDateTab(tabKey);
    if (tabKey === "prev" && returnFlightData?.prevDay) {
      setReturnFlights(returnFlightData.prevDay.data);
    } else if (tabKey === "selected") {
      setReturnFlights(returnFlightData.selectedDate.data);
    } else if (tabKey === "next") {
      setReturnFlights(returnFlightData.nextDay.data);
    }
  };

  const formatDateTab = (dateObj) => {
    return format(dateObj, "d MMM EEEE", { locale: tr });
  };

  const getDuration = (start, end) => {
    const diff = differenceInMinutes(new Date(end), new Date(start));
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours}sa ${minutes}dk`;
  };

  // Gidiş uçuşu seçildiğinde
  const handleSelectDepartureFlight = (flight) => {
    setSelectedDepartureFlight(flight);
    selectDepartureFlight(flight);

    if (tripType === 'one-way') {
      // Tek yön ise direkt yolcu bilgilerine git
      navigate('/booking/passenger-info');
    } else {
      // Gidiş-dönüş ise dönüş seçimine geç
      setCurrentStep('return');
      toast.success('Gidiş uçuşu seçildi! Şimdi dönüş uçuşunu seçin.');
    }
  };

  // Dönüş uçuşu seçildiğinde
  const handleSelectReturnFlight = (flight) => {
    setSelectedReturnFlight(flight);
    selectReturnFlight(flight);
    navigate('/booking/passenger-info');
  };

  // --- FİYAT GÖSTERİM BİLEŞENİ (Helper) ---
  const PriceDisplay = ({ currentPrice, discountPrice, size = "normal" }) => {
    // discountPrice null değilse indirim var demektir.
    if (discountPrice !== null && discountPrice !== undefined) {
      return (
        <div className="flex flex-col items-end">
          {/* Eski Fiyat (Üstü Çizili) */}
          <span className={`text-gray-400 line-through decoration-red-500 decoration-1 font-medium ${size === "large" ? "text-lg" : "text-sm"}`}>
            ${currentPrice.toFixed(2)}
          </span>
          {/* Yeni Fiyat (İndirimli) */}
          <div className={`font-bold text-green-600 flex items-center gap-1 ${size === "large" ? "text-3xl" : "text-2xl"}`}>
             ${discountPrice.toFixed(2)}
             {/* Opsiyonel: İndirim ikonu */}
             {size === "large" && <Percent size={20} className="animate-pulse" />}
          </div>
        </div>
      );
    }

    // İndirim yoksa sadece normal fiyat
    return (
      <div className={`font-bold text-blue-600 ${size === "large" ? "text-3xl" : "text-2xl"}`}>
        ${currentPrice.toFixed(2)}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Plane className="animate-bounce mx-auto mb-4 text-blue-600" size={48} />
          <p className="text-gray-600">Uçuşlar aranıyor...</p>
        </div>
      </div>
    );
  }

  // Hangi uçuşları göstereceğimizi belirle
  const showingDeparture = currentStep === 'departure';
  const showingReturn = currentStep === 'return';

  const currentFlightData = showingDeparture ? departureFlightData : returnFlightData;
  const currentFlights = showingDeparture ? departureFlights : returnFlights;
  const currentDateTab = showingDeparture ? selectedDepartureDateTab : selectedReturnDateTab;
  const handleDateTabClick = showingDeparture ? handleDepartureDateTabClick : handleReturnDateTabClick;
  const handleSelectFlight = showingDeparture ? handleSelectDepartureFlight : handleSelectReturnFlight;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* BAŞLIK VE İLERLEME */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {tripType === 'round-trip' ? 'Gidiş - Dönüş Uçuşları' : 'Uçuş Sonuçları'}
          </h2>

          {/* Gidiş-Dönüş İlerleme Göstergesi */}
          {tripType === 'round-trip' && (
            <div className="flex items-center gap-4 mt-4">
              <div className={`flex items-center gap-2 ${showingDeparture ? 'text-blue-600' : 'text-green-600'}`}>
                {showingDeparture ? (
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                ) : (
                  <CheckCircle2 className="text-green-600" size={32} />
                )}
                <div>
                  <p className="font-bold">Gidiş Uçuşu</p>
                  <p className="text-sm text-gray-600">{fromCode} → {toCode}</p>
                </div>
              </div>

              <ArrowRight className="text-gray-400" size={24} />

              <div className={`flex items-center gap-2 ${showingReturn ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${showingReturn ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  2
                </div>
                <div>
                  <p className="font-bold">Dönüş Uçuşu</p>
                  <p className="text-sm text-gray-600">{toCode} → {fromCode}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Seçilen Gidiş Uçuşu Özeti (Dönüş seçerken göster) */}
        {showingReturn && selectedDepartureFlight && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Seçilen Gidiş Uçuşu</p>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-gray-800">
                    {format(new Date(selectedDepartureFlight.departureTime), "HH:mm")}
                  </span>
                  <ArrowRight className="text-gray-400" size={20} />
                  <span className="text-xl font-bold text-gray-800">
                    {format(new Date(selectedDepartureFlight.arrivalTime), "HH:mm")}
                  </span>
                  <span className="text-sm text-gray-500">
                    {selectedDepartureFlight.departureAirport.city} → {selectedDepartureFlight.arrivalAirport.city}
                  </span>
                </div>
              </div>
              <div className="text-right">
                {/* Özet kısmında da fiyat kontrolü */}
                <PriceDisplay 
                  currentPrice={selectedDepartureFlight.currentPrice} 
                  discountPrice={selectedDepartureFlight.discountPrice} 
                  size="normal"
                />
              </div>
            </div>
          </div>
        )}

        {/* TARİH NAVİGASYONU */}
        {currentFlightData && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-3 mb-6 flex gap-2">
            
            {/* Önceki Gün */}
            {currentFlightData.prevDay && (
              <button
                onClick={() => handleDateTabClick("prev")}
                className={`flex-1 py-4 px-3 rounded-xl transition-all ${
                  currentDateTab === "prev"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <Calendar size={20} />
                  <span className="text-sm font-semibold">
                    {formatDateTab(currentFlightData.prevDay.date)}
                  </span>
                  <span className="text-xs opacity-80">
                    {currentFlightData.prevDay.data.length} uçuş
                  </span>
                </div>
              </button>
            )}

            {/* Seçilen Gün */}
            <button
              onClick={() => handleDateTabClick("selected")}
              className={`flex-1 py-4 px-3 rounded-xl transition-all ${
                currentDateTab === "selected"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <Calendar size={20} />
                <span className="text-sm font-semibold">
                  {formatDateTab(currentFlightData.selectedDate.date)}
                </span>
                <span className="text-xs opacity-80">
                  {currentFlightData.selectedDate.data.length} uçuş
                </span>
              </div>
            </button>

            {/* Sonraki Gün */}
            <button
              onClick={() => handleDateTabClick("next")}
              className={`flex-1 py-4 px-3 rounded-xl transition-all ${
                currentDateTab === "next"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <Calendar size={20} />
                <span className="text-sm font-semibold">
                  {formatDateTab(currentFlightData.nextDay.date)}
                </span>
                <span className="text-xs opacity-80">
                  {currentFlightData.nextDay.data.length} uçuş
                </span>
              </div>
            </button>
          </div>
        )}

        {/* UÇUŞ LİSTESİ */}
        {currentFlights.length === 0 ? (
          <div className="bg-red-50 p-6 rounded-2xl text-red-600 text-center">
            Aradığınız kriterlere uygun uçuş bulunamadı.
          </div>
        ) : (
          <div className="space-y-4">
            {currentFlights.map((flight) => {
              const dep = new Date(flight.departureTime);
              const arr = new Date(flight.arrivalTime);

              return (
                <div
                  key={flight.id}
                  className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition border border-gray-200 flex flex-col md:flex-row justify-between items-center"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-6 mb-3">
                      <div className="text-center">
                        <span className="text-2xl font-bold text-gray-800">
                          {format(dep, "HH:mm")}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {flight.departureAirport.city}
                        </p>
                      </div>

                      <div className="flex-1 relative">
                        <div className="h-[3px] w-full bg-gray-300 relative">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                            <Plane className="text-blue-600" size={20} />
                          </div>
                        </div>
                        <p className="text-center text-xs text-gray-500 mt-1">
                          {getDuration(flight.departureTime, flight.arrivalTime)}
                        </p>
                      </div>

                      <div className="text-center">
                        <span className="text-2xl font-bold text-gray-800">
                          {format(arr, "HH:mm")}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {flight.arrivalAirport.city}
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500">
                      Uçuş No: {flight.flightNumber || 'N/A'}
                    </div>
                  </div>

                  {/* FİYAT ALANI GÜNCELLENDİ */}
                  <div className="text-right mt-4 md:mt-0 md:ml-6 flex flex-col items-end gap-2">
                    <PriceDisplay 
                      currentPrice={flight.currentPrice} 
                      discountPrice={flight.discountPrice} 
                      size="large"
                    />
                    
                    <button
                      onClick={() => handleSelectFlight(flight)}
                      className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-blue-200"
                    >
                      Seç
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default SearchResultsPage;