import api from './api';
import { addDays, subDays, format, isBefore, startOfToday } from 'date-fns';

const formatDateForApi = (dateObj) => format(dateObj, 'yyyy-MM-dd');

// Tekil İstek
const fetchFlightsByDate = async (fromCode, toCode, dateStr, isRoundTrip = false) => {
  try {
    const response = await api.get('/public/flights/search', {
      params: {
        departureAirportIataCode: fromCode,
        arrivalAirportIataCode: toCode,
        departureDate: dateStr,
        isRoundTrip: isRoundTrip
      },
    });
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching flights for ${dateStr}:`, error);
    return [];
  }
};

// 3 Günlük Arama Stratejisi (Tek Yön veya Gidiş-Dönüş)
const searchFlightsWithNeighbors = async (fromCode, toCode, selectedDateStr, isRoundTrip = false) => {
  const [year, month, day] = selectedDateStr.split('-').map(Number);
  const selectedDate = new Date(year, month - 1, day);
  const today = startOfToday();

  const prevDate = subDays(selectedDate, 1);
  const nextDate = addDays(selectedDate, 1);

  const shouldFetchPrev = !isBefore(prevDate, today);

  const promises = [
    fetchFlightsByDate(fromCode, toCode, formatDateForApi(selectedDate), isRoundTrip), // [0] Seçilen gün
    fetchFlightsByDate(fromCode, toCode, formatDateForApi(nextDate), isRoundTrip),     // [1] Sonraki gün
  ];

  if (shouldFetchPrev) {
    promises.push(fetchFlightsByDate(fromCode, toCode, formatDateForApi(prevDate), isRoundTrip)); // [2] Önceki gün
  }

  const results = await Promise.all(promises);

  return {
    selectedDate: { date: selectedDate, data: results[0] },
    nextDay: { date: nextDate, data: results[1] },
    prevDay: shouldFetchPrev ? { date: prevDate, data: results[2] } : null,
  };
};

// Gidiş ve Dönüş Uçuşlarını Birlikte Getir
const searchRoundTripFlights = async (
  departureCode,
  arrivalCode,
  departureDateStr,
  returnDateStr
) => {
  try {
    // Gidiş uçuşları (3 günlük)
    const departureFlights = await searchFlightsWithNeighbors(
      departureCode,
      arrivalCode,
      departureDateStr,
      true
    );

    // Dönüş uçuşları (3 günlük) - Ters yön
    const returnFlights = await searchFlightsWithNeighbors(
      arrivalCode,        // Ters yön
      departureCode,      // Ters yön
      returnDateStr,
      true
    );

    return {
      departure: departureFlights,
      return: returnFlights
    };
  } catch (error) {
    console.error('Error searching round trip flights:', error);
    throw error;
  }
};

export default {
  searchFlightsWithNeighbors,
  searchRoundTripFlights,
  fetchFlightsByDate
};