import { createContext, useContext, useState, useCallback } from 'react';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [bookingState, setBookingState] = useState({
    step: 1,          // 1=Select Room, 2=Your Details, 3=Review, 4=Payment
    checkIn: '',
    checkOut: '',
    nights: 1,
    guests: 1,
    selectedRoom: null,
    guestDetails: {
      title: 'Mr',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialRequests: '',
    },
    booking: null,    // Created booking object from API
  });

  const updateBooking = useCallback((patch) => {
    setBookingState(prev => ({ ...prev, ...patch }));
  }, []);

  const resetBooking = useCallback(() => {
    setBookingState({
      step: 1, checkIn: '', checkOut: '', nights: 1, guests: 1,
      selectedRoom: null, guestDetails: { title: 'Mr', firstName: '', lastName: '', email: '', phone: '', specialRequests: '' },
      booking: null,
    });
  }, []);

  return (
    <BookingContext.Provider value={{ bookingState, updateBooking, resetBooking }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used inside BookingProvider');
  return ctx;
};
