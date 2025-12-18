import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [bookingData, setBookingData] = useState({
    // Arama Kriterleri
    tripType: 'one-way', // 'one-way' veya 'round-trip'
    departureAirportIataCode: null,
    arrivalAirportIataCode: null,
    departureDate: null,
    returnDate: null,
    passengerCount: 1,
    
    // Seçilen Uçuşlar
    outboundFlight: null,  // Gidiş uçuşu
    returnFlight: null,    // Dönüş uçuşu
    
    // Yolcu Bilgileri
    contactEmail: '',
    passengers: [], // Her yolcu: { firstName, lastName, identityNumber, birthDate, email, phone, outboundSeatNumber, returnSeatNumber }
    
    // Koltuk Seçim Durumu
    outboundSeatsSelected: false,
    returnSeatsSelected: false
  });

  const updateBookingData = (data) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  const setSearchCriteria = (criteria) => {
    setBookingData(prev => ({
      ...prev,
      tripType: criteria.tripType || prev.tripType,
      departureAirportIataCode: criteria.departureAirportIataCode,
      arrivalAirportIataCode: criteria.arrivalAirportIataCode,
      departureDate: criteria.departureDate,
      returnDate: criteria.returnDate,
      passengerCount: criteria.passengerCount
    }));
  };

  const selectOutboundFlight = (flight) => {
    setBookingData(prev => ({
      ...prev,
      outboundFlight: flight
    }));
  };

  const selectReturnFlight = (flight) => {
    setBookingData(prev => ({
      ...prev,
      returnFlight: flight
    }));
  };

  const updatePassengers = (passengers) => {
    setBookingData(prev => ({
      ...prev,
      passengers
    }));
  };

  const setContactEmail = (email) => {
    setBookingData(prev => ({ ...prev, contactEmail: email }));
  };

  const setOutboundSeatsSelected = (status) => {
    setBookingData(prev => ({ ...prev, outboundSeatsSelected: status }));
  };

  const setReturnSeatsSelected = (status) => {
    setBookingData(prev => ({ ...prev, returnSeatsSelected: status }));
  };

  const resetBooking = () => {
    setBookingData({
      tripType: 'one-way',
      departureAirportIataCode: null,
      arrivalAirportIataCode: null,
      departureDate: null,
      returnDate: null,
      passengerCount: 1,
      outboundFlight: null,
      returnFlight: null,
      contactEmail: '',
      passengers: [],
      outboundSeatsSelected: false,
      returnSeatsSelected: false
    });
  };

  // Uçuş seçimlerini sıfırlama (kullanıcı geri dönüp değiştirmek isterse)
  const resetFlightSelection = () => {
    setBookingData(prev => ({
      ...prev,
      outboundFlight: null,
      returnFlight: null,
      passengers: [],
      contactEmail: '',
      outboundSeatsSelected: false,
      returnSeatsSelected: false
    }));
  };

  const resetOutboundFlight = () => {
    setBookingData(prev => ({
      ...prev,
      outboundFlight: null,
      passengers: prev.passengers.map(p => ({ ...p, outboundSeatNumber: null })),
      outboundSeatsSelected: false
    }));
  };

  const resetReturnFlight = () => {
    setBookingData(prev => ({
      ...prev,
      returnFlight: null,
      passengers: prev.passengers.map(p => ({ ...p, returnSeatNumber: null })),
      returnSeatsSelected: false
    }));
  };

  return (
    <BookingContext.Provider
      value={{
        bookingData,
        updateBookingData,
        setSearchCriteria,
        selectOutboundFlight,
        selectReturnFlight,
        updatePassengers,
        setContactEmail,
        setOutboundSeatsSelected,
        setReturnSeatsSelected,
        resetBooking,
        resetFlightSelection,
        resetOutboundFlight,
        resetReturnFlight
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};