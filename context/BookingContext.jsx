"use client";
import { createContext, useContext, useState } from "react";

const BookingContext = createContext();

export function BookingProvider({ children }) {
  const [bookingDates, setBookingDates] = useState({
    checkInDate: null,
    checkOutDate: null,
  });

  return (
    <BookingContext.Provider value={{ bookingDates, setBookingDates }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  return useContext(BookingContext);
}
