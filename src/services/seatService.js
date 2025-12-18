import api from './api';

const seatService = {
  // Uçuşa ait koltukları getir
  getSeats: async (flightId) => {
    try {
      const response = await api.get(`/public/seats/${flightId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching seats:', error);
      throw error;
    }
  },

  // Bilet satın alma (CreateBookingRequest)
  buyTicket: async (bookingData) => {
    try {
      
      const response = await api.post('/public/tickets/buy', bookingData);
      return response.data;
    } catch (error) {
      console.error('Error buying ticket:', error);
      throw error;
    }
  }
};

export default seatService;