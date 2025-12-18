import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import flightSearchService from '../../services/flightSearchService';
import { ArrowRight, Calendar, CheckCircle2, Plane, Edit2, ChevronRight, Percent } from 'lucide-react'; // Percent eklendi
import { format, differenceInMinutes } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useBooking } from '../../context/BookingContext';
import { toast } from 'react-toastify';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { bookingData, selectOutboundFlight, selectReturnFlight, resetOutboundFlight, resetReturnFlight } = useBooking();

  // URL'den parametreler
  const tripType = searchParams.get('tripType') || 'one-way';
  const fromCode = searchParams.get('departureAirportIataCode');
  const toCode = searchParams.get('arrivalAirportIataCode');
  const departureDate = searchParams.get('departureDate');
  const returnDate = searchParams.get('returnDate');

  // State
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState('outbound'); // 'outbound' veya 'return'

  // Gidiş uçuşları
  const [outboundFlightData, setOutboundFlightData] = useState(null);
  const [selectedOutboundDateTab, setSelectedOutboundDateTab] = useState('selected');
  const [outboundFlights, setOutboundFlights] = useState([]);

  // Dönüş uçuşları
  const [returnFlightData, setReturnFlightData] = useState(null);
  const [selectedReturnDateTab, setSelectedReturnDateTab] = useState('selected');
  const [returnFlights, setReturnFlights] = useState([]);

  // Context'ten seçili uçuşları al
  const selectedOutbound = bookingData.outboundFlight;
  const selectedReturn = bookingData.returnFlight;

  // Sayfa yüklendiğinde yönlendirme
  useEffect(() => {
    if (tripType === 'round-trip') {
      if (selectedOutbound && !selectedReturn) {
        setCurrentStep('return');
      } else if (!selectedOutbound) {
        setCurrentStep('outbound');
      }
    }
  }, [tripType, selectedOutbound, selectedReturn]);

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

          setOutboundFlightData(result.departure);
          setOutboundFlights(result.departure.selectedDate.data);

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

          setOutboundFlightData(result);
          setOutboundFlights(result.selectedDate.data);
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

  // ... (Tarih ve Tab fonksiyonları aynı kalıyor) ...
  const handleOutboundDateTabClick = (tabKey) => {
    setSelectedOutboundDateTab(tabKey);
    if (tabKey === "prev" && outboundFlightData?.prevDay) {
      setOutboundFlights(outboundFlightData.prevDay.data);
    } else if (tabKey === "selected") {
      setOutboundFlights(outboundFlightData.selectedDate.data);
    } else if (tabKey === "next") {
      setOutboundFlights(outboundFlightData.nextDay.data);
    }
  };

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

  const handleSelectOutboundFlight = (flight) => {
    selectOutboundFlight(flight);
    if (tripType === 'one-way') {
      navigate('/booking/passenger-info');
    } else {
      setCurrentStep('return');
      toast.success('Gidiş uçuşu seçildi! Şimdi dönüş uçuşunu seçin.');
    }
  };

  const handleSelectReturnFlight = (flight) => {
    selectReturnFlight(flight);
    navigate('/booking/passenger-info');
  };

  const handleChangeOutbound = () => {
    resetOutboundFlight();
    setCurrentStep('outbound');
    toast.info('Gidiş uçuşunu değiştirebilirsiniz.');
  };

  const handleChangeReturn = () => {
    resetReturnFlight();
    setCurrentStep('return');
    toast.info('Dönüş uçuşunu değiştirebilirsiniz.');
  };

  // --- FİYAT GÖSTERİM BİLEŞENİ (Helper Component) ---
  const PriceDisplay = ({ currentPrice, discountPrice, size = "normal" }) => {
    // discountPrice null değilse ve 0'dan büyükse indirim var kabul et
    const hasDiscount = discountPrice !== null && discountPrice !== undefined && discountPrice > 0;

    if (hasDiscount) {
      return (
        <div className="flex flex-col items-end">
          {/* Eski Fiyat (Üstü Çizili) */}
          <span className={`text-gray-400 line-through decoration-red-500 decoration-1 font-medium ${size === "large" ? "text-lg" : "text-sm"}`}>
            ${currentPrice.toFixed(2)}
          </span>
          {/* Yeni Fiyat (İndirimli) */}
          <div className={`font-bold text-green-600 flex items-center gap-1 ${size === "large" ? "text-3xl" : "text-2xl"}`}>
             ${discountPrice.toFixed(2)}
             {/* İsteğe bağlı indirim ikonu */}
             {size === "large" && <Percent size={20} className="animate-pulse" />}
          </div>
        </div>
      );
    }

    // İndirim yoksa sadece normal fiyat (Mavi)
    return (
      <div className={`font-bold text-blue-600 ${size === "large" ? "text-3xl" : "text-2xl"}`}>
        ${currentPrice.toFixed(2)}
      </div>
    );
  };
  // --------------------------------------------------

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

  const showingOutbound = currentStep === 'outbound';
  const showingReturn = currentStep === 'return';

  const currentFlightData = showingOutbound ? outboundFlightData : returnFlightData;
  const currentFlights = showingOutbound ? outboundFlights : returnFlights;
  const currentDateTab = showingOutbound ? selectedOutboundDateTab : selectedReturnDateTab;
  const handleDateTabClick = showingOutbound ? handleOutboundDateTabClick : handleReturnDateTabClick;
  const handleSelectFlight = showingOutbound ? handleSelectOutboundFlight : handleSelectReturnFlight;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* BAŞLIK */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {tripType === 'round-trip' ? 'Gidiş - Dönüş Uçuşları' : 'Uçuş Sonuçları'}
          </h2>

          {/* Gidiş-Dönüş İlerleme ve Seçilen Uçuşlar */}
          {tripType === 'round-trip' && (
            <div className="space-y-4 mt-6">
              
              {/* Gidiş Uçuşu Durumu */}
              <div className={`bg-white rounded-2xl shadow-lg border-2 p-6 transition-all ${
                showingOutbound ? 'border-blue-500' : selectedOutbound ? 'border-green-500' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {selectedOutbound ? (
                      <CheckCircle2 className="text-green-600 flex-shrink-0" size={32} />
                    ) : (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                        showingOutbound ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        1
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-800 text-lg">Gidiş Uçuşu</p>
                      <p className="text-sm text-gray-600">{fromCode} → {toCode}</p>
                    </div>
                  </div>

                  {selectedOutbound ? (
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="flex items-center gap-3 mb-1 justify-end">
                          <span className="text-xl font-bold text-gray-800">
                            {format(new Date(selectedOutbound.departureTime), "HH:mm")}
                          </span>
                          <ArrowRight className="text-gray-400" size={20} />
                          <span className="text-xl font-bold text-gray-800">
                            {format(new Date(selectedOutbound.arrivalTime), "HH:mm")}
                          </span>
                        </div>
                        {/* Fiyat Gösterimi (Helper Component) */}
                        <PriceDisplay 
                          currentPrice={selectedOutbound.currentPrice} 
                          discountPrice={selectedOutbound.discountPrice} 
                          size="normal"
                        />
                      </div>
                      <button
                        onClick={handleChangeOutbound}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium transition flex items-center gap-2"
                      >
                        <Edit2 size={16} />
                        Değiştir
                      </button>
                    </div>
                  ) : showingOutbound ? (
                    <span className="text-blue-600 font-medium">Seçim yapın</span>
                  ) : null}
                </div>
              </div>

              {/* Dönüş Uçuşu Durumu */}
              <div className={`bg-white rounded-2xl shadow-lg border-2 p-6 transition-all ${
                showingReturn ? 'border-blue-500' : selectedReturn ? 'border-green-500' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {selectedReturn ? (
                      <CheckCircle2 className="text-green-600 flex-shrink-0" size={32} />
                    ) : (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                        showingReturn ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        2
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-800 text-lg">Dönüş Uçuşu</p>
                      <p className="text-sm text-gray-600">{toCode} → {fromCode}</p>
                    </div>
                  </div>

                  {selectedReturn ? (
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="flex items-center gap-3 mb-1 justify-end">
                          <span className="text-xl font-bold text-gray-800">
                            {format(new Date(selectedReturn.departureTime), "HH:mm")}
                          </span>
                          <ArrowRight className="text-gray-400" size={20} />
                          <span className="text-xl font-bold text-gray-800">
                            {format(new Date(selectedReturn.arrivalTime), "HH:mm")}
                          </span>
                        </div>
                        {/* Fiyat Gösterimi (Helper Component) */}
                        <PriceDisplay 
                          currentPrice={selectedReturn.currentPrice} 
                          discountPrice={selectedReturn.discountPrice} 
                          size="normal"
                        />
                      </div>
                      <button
                        onClick={handleChangeReturn}
                        disabled={!selectedReturn}
                        className="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 px-4 py-2 rounded-xl font-medium transition flex items-center gap-2"
                      >
                        <Edit2 size={16} />
                        Değiştir
                      </button>
                    </div>
                  ) : showingReturn ? (
                    <span className="text-blue-600 font-medium">Seçim yapın</span>
                  ) : (
                    <span className="text-gray-400 text-sm">Önce gidiş uçuşunu seçin</span>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

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

                  <div className="text-right mt-4 md:mt-0 md:ml-6 flex flex-col items-end gap-2">
                    
                    {/* Fiyat Gösterimi (Helper Component - Large Size) */}
                    <PriceDisplay 
                      currentPrice={flight.currentPrice} 
                      discountPrice={flight.discountPrice} 
                      size="large"
                    />

                    <button
                      onClick={() => handleSelectFlight(flight)}
                      className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-blue-200 flex items-center gap-2"
                    >
                      Seç
                      <ChevronRight size={20} />
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