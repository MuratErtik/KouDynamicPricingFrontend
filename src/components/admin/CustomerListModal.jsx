import React from 'react';
import { X, Users, Mail, Phone, Calendar, Armchair, CreditCard, Ticket } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const CustomerListModal = ({ isOpen, onClose, customers, flightNumber }) => {
  if (!isOpen) return null;

  // Toplam Ciro Hesaplama
  const totalRevenue = customers ? customers.reduce((acc, curr) => acc + curr.soldPrice, 0) : 0;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* --- HEADER --- */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-800 p-6 flex justify-between items-center text-white shrink-0">
          <div>
            <div className="flex items-center gap-2 opacity-80 mb-1">
              <Users size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Yolcu Listesi & Rezervasyonlar</span>
            </div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Uçuş <span className="font-mono bg-white/20 px-2 rounded">{flightNumber}</span>
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* --- ÖZET İSTATİSTİKLER --- */}
        <div className="flex gap-4 p-6 bg-gray-50 border-b border-gray-100 shrink-0">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1 flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full text-purple-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold">Toplam Yolcu</p>
              <p className="text-2xl font-bold text-gray-800">{customers?.length || 0}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full text-green-600">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold">Toplam Ciro</p>
              <p className="text-2xl font-bold text-gray-800">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* --- TABLO ALANI --- */}
        <div className="overflow-auto p-0 flex-1">
          {!customers || customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Users size={48} className="mb-4 opacity-20" />
              <p>Bu uçuş için henüz kayıtlı yolcu bulunmamaktadır.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">PNR</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Yolcu Bilgileri</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">İletişim</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Koltuk</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Satın Alma Tarihi</th>
                  <th className="p-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Tutar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((item) => (
                  <tr key={item.id} className="hover:bg-purple-50/50 transition-colors group">
                    
                    {/* PNR */}
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Ticket size={16} className="text-purple-400" />
                        <span className="font-mono font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                          {item.pnr}
                        </span>
                      </div>
                    </td>

                    {/* YOLCU ADI */}
                    <td className="p-4 align-middle">
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{item.passenger.firstName} {item.passenger.lastName}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <span className="uppercase">Doğum:</span> 
                            {format(new Date(item.passenger.birthDate), 'dd.MM.yyyy')}
                        </p>
                      </div>
                    </td>

                    {/* İLETİŞİM */}
                    <td className="p-4 align-middle">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Mail size={14} className="text-gray-400" />
                          {item.passenger.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Phone size={14} className="text-gray-400" />
                          {item.passenger.phone}
                        </div>
                      </div>
                    </td>

                    {/* KOLTUK */}
                    <td className="p-4 align-middle">
                       <div className="flex items-center gap-2">
                          <Armchair size={16} className="text-blue-500" />
                          <span className="font-bold text-gray-700">{item.seat.seatNumber}</span>
                       </div>
                    </td>

                    {/* TARİH */}
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} className="text-gray-400" />
                        {format(new Date(item.purchaseDate), 'dd MMM yyyy HH:mm', { locale: tr })}
                      </div>
                    </td>

                    {/* TUTAR */}
                    <td className="p-4 align-middle text-right">
                      <span className="font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
                        ${item.soldPrice.toFixed(2)}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerListModal;