import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, Plane, CheckCircle } from 'lucide-react';

const PnrDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const ticket = location.state?.ticketData;

  // Eğer veri yoksa (direkt URL'den girildiyse) anasayfaya at
  if (!ticket) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-gray-500 mb-4">Bilet bilgisi bulunamadı.</p>
        <button onClick={() => navigate('/')} className="text-blue-600 font-bold hover:underline">
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  // Tarih formatlama
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
  const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Başlık */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm mb-4">
            <CheckCircle size={16} /> Rezervasyon Bulundu
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Uçuş Detaylarınız</h1>
          <p className="text-gray-500 mt-2">PNR: <span className="font-mono font-bold text-gray-800 text-lg">{ticket.id}</span></p> 
          {/* Not: Backend'de PNR kodu response içinde field olarak görünmüyor, 
             seatNumber veya ID var. Eğer PNR kodu response'ta yoksa burayı düzenle */}
        </div>

        {/* Bilet Kartı */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          
          {/* Üst Kısım: Rota */}
          <div className="bg-blue-600 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10 transform rotate-12">
               <Plane size={150} />
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
              <div className="text-center md:text-left">
                <div className="text-4xl font-bold mb-1">{ticket.departureAirportIataCode}</div>
                <div className="text-blue-100 text-lg">{ticket.departureAirportCity}</div>
                <div className="text-blue-200 text-sm mt-1">{formatTime(ticket.departureTime)}</div>
              </div>

              <div className="flex flex-col items-center">
                 <div className="border-b-2 border-dashed border-white/40 w-24 mb-2 relative">
                    <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 px-1 rotate-90" size={20} />
                 </div>
                 <div className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">Direkt</div>
              </div>

              <div className="text-center md:text-right">
                <div className="text-4xl font-bold mb-1">{ticket.arrivalAirportIataCode}</div>
                <div className="text-blue-100 text-lg">{ticket.arrivalAirportCity}</div>
                <div className="text-blue-200 text-sm mt-1">{formatTime(ticket.arrivalTime)}</div>
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
                  {formatDate(ticket.departureTime)}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Uçuş No</p>
                <p className="font-mono font-bold text-gray-800 text-lg">{ticket.flightNumber}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Koltuk</p>
                <p className="font-mono font-bold text-blue-600 text-lg">{ticket.seatNumber}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Durum</p>
                <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${ticket.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {ticket.status || 'AKTİF'}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6 flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-400">Ödenen Tutar</p>
                <p className="text-2xl font-bold text-gray-800">{ticket.soldPrice} $</p>
              </div>
              <button 
                onClick={() => navigate('/')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PnrDetailsPage;