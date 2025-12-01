import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import publicService from '../../services/publicService';
import { toast } from 'react-toastify';
import { Check } from 'lucide-react';

const SeatSelectionPage = () => {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);

  useEffect(() => {
    publicService.getFlightSeats(flightId).then(setSeats).catch(console.error);
  }, [flightId]);

  const handleSeatClick = (seat) => {
    if (seat.status === 'BOOKED') return;
    setSelectedSeat(seat);
  };

  const handleCompleteBooking = () => {
    if (!selectedSeat) {
      toast.warning("Lütfen bir koltuk seçin.");
      return;
    }
    toast.success(`Koltuk ${selectedSeat.seatNumber} için rezervasyon oluşturuldu!`);
    setTimeout(() => navigate('/'), 2000); // Mock işlem sonu
  };

  // Koltuk Rengi Belirleme
  const getSeatColor = (seat) => {
    if (seat.status === 'BOOKED') return 'bg-red-400 cursor-not-allowed text-white';
    if (selectedSeat?.id === seat.id) return 'bg-yellow-400 text-black border-yellow-500';
    if (seat.seatClass === 'BUSINESS') return 'bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-800';
    return 'bg-white hover:bg-blue-50 border-gray-300 text-gray-600';
  };

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-8 max-w-6xl mt-6">
      {/* Sol: Koltuk Haritası */}
      <div className="flex-1 bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-center text-xl font-bold text-gray-700 mb-8">Uçak Önü</h2>
        
        {/* Grid Yapısı: 3 Koltuk - Boşluk - 3 Koltuk */}
        <div className="grid grid-cols-7 gap-y-4 gap-x-2 max-w-sm mx-auto">
          {/* Harfleri Göster (A B C _ D E F) */}
          {['A','B','C','','D','E','F'].map((char, i) => (
            <div key={i} className="text-center font-bold text-gray-400 mb-2">{char}</div>
          ))}

          {/* Koltukları Listele */}
          {seats.map((seat, index) => {
             // Her 3 koltuktan sonra 1 boş div (koridor) eklemek için mantık kurulabilir
             // Ancak basitlik için backend'in sıralı (1A, 1B, 1C, 1D...) geldiğini varsayarak
             // CSS Grid ile 3. elemanda bir boşluk bırakmak daha kolaydır.
             // Burada CSS Grid'in 'nth-child' özelliğini kullanamadığımız için 
             // map içinde koridor eklemek karmaşık olabilir. 
             // Basit çözüm: Backend sıralamasına güvenmek veya frontend'de grouplamak.
             // Şimdilik düz grid (koridorsuz gibi) gösterip CSS ile stil verelim:
             
             return (
               <React.Fragment key={seat.id}>
                 {/* Koridor boşluğu (3. koltuktan sonra, yani index 3, 9, 15...) */}
                 {index > 0 && index % 6 === 3 && <div className="w-8"></div>} 
                 
                 <button
                    onClick={() => handleSeatClick(seat)}
                    disabled={seat.status === 'BOOKED'}
                    className={`
                      h-12 w-10 rounded-t-lg border-b-4 text-xs font-bold transition-all
                      flex items-center justify-center
                      ${getSeatColor(seat)}
                      ${index % 6 === 3 ? 'col-start-5' : ''} // Bu kısım grid mantığına göre backend verisine bağlıdır
                    `}
                    // Not: Gerçek senaryoda veriyi "row" bazlı gruplamak gerekir.
                    // Burada basitleştirilmiş bir liste gösterimi yapıyoruz.
                 >
                   {seat.seatNumber}
                 </button>
                 
                 {/* 3. koltuktan sonra grid'de otomatik boşluk bırakmak için grid-cols-7 kullandık.
                     Eğer veri sıralıysa (A,B,C,D,E,F) araya boş div koymalıyız. 
                  */}
                 {seat.seatNumber.endsWith('C') && <div className="text-center text-gray-300 text-xs flex items-center justify-center">|</div>}
               </React.Fragment>
             );
          })}
        </div>
      </div>

      {/* Sağ: Özet Paneli */}
      <div className="w-full md:w-80 h-fit bg-white p-6 rounded-xl shadow-lg border border-blue-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Seçim Özeti</h3>
        
        <div className="mb-4">
          <span className="text-gray-500 text-sm">Seçilen Koltuk</span>
          <div className="text-3xl font-bold text-blue-600">
            {selectedSeat ? selectedSeat.seatNumber : '-'}
          </div>
          {selectedSeat && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {selectedSeat.seatClass}
            </span>
          )}
        </div>

        <div className="mb-6">
          <span className="text-gray-500 text-sm">Toplam Tutar</span>
          <div className="text-2xl font-bold text-gray-800">
            {selectedSeat ? `${selectedSeat.price} ₺` : '0 ₺'}
          </div>
        </div>

        <button 
          onClick={handleCompleteBooking}
          disabled={!selectedSeat}
          className={`w-full py-3 rounded-lg font-bold flex justify-center items-center gap-2 transition
            ${selectedSeat 
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg cursor-pointer' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
          `}
        >
          <Check size={20} /> Ödemeyi Tamamla
        </button>
      </div>
    </div>
  );
};

export default SeatSelectionPage;