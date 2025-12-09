import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import flightSearchService from '../../services/flightSearchService';
import FlightCard from './FlightCard';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  CalendarX,
  ArrowRight
} from 'lucide-react';

// ✅ Helper: Fiyatları karşılaştır
const getMinPrice = (dataList) => {
  if (!dataList?.length) return null;
  return Math.min(...dataList.map(f => f.currentPrice));
};

// ✅ DateTab bileşenini dışarı al
const DateTab = ({ info, isSelected, label, onClick }) => {
  if (!info) {
    return (
      <div className="flex-1 bg-gray-50 rounded-lg p-3 opacity-50 cursor-not-allowed border border-transparent"></div>
    );
  }

  const minPrice = getMinPrice(info.data);
  const labelIcon =
    label === 'prev' ? <ChevronLeft size={14} /> : label === 'next' ? <ChevronRight size={14} /> : null;

  return (
    <button
      onClick={() => onClick(info.date)}
      disabled={isSelected}
      className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 ${
        isSelected
          ? 'bg-blue-600 text-white shadow-md border-blue-600 transform scale-105 z-10'
          : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-600'
      }`}
    >
      <div className={`flex items-center gap-2 text-xs font-bold uppercase mb-1 ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
        {labelIcon}
        {format(info.date, 'd MMM, EEEE', { locale: tr })}
      </div>

      {minPrice ? (
        <div className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-800'}`}>${minPrice}</div>
      ) : (
        <div className={`text-xs font-medium ${isSelected ? 'text-blue-200' : 'text-red-400'}`}>Uçuş Yok</div>
      )}
    </button>
  );
};

const FlightResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [flights, setFlights] = useState([]);
  const [prevDayInfo, setPrevDayInfo] = useState(null);
  const [nextDayInfo, setNextDayInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const departureCode = searchParams.get('departureAirportIataCode');
  const arrivalCode = searchParams.get('arrivalAirportIataCode');
  const dateStr = searchParams.get('departureDate');

  useEffect(() => {
    const fetchFlights = async () => {
      if (!departureCode || !arrivalCode || !dateStr) return;

      setLoading(true);
      try {
        const result = await flightSearchService.searchFlightsWithNeighbors(
          departureCode,
          arrivalCode,
          dateStr
        );
        setFlights(result.selectedDate.data);
        setPrevDayInfo(result.prevDay);
        setNextDayInfo(result.nextDay);
      } catch (error) {
        console.error('Flights could not be fetched:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [departureCode, arrivalCode, dateStr]);

  // ✅ URL'yi güncelle - useCallback ile optimize
  const changeDate = useCallback((newDate) => {
    const newDateStr = format(newDate, 'yyyy-MM-dd');
    setSearchParams(params => {
      params.set('departureDate', newDateStr);
      return params;
    });
  }, [setSearchParams]);

  return (
    <div className="container mx-auto px-4 max-w-5xl">

      {/* Header */}
      <div className="mb-8 mt-4">
        <div className="flex items-center gap-3 text-3xl font-bold text-gray-800">
          <span>{departureCode}</span>
          <ArrowRight className="text-blue-500" size={28} />
          <span>{arrivalCode}</span>
        </div>
        <p className="text-gray-500 mt-1">
          {format(new Date(dateStr), 'd MMMM yyyy, EEEE', { locale: tr })} uçuş sonuçları
        </p>
      </div>

      {/* Date Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        <DateTab info={prevDayInfo} isSelected={false} label="prev" onClick={changeDate} />
        <DateTab info={{ date: new Date(dateStr), data: flights }} isSelected={true} label="current" onClick={changeDate} />
        <DateTab info={nextDayInfo} isSelected={false} label="next" onClick={changeDate} />
      </div>

      {/* Flight Results */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse border border-gray-200"></div>
          ))}
          <div className="text-center text-gray-500 mt-4 flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={20} />
            Uçuşlar aranıyor...
          </div>
        </div>
      ) : flights.length > 0 ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {flights.map(flight => (
            <FlightCard
              key={flight.id}
              flight={flight}
              onSelect={(f) => console.log('Seçilen Uçuş:', f)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="bg-blue-50 p-6 rounded-full mb-4">
            <CalendarX size={48} className="text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Uçuş Bulunamadı</h3>
          <p className="text-gray-500 mt-2 text-center max-w-md">
            Seçtiğiniz tarihte bu rotada planlanmış uçuşumuz bulunmamaktadır.
            <br />Lütfen üstteki sekmelerden farklı bir tarih seçmeyi deneyin.
          </p>
          <button
            onClick={() => changeDate(nextDayInfo?.date || new Date())}
            className="mt-6 text-white bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition shadow-md"
          >
            Sonraki Günü Kontrol Et
          </button>
        </div>
      )}
    </div>
  );
};

export default FlightResults;
