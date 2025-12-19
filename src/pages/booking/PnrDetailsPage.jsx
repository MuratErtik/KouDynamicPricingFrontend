import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, Plane, CheckCircle, Trash2, AlertTriangle } from 'lucide-react';
import ticketService from '../../services/ticketService'; 
import { toast } from 'react-toastify';

const PnrDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Önceki sayfadan gelen veriler
  const initialTicket = location.state?.ticketData;
  const identityNumber = location.state?.identityNumber; 

  // PNR Kodu önceliği: 
  // 1. Arama ekranından (Modal) gelen 'searchedPnr'
  // 2. Eğer o yoksa bilet objesi içindeki 'pnr'
  // 3. Eğer o da yoksa bilet 'id'si (Fallback)
  const pnrCode = location.state?.searchedPnr || initialTicket?.pnr || initialTicket?.id;

  // UI'da anlık güncelleme görebilmek için ticket verisini state'e alıyoruz
  const [currentTicket, setCurrentTicket] = useState(initialTicket);
  const [loading, setLoading] = useState(false);

  // Eğer veri yoksa (direkt URL'den girildiyse) anasayfaya at
  if (!currentTicket) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-gray-500 mb-4">Bilet bilgisi bulunamadı.</p>
        <button onClick={() => navigate('/')} className="text-blue-600 font-bold hover:underline">
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  // --- İPTAL FONKSİYONU ---
  const handleCancelTicket = async () => {
    // 1. Kullanıcıdan onay al
    if (!window.confirm("Bu bileti iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
      return;
    }

    setLoading(true);
    try {
      // DÜZELTME: Burada yeniden const pnrCode = ... tanımlamıyoruz.
      // Yukarıda (satır 19) tanımladığımız dolu değişkeni kullanıyoruz.
      
      console.log("İptal İsteği Gönderiliyor -> PNR:", pnrCode, "TC:", identityNumber); // Debug için

      await ticketService.cancelTicket(pnrCode, identityNumber);
      
      toast.success("Bilet başarıyla iptal edildi.");
      
      // 2. State'i güncelle (Sayfayı yenilemeden durumu değiştir)
      setCurrentTicket(prev => ({
        ...prev,
        status: 'CANCELLED'
      }));

    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.error || "İptal işlemi başarısız.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Tarih formatlama yardımcıları
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
  const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  // Status kontrolü (Backend Enum'ına göre)
  const isCancelled = currentTicket.status === 'CANCELLED';

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Başlık */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm mb-4 ${isCancelled ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {isCancelled ? <AlertTriangle size={16}/> : <CheckCircle size={16} />}
            {isCancelled ? 'Rezervasyon İptal Edildi' : 'Rezervasyon Bulundu'}
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Uçuş Detaylarınız</h1>
          {/* Gösterirken de pnrCode değişkenini kullanıyoruz ki tutarlı olsun */}
          <p className="text-gray-500 mt-2">PNR: <span className="font-mono font-bold text-gray-800 text-lg">{pnrCode}</span></p> 
        </div>

        {/* Bilet Kartı */}
        <div className={`bg-white rounded-3xl shadow-xl overflow-hidden border ${isCancelled ? 'border-red-200' : 'border-gray-100'} transition-all`}>
          
          {/* Üst Kısım: Rota */}
          <div className={`${isCancelled ? 'bg-gray-600' : 'bg-blue-600'} p-8 text-white relative overflow-hidden transition-colors duration-500`}>
            <div className="absolute top-0 right-0 p-10 opacity-10 transform rotate-12">
               <Plane size={150} />
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
              <div className="text-center md:text-left">
                <div className="text-4xl font-bold mb-1">{currentTicket.departureAirportIataCode}</div>
                <div className="text-blue-100 text-lg">{currentTicket.departureAirportCity}</div>
                <div className="text-blue-200 text-sm mt-1">{formatTime(currentTicket.departureTime)}</div>
              </div>

              <div className="flex flex-col items-center">
                 <div className="border-b-2 border-dashed border-white/40 w-24 mb-2 relative">
                    <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white px-1 rotate-90" size={20} fill="currentColor" />
                 </div>
                 <div className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">Direkt</div>
              </div>

              <div className="text-center md:text-right">
                <div className="text-4xl font-bold mb-1">{currentTicket.arrivalAirportIataCode}</div>
                <div className="text-blue-100 text-lg">{currentTicket.arrivalAirportCity}</div>
                <div className="text-blue-200 text-sm mt-1">{formatTime(currentTicket.arrivalTime)}</div>
              </div>
            </div>
          </div>

          {/* Alt Kısım: Detaylar */}
          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Uçuş Tarihi</p>
                <div className="flex items-center gap-2 font-semibold text-gray-700">
                  <Calendar size={18} className="text-blue-500" />
                  {formatDate(currentTicket.departureTime)}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Uçuş No</p>
                <p className="font-mono font-bold text-gray-800 text-lg">{currentTicket.flightNumber}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Koltuk</p>
                <p className="font-mono font-bold text-blue-600 text-lg">{currentTicket.seatNumber}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Durum</p>
                <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${isCancelled ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {currentTicket.status || 'AKTİF'}
                </span>
              </div>
            </div>

            {/* Footer Butonları */}
            <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-xs text-gray-400">Ödenen Tutar</p>
                <p className={`text-2xl font-bold ${isCancelled ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                  {currentTicket.soldPrice} $
                </p>
              </div>
              
              <div className="flex gap-3 w-full md:w-auto">
                {/* İPTAL BUTONU */}
                {!isCancelled && (
                  <button 
                    onClick={handleCancelTicket}
                    disabled={loading}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-6 py-3 rounded-xl font-bold transition disabled:opacity-50"
                  >
                    {loading ? 'İşleniyor...' : (
                      <>
                        <Trash2 size={18} />
                        Bilet İptal
                      </>
                    )}
                  </button>
                )}

                {/* KAPAT BUTONU */}
                <button 
                  onClick={() => navigate('/')}
                  className="flex-1 md:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold transition"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PnrDetailsPage;