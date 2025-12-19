import React, { useState } from 'react';
import { X, Search, Ticket, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ticketService from '../../services/ticketService';

const PnrSearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [pnr, setPnr] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();

    if (pnr.length !== 6) {
      toast.warning('PNR kodu 6 karakter olmalıdır.');
      return;
    }
    if (identityNumber.length !== 11) {
      toast.warning('TC Kimlik numarası 11 haneli olmalıdır.');
      return;
    }

    setLoading(true);
    try {
      const result = await ticketService.searchByPnr(pnr.toUpperCase(), identityNumber);
      
      // Formu temizle (Bir sonraki açılış için)
      setPnr('');
      setIdentityNumber('');

      // Modalı kapat
      onClose();

   
      navigate('/pnr-details', { 
        state: { 
          ticketData: result,
          identityNumber: identityNumber ,// <--- EKLENEN KISIM
          searchedPnr: pnr // <--- BU SATIRI EKLE (Değişken scope'undan gelen ham pnr)
        } 
      });
      
    } catch (error) {
      console.error(error);
      toast.error('Bilet bulunamadı veya bilgiler hatalı.');
      // Hata durumunda inputları temizlemiyoruz, kullanıcı düzeltebilsin diye.
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white text-center relative">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 text-white/80 hover:text-white transition"
          >
            <X size={24} />
          </button>
          <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
            <Search size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold">Bilet Sorgula</h2>
          <p className="text-blue-100 text-sm mt-1">Uçuş detaylarınızı görüntüleyin</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSearch} className="p-8 space-y-5">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">PNR Kodu</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Ticket size={20} />
              </div>
              <input 
                type="text" 
                maxLength={6}
                value={pnr}
                onChange={(e) => setPnr(e.target.value.toUpperCase())}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase font-mono tracking-widest transition-all outline-none"
                placeholder="PNR123"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1 ml-1">Rezervasyon kodunuz (6 Haneli)</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">TC Kimlik No</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <User size={20} />
              </div>
              <input 
                type="text" 
                maxLength={11}
                value={identityNumber}
                onChange={(e) => setIdentityNumber(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-mono tracking-wide"
                placeholder="12345678901"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-blue-200 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? 'Sorgulanıyor...' : 'Bilet Bul'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default PnrSearchModal;