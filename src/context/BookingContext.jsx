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
    flightId: null,
    passengerCount: 1,
    contactEmail: '',
    passengers: []
  });

  const updateBookingData = (data) => {
    setBookingData(prev => ({ ...prev, ...data }));
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
      flightId: null,
      passengerCount: 1,
      contactEmail: '',
      passengers: []
    });
  };

  return (
    <BookingContext.Provider
      value={{
        bookingData,
        updateBookingData,
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