import React from 'react';
import { Plane, Clock, ArrowRight, Luggage, MapPin } from 'lucide-react';
import { differenceInMinutes, format } from 'date-fns';

const priceFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

const FlightCard = ({ flight, onSelect }) => {
  const depTime = new Date(flight.departureTime);
  const arrTime = new Date(flight.arrivalTime);
  const hasValidDeparture = !isNaN(depTime);
  const hasValidArrival = !isNaN(arrTime);
  const depAirport = flight.departureAirport ?? {};
  const arrAirport = flight.arrivalAirport ?? {};
  const departureLocation = [depAirport.city, depAirport.country].filter(Boolean).join(', ');
  const arrivalLocation = [arrAirport.city, arrAirport.country].filter(Boolean).join(', ');
  const travelDateLabel = hasValidDeparture ? format(depTime, 'dd MMM yyyy') : 'Tarih Bilinmiyor';

  // Süre Hesaplama (negatif sonuçları engelle)
  const rawMinutes = hasValidDeparture && hasValidArrival ? differenceInMinutes(arrTime, depTime) : 0;
  const diffMinutes = Math.max(rawMinutes, 0);
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  const durationStr =
    hasValidDeparture && hasValidArrival
      ? `${hours ? `${hours}sa` : ''}${minutes ? ` ${minutes}dk` : hours ? '' : '0dk'}`
      : '--';
  const formattedPrice = priceFormatter.format(Number(flight.currentPrice) || 0);

  return (
    <div className="bg-white/95 border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between text-xs font-semibold text-gray-500 uppercase tracking-wide gap-2">
        <div>{travelDateLabel}</div>
        <div className="flex items-center gap-2 text-gray-400">
          <span>Sefer No</span>
          <span className="text-blue-600 text-sm bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
            {flight.flightNumber || 'Belirsiz'}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {/* SOL TARA: Uçuş Bilgileri */}
        <div className="flex-1 w-full">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Kalkış */}
            <div className="text-center md:text-left min-w-[120px] space-y-1">
              <div className="text-[11px] uppercase tracking-[0.2em] text-gray-400">Kalkış</div>
              <div className="text-3xl font-bold text-gray-900">
                {hasValidDeparture ? format(depTime, 'HH:mm') : '--'}
              </div>
              <div className="text-sm font-semibold text-gray-600">{depAirport.iataCode || '--'}</div>
              {departureLocation && (
                <div className="flex items-center justify-center md:justify-start gap-1 text-xs text-gray-500">
                  <MapPin size={12} /> {departureLocation}
                </div>
              )}
              {depAirport.name && <div className="text-xs text-gray-400">{depAirport.name}</div>}
            </div>

            {/* Rota Görseli */}
            <div className="flex flex-col items-center px-4 flex-1">
              <div className="text-xs text-gray-500 mb-2 flex items-center gap-1 font-medium">
                <Clock size={14} /> {durationStr.trim()}
              </div>
              <div className="relative w-full h-[2px] bg-gray-200">
                <div className="absolute -top-[5px] right-0 text-blue-500 bg-white rounded-full shadow p-1">
                  <Plane size={14} className="rotate-90" />
                </div>
              </div>
              <div className="text-[10px] text-gray-400 mt-2 uppercase tracking-[0.4em] font-bold">Direkt</div>
            </div>

            {/* Varış */}
            <div className="text-center md:text-right min-w-[120px] space-y-1">
              <div className="text-[11px] uppercase tracking-[0.2em] text-gray-400">Varış</div>
              <div className="text-3xl font-bold text-gray-900">
                {hasValidArrival ? format(arrTime, 'HH:mm') : '--'}
              </div>
              <div className="text-sm font-semibold text-gray-600">{arrAirport.iataCode || '--'}</div>
              {arrivalLocation && (
                <div className="flex items-center justify-center md:justify-end gap-1 text-xs text-gray-500">
                  <MapPin size={12} /> {arrivalLocation}
                </div>
              )}
              {arrAirport.name && <div className="text-xs text-gray-400">{arrAirport.name}</div>}
            </div>
          </div>
        </div>

        {/* SAĞ TARAF: Fiyat ve Buton */}
        <div className="lg:w-56 w-full bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-inner">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-[0.3em] text-blue-100">Fiyat</div>
            <span className="block text-3xl font-semibold">
              {formattedPrice}
            </span>
          </div>
          <button
            onClick={() => onSelect(flight)}
            className="bg-white/15 hover:bg-white/20 text-white font-bold py-3 w-full rounded-xl transition-colors flex items-center justify-center gap-2 backdrop-blur-sm"
          >
            Seç <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Alt Bilgi (Sefer Bilgileri) */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-600">
        <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
          <Luggage size={14} /> 15 kg Bagaj Dahil
        </span>
        {depAirport.name && (
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
            Kalkış: {depAirport.name}
          </span>
        )}
        {arrAirport.name && (
          <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-100">
            Varış: {arrAirport.name}
          </span>
        )}
        {flight.id && (
          <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-100">
            Uçuş ID #{flight.id}
          </span>
        )}
      </div>
    </div>
  );
};

export default FlightCard;
