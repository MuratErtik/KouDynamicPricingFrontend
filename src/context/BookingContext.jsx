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
    // Uçuş Arama Bilgileri
    tripType: 'one-way', // 'one-way' veya 'round-trip'
    departureAirportIataCode: null,
    arrivalAirportIataCode: null,
    departureDate: null,
    returnDate: null, // Gidiş-dönüş için
    passengerCount: 1,
    
    // Seçilen Uçuşlar
    selectedDepartureFlight: null, // Gidiş uçuşu
    selectedReturnFlight: null,    // Dönüş uçuşu (varsa)
    
    // Yolcu ve Koltuk Bilgileri
    flightId: null, // Tek yön için
    contactEmail: '',
    passengers: []
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

  const selectDepartureFlight = (flight) => {
    setBookingData(prev => ({
      ...prev,
      selectedDepartureFlight: flight,
      flightId: flight.id // Backward compatibility
    }));
  };

  const selectReturnFlight = (flight) => {
    setBookingData(prev => ({
      ...prev,
      selectedReturnFlight: flight
    }));
  };

  const addPassenger = (passenger) => {
    setBookingData(prev => ({
      ...prev,
      passengers: [...prev.passengers, passenger]
    }));
  };

  const updatePassenger = (index, passenger) => {
    setBookingData(prev => ({
      ...prev,
      passengers: prev.passengers.map((p, i) => i === index ? passenger : p)
    }));
  };

  const setContactEmail = (email) => {
    setBookingData(prev => ({ ...prev, contactEmail: email }));
  };

  const resetBooking = () => {
    setBookingData({
      tripType: 'one-way',
      departureAirportIataCode: null,
      arrivalAirportIataCode: null,
      departureDate: null,
      returnDate: null,
      passengerCount: 1,
      selectedDepartureFlight: null,
      selectedReturnFlight: null,
      flightId: null,
      contactEmail: '',
      passengers: []
    });
  };

  return (
    <BookingContext.Provider
      value={{
        bookingData,
        updateBookingData,
        setSearchCriteria,
        selectDepartureFlight,
        selectReturnFlight,
        addPassenger,
        updatePassenger,
        setContactEmail,
        resetBooking
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};