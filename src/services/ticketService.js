import api from './api';

const ticketService = {
  // PNR ve TC No ile bilet sorgulama
  searchByPnr: async (pnr, identityNumber) => {
    // Backend @PostMapping bekliyor varsayımıyla:
    const response = await api.post('public/tickets/searchFlightInfo', {
      pnr: pnr,
      identityNumber: identityNumber
    });
    return response.data;
  },

  cancelTicket: async (pnr, identityNumber) => {
    const response = await api.post('/public/tickets/cancel', {
      pnr: pnr,
      identityNumber: identityNumber
    });
    return response.data;
  }
};

export default ticketService;