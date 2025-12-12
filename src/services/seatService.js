import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/public';

const seatService = {
  // Uçuşa ait koltukları getir
  getSeats: async (flightId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/seats/${flightId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching seats:', error);
      throw error;
    }
  },

  // Bilet satın alma
  buyTicket: async (bookingData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tickets/buy`, bookingData);
      return response.data;
    } catch (error) {
      console.error('Error buying ticket:', error);
      throw error;
    }
  }
};

export default seatService;