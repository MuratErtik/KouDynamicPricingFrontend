import api from './api';
import { addDays, subDays, format, isBefore, startOfToday } from 'date-fns';

const formatDateForApi = (dateObj) => format(dateObj, 'yyyy-MM-dd');

// Tekil İstek
const fetchFlightsByDate = async (fromCode, toCode, dateStr) => {
  try {
    // BURASI ÇOK ÖNEMLİ:
    // Frontend (fromCode) -> Backend (departureAirportIataCode) eşleşmesi burada yapılır.
    const response = await api.get('/public/flights/search', {
      params: {
        departureAirportIataCode: fromCode, // Parametre eşleşmesi
        arrivalAirportIataCode: toCode,     // Parametre eşleşmesi
        departureDate: dateStr,
        // Backend 'passengers' parametresi beklemediği için göndermiyoruz.
      },
    });
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching flights for ${dateStr}:`, error);
    return [];
  }
};

// 3 Günlük Arama Stratejisi
const searchFlightsWithNeighbors = async (fromCode, toCode, selectedDateStr) => {
  const selectedDate = new Date(selectedDateStr);
  const today = startOfToday();

  const prevDate = subDays(selectedDate, 1);
  const nextDate = addDays(selectedDate, 1);

  const shouldFetchPrev = !isBefore(prevDate, today);

  const promises = [
    fetchFlightsByDate(fromCode, toCode, formatDateForApi(selectedDate)), // [0] Bugün
    fetchFlightsByDate(fromCode, toCode, formatDateForApi(nextDate)),     // [1] Yarın
  ];

  if (shouldFetchPrev) {
    promises.push(fetchFlightsByDate(fromCode, toCode, formatDateForApi(prevDate))); // [2] Dün
  }

  const results = await Promise.all(promises);

  return {
    selectedDate: { date: selectedDate, data: results[0] },
    nextDay: { date: nextDate, data: results[1] },
    prevDay: shouldFetchPrev ? { date: prevDate, data: results[2] } : null,
  };
};

export default {
  searchFlightsWithNeighbors,
};