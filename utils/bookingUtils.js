import { isWithinInterval, parseISO } from "date-fns";

// Check if today is within any existing booking
export function isCurrentlyBooked(bookings) {
  const today = new Date();

  return bookings.some(({ checkIn, checkOut }) =>
    isWithinInterval(today, {
      start: new Date(checkIn),
      end: new Date(checkOut),
    })
  );
}

// Get the soonest future availability after today
export function getNextAvailability(bookings) {
  const today = new Date();

  const futureCheckOuts = bookings
    .map(({ checkOut }) => new Date(checkOut))
    .filter((date) => date > today)
    .sort((a, b) => a - b);

  return futureCheckOuts[0] || null;
}
