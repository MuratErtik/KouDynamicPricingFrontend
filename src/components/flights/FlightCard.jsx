import React from 'react';
import { Plane, Clock, ArrowRight, Luggage } from 'lucide-react';
import { differenceInMinutes, format } from 'date-fns';

const FlightCard = ({ flight, onSelect }) => {
  const depTime = new Date(flight.departureTime);
  const arrTime = new Date(flight.arrivalTime);

  // Süre Hesaplama
  const diffMinutes = differenceInMinutes(arrTime, depTime);
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  const durationStr = `${hours}sa ${minutes > 0 ? minutes + 'dk' : ''}`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all p-5 mb-4 flex flex-col md:flex-row items-center justify-between gap-6 group">
      
      {/* SOL TARA: Uçuş Bilgileri */}
      <div className="flex-1 w-full">
        <div className="flex items-center justify-between md:justify-start gap-8">
          
          {/* Kalkış */}
          <div className="text-center md:text-left">
            <div className="text-2xl font-bold text-gray-800">{format(depTime, 'HH:mm')}</div>
            <div className="text-sm font-semibold text-gray-500">{flight.departureAirport.iataCode}</div>
          </div>

          {/* Rota Görseli */}
          <div className="flex flex-col items-center px-4 w-32">
            <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
              <Clock size={12} /> {durationStr}
            </div>
            <div className="relative w-full h-[2px] bg-gray-300">
              <div className="absolute -top-[5px] right-0 text-blue-500">
                <Plane size={14} className="rotate-90" />
              </div>
            </div>
            <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-bold">Direkt</div>
          </div>

          {/* Varış */}
          <div className="text-center md:text-right">
            <div className="text-2xl font-bold text-gray-800">{format(arrTime, 'HH:mm')}</div>
            <div className="text-sm font-semibold text-gray-500">{flight.arrivalAirport.iataCode}</div>
          </div>
        </div>

        {/* Alt Bilgi (Sefer No / Bagaj) */}
        <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-medium border border-blue-100">
            {flight.flightNumber}
          </span>
          <span className="flex items-center gap-1">
            <Luggage size={14} /> 15 kg Bagaj
          </span>
        </div>
      </div>

      {/* SAĞ TARAF: Fiyat ve Buton */}
      <div className="w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 flex flex-row md:flex-col justify-between items-center gap-3">
        <div className="text-right">
          <span className="block text-2xl font-bold text-blue-700">
            ${flight.currentPrice}
          </span>
        </div>
        <button 
          onClick={() => onSelect(flight)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-8 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
        >
          Seç <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default FlightCard;