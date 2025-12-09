import api from './api';

let allAirportsCache = null;

// Gelişmiş Normalizasyon: Türkçe/İngilizce karakter sorununu çözer
// Örn: "İSTANBUL" -> "istanbul", "Iğdır" -> "igdir"
const normalizeString = (str) => {
  if (!str) return "";
  return str
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i') // ASCII 'I' yı da 'i' yapıyoruz ki "Istanbul" -> "is..." ile bulunsun
    .replace(/ı/g, 'i')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Aksanları sil
};

const searchAirports = async (query) => {
  if (!query || query.length < 2) return [];

  try {
    if (!allAirportsCache) {
      const response = await api.get('/public/airport/search'); // Tüm listeyi çek
      allAirportsCache = response.data;
    }

    const normalizedQuery = normalizeString(query);

    const filteredResults = allAirportsCache.filter((airport) => {
      const city = normalizeString(airport.city);
      const country = normalizeString(airport.country);
      const name = normalizeString(airport.name);
      const iata = normalizeString(airport.iataCode);

      return city.includes(normalizedQuery) || 
             country.includes(normalizedQuery) || 
             name.includes(normalizedQuery) || 
             iata.includes(normalizedQuery);
    });

    return filteredResults;

  } catch (error) {
    console.error("Havalimanı listesi çekilemedi:", error);
    return [];
  }
};

export default {
  searchAirports
};