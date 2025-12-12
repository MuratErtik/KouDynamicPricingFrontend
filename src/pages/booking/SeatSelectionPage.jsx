import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import seatService from '../../services/seatService';
import { Plane, CheckCircle2, X, User, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';

const SeatSelectionPage = () => {
  const navigate = useNavigate();
  const { bookingData, updateBookingData } = useBooking();
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState({});
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState(null);

  // Koltukları yükle
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        if (!bookingData.flightId) {
          toast.error('Uçuş seçilmedi!');
          navigate('/');
          return;
        }

        const seatData = await seatService.getSeats(bookingData.flightId);
        setSeats(seatData);
      } catch (error) {
        toast.error('Koltuklar yüklenirken hata oluştu');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();
  }, [bookingData.flightId, navigate]);

  // Koltuk seçimi
  const handleSeatClick = (seat) => {
    if (seat.status === 'BOOKED') return;

    const currentSelections = Object.keys(selectedSeats);
    const isAlreadySelected = currentSelections.some(
      (passengerId) => selectedSeats[passengerId] === seat.seatNumber
    );

    if (isAlreadySelected) {
      // Koltuğu kaldır
      const newSelections = { ...selectedSeats };
      const passengerIdToRemove = Object.keys(newSelections).find(
        (id) => newSelections[id] === seat.seatNumber
      );
      delete newSelections[passengerIdToRemove];
      setSelectedSeats(newSelections);
    } else {
      // Yeni koltuk seç
      if (currentSelections.length < bookingData.passengerCount) {
        const nextPassengerIndex = currentSelections.length;
        setSelectedSeats({
          ...selectedSeats,
          [nextPassengerIndex]: seat.seatNumber
        });
      } else {
        toast.warning('Tüm yolcular için koltuk seçildi!');
      }
    }
  };

  // Koltuk durumunu belirle
  const getSeatStatus = (seat) => {
    if (seat.status === 'BOOKED') return 'booked';
    
    const isSelected = Object.values(selectedSeats).includes(seat.seatNumber);
    if (isSelected) return 'selected';
    
    return 'available';
  };

  // Koltuk rengini belirle
  const getSeatColor = (status) => {
    switch (status) {
      case 'booked':
        return 'bg-red-500 cursor-not-allowed';
      case 'selected':
        return 'bg-gray-500 hover:bg-gray-600 cursor-pointer';
      case 'available':
        return 'bg-green-500 hover:bg-green-600 cursor-pointer';
      default:
        return 'bg-gray-300';
    }
  };

  // Koltuğu hangi yolcu seçti?
  const getPassengerForSeat = (seatNumber) => {
    const passengerIndex = Object.keys(selectedSeats).find(
      (id) => selectedSeats[id] === seatNumber
    );
    return passengerIndex !== undefined ? parseInt(passengerIndex) : null;
  };

  // Satın alma
  const handlePurchase = async () => {
    if (Object.keys(selectedSeats).length !== bookingData.passengerCount) {
      toast.warning('Lütfen tüm yolcular için koltuk seçin!');
      return;
    }

    setPurchasing(true);

    try {
      // Yolcu verilerini güncelle (koltuk numaralarını ekle)
      const updatedPassengers = bookingData.passengers.map((passenger, index) => ({
        ...passenger,
        selectedSeatNumber: selectedSeats[index]
      }));

      const purchaseData = {
        flightId: bookingData.flightId,
        contactEmail: bookingData.contactEmail,
        passengers: updatedPassengers
      };

      const result = await seatService.buyTicket(purchaseData);
      setPurchaseResult(result);
      setShowSuccessModal(true);
    } catch (error) {
      toast.error('Bilet satın alınırken hata oluştu!');
      console.error(error);
    } finally {
      setPurchasing(false);
    }
  };

  // Koltukları satırlara göre grupla
  const groupSeatsByRow = () => {
    const rows = {};
    seats.forEach((seat) => {
      const row = seat.seatNumber.slice(0, -1); // "1A" -> "1"
      if (!rows[row]) rows[row] = [];
      rows[row].push(seat);
    });
    return rows;
  };

  const seatRows = groupSeatsByRow();
  const rowNumbers = Object.keys(seatRows).sort((a, b) => parseInt(a) - parseInt(b));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Plane className="animate-bounce mx-auto mb-4 text-blue-600" size={48} />
          <p className="text-gray-600">Koltuklar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* BAŞLIK */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Plane className="text-blue-600" size={32} />
            Koltuk Seçimi
          </h1>
          <p className="text-gray-600">
            {bookingData.passengerCount} yolcu için koltuk seçin
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* KOLTUK HARİTASI */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              
              {/* Uçak Başı */}
              <div className="bg-gradient-to-b from-blue-600 to-blue-700 text-white rounded-t-3xl py-4 mb-6 -mx-8 -mt-8 text-center">
                <Plane className="mx-auto mb-2" size={32} />
                <p className="font-bold">Uçak Başı</p>
              </div>

              {/* Koltuk Düzeni */}
              <div className="space-y-3">
                {rowNumbers.map((rowNum) => {
                  const rowSeats = seatRows[rowNum].sort((a, b) => 
                    a.seatNumber.localeCompare(b.seatNumber)
                  );

                  return (
                    <div key={rowNum} className="flex items-center gap-2">
                      {/* Sıra Numarası */}
                      <div className="w-8 text-center font-bold text-gray-600 text-sm">
                        {rowNum}
                      </div>

                      {/* Sol Koltuklar (A, B, C) */}
                      <div className="flex gap-2">
                        {rowSeats.slice(0, 3).map((seat) => {
                          const status = getSeatStatus(seat);
                          const passengerIndex = getPassengerForSeat(seat.seatNumber);
                          
                          return (
                            <button
                              key={seat.id}
                              onClick={() => handleSeatClick(seat)}
                              disabled={status === 'booked'}
                              className={`w-12 h-12 rounded-lg font-bold text-white text-sm transition-all transform hover:scale-105 ${getSeatColor(status)} flex items-center justify-center relative`}
                              title={`${seat.seatNumber} - ${status === 'booked' ? 'Dolu' : status === 'selected' ? 'Seçildi' : 'Uygun'}`}
                            >
                              {seat.seatNumber.slice(-1)}
                              {passengerIndex !== null && (
                                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                                  {passengerIndex + 1}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Koridor */}
                      <div className="w-8 text-center text-gray-400 text-xs font-bold">
                        ||
                      </div>

                      {/* Sağ Koltuklar (D, E, F) */}
                      <div className="flex gap-2">
                        {rowSeats.slice(3, 6).map((seat) => {
                          const status = getSeatStatus(seat);
                          const passengerIndex = getPassengerForSeat(seat.seatNumber);
                          
                          return (
                            <button
                              key={seat.id}
                              onClick={() => handleSeatClick(seat)}
                              disabled={status === 'booked'}
                              className={`w-12 h-12 rounded-lg font-bold text-white text-sm transition-all transform hover:scale-105 ${getSeatColor(status)} flex items-center justify-center relative`}
                              title={`${seat.seatNumber} - ${status === 'booked' ? 'Dolu' : status === 'selected' ? 'Seçildi' : 'Uygun'}`}
                            >
                              {seat.seatNumber.slice(-1)}
                              {passengerIndex !== null && (
                                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                                  {passengerIndex + 1}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Koltuk Açıklama */}
              <div className="flex justify-center gap-6 mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500 rounded-lg"></div>
                  <span className="text-sm text-gray-600">Uygun</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-500 rounded-lg"></div>
                  <span className="text-sm text-gray-600">Seçildi</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-500 rounded-lg"></div>
                  <span className="text-sm text-gray-600">Dolu</span>
                </div>
              </div>

            </div>
          </div>

          {/* İŞLEM ÖZETİ */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sticky top-4">
              
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="text-blue-600" size={24} />
                Seçilen Koltuklar
              </h3>

              <div className="space-y-3 mb-6">
                {bookingData.passengers.map((passenger, index) => {
                  const selectedSeat = selectedSeats[index];
                  
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedSeat
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          selectedSeat ? 'bg-blue-600' : 'bg-gray-400'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-800 text-sm">
                            {passenger.firstName} {passenger.lastName}
                          </p>
                          {selectedSeat ? (
                            <p className="text-blue-600 font-bold mt-1">
                              Koltuk: {selectedSeat}
                            </p>
                          ) : (
                            <p className="text-gray-400 text-xs mt-1">
                              Koltuk seçilmedi
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* İlerleme Çubuğu */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>İlerleme</span>
                  <span className="font-bold">
                    {Object.keys(selectedSeats).length} / {bookingData.passengerCount}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{
                      width: `${(Object.keys(selectedSeats).length / bookingData.passengerCount) * 100}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Onayla Butonu */}
              <button
                onClick={handlePurchase}
                disabled={Object.keys(selectedSeats).length !== bookingData.passengerCount || purchasing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3"
              >
                {purchasing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    İşleniyor...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={24} />
                    Satın Almayı Onayla
                  </>
                )}
              </button>

            </div>
          </div>

        </div>

      </div>

      {/* BAŞARI POPUP MODAL */}
      {showSuccessModal && purchaseResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 relative animate-in fade-in zoom-in">
            
            {/* Başarı İkonu */}
            <div className="text-center mb-6">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="text-green-600" size={48} />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Biletiniz Oluşturuldu!
              </h2>
              <p className="text-gray-600">Rezervasyon işleminiz başarıyla tamamlandı</p>
            </div>

            {/* PNR ve Detaylar */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">PNR Kodu</p>
                  <p className="text-2xl font-bold text-blue-600">{purchaseResult.pnr}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Toplam Tutar</p>
                  <p className="text-2xl font-bold text-gray-800">${purchaseResult.totalPrice.toFixed(2)}</p>
                </div>
              </div>

              <div className="border-t border-gray-300 pt-4">
                <p className="text-sm text-gray-600 mb-1">Uçuş Numarası</p>
                <p className="font-bold text-gray-800">{purchaseResult.flightNumber}</p>
                <p className="text-sm text-gray-600 mt-2">{purchaseResult.route}</p>
              </div>
            </div>

            {/* Biletler */}
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
              {purchaseResult.tickets.map((ticket, index) => (
                <div key={ticket.ticketId} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{ticket.passengerName}</p>
                      <p className="text-sm text-gray-600">Bilet #{ticket.ticketId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{ticket.seatNumber}</p>
                    <p className="text-xs text-gray-500">Koltuk</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Kapat Butonu */}
            <button
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/');
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
            >
              Ana Sayfaya Dön
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default SeatSelectionPage;