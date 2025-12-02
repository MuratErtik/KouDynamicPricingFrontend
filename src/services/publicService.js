import api from './api';

const getAirports = async () => {
  const response = await api.get('/public/airport/get-all');
  return response.data;
};

const searchFlights = async (fromId, toId, date) => {
  // Query parametreleri ile arama
  const response = await api.get(`/public/flights/search?from=${fromId}&to=${toId}&date=${date}`);
  return response.data;
};

const getFlightSeats = async (flightId) => {
  const response = await api.get(`/public/flights/${flightId}/seats`);
  return response.data;
};

export default {
  getAirports,
  searchFlights,
  getFlightSeats
};