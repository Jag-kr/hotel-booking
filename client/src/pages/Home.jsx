import { useState, useEffect } from 'react';
import { hotelAPI, bookingAPI, paymentAPI } from '../api';
import { useBooking } from '../context/BookingContext';

function Home() {
  const { bookingState, updateBooking, resetBooking } = useBooking();
  const { step, checkIn, checkOut, nights, guests, selectedRoom, guestDetails, booking } = bookingState;

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '', cardName: '', expiryMonth: '', expiryYear: '', cvv: ''
  });

  // Default dates
  useEffect(() => {
    if (!checkIn) {
      const today = new Date();
      const tmrw = new Date(today);
      tmrw.setDate(tmrw.getDate() + 1);
      
      updateBooking({
        checkIn: today.toISOString().split('T')[0],
        checkOut: tmrw.toISOString().split('T')[0]
      });
    }
  }, [checkIn, updateBooking]);

  const searchRooms = async () => {
    setLoading(true);
    try {
      const res = await hotelAPI.getRooms({ checkIn, checkOut, guests });
      setRooms(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (checkIn && checkOut) {
      searchRooms();
    }
  }, [checkIn, checkOut, guests]);

  const handleRoomSelect = (room) => {
    updateBooking({ selectedRoom: room, step: 2 });
  };

  const handleGuestSubmit = (e) => {
    e.preventDefault();
    updateBooking({ step: 3 });
  };

  const handleCreateBooking = async () => {
    try {
      const payload = {
        roomId: selectedRoom.id,
        checkIn,
        checkOut,
        guests,
        guestName: `${guestDetails.title} ${guestDetails.firstName} ${guestDetails.lastName}`,
        guestEmail: guestDetails.email,
        guestPhone: guestDetails.phone,
        specialRequests: guestDetails.specialRequests
      };
      const res = await bookingAPI.create(payload);
      updateBooking({ booking: res.data, step: 4 });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create booking');
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        bookingId: booking.id,
        paymentMethod: 'card',
        ...paymentData
      };
      await paymentAPI.process(payload);
      alert('Payment Successful!');
      resetBooking();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed');
    }
  };

  return (
    <main>
      {/* Search Banner */}
      <div className="booking-banner">
        <div className="container">
          <div className="search-bar">
            <div className="search-field">
              <label>Check In</label>
              <input type="date" value={checkIn} onChange={e => updateBooking({ checkIn: e.target.value })} />
            </div>
            <div className="search-field">
              <label>Check Out</label>
              <input type="date" value={checkOut} onChange={e => updateBooking({ checkOut: e.target.value })} />
            </div>
            <div className="search-field" style={{ minWidth: '80px' }}>
              <label>Guests</label>
              <select value={guests} onChange={e => updateBooking({ guests: parseInt(e.target.value) })}>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={searchRooms} style={{ height: '42px' }}>Search Rooms</button>
          </div>
        </div>
      </div>

      <div className="container mt-3 pb-5">
        <div className="row gap-2">
          
          {/* Main Content Area */}
          <div className="col-md-8" style={{ flex: 1 }}>
            
            {/* Wizard Steps */}
            <div className="wizard-steps">
              <div className={`wizard-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>
                <div className="wizard-step-num">1</div>
                Select Room
              </div>
              <div className={`wizard-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}>
                <div className="wizard-step-num">2</div>
                Your Details
              </div>
              <div className={`wizard-step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'done' : ''}`}>
                <div className="wizard-step-num">3</div>
                Review
              </div>
              <div className={`wizard-step ${step >= 4 ? 'active' : ''}`}>
                <div className="wizard-step-num">4</div>
                Payment
              </div>
            </div>

            {/* STEP 1: Select Room */}
            {step === 1 && (
              <div className="room-list">
                {loading ? (
                  <div className="spinner-overlay"><div className="spinner"></div></div>
                ) : rooms.length > 0 ? (
                  rooms.map(room => (
                    <div key={room.id} className="room-card">
                      <div className="room-card-inner">
                        <div className="room-image-col">
                          <img src={`https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&q=80`} alt={room.roomType} />
                        </div>
                        <div className="room-details-col">
                          <div className="room-title-row">
                            <div className="room-name">{room.roomType}</div>
                            <div className="room-price-block">
                              <div className="room-price-label">Per Night</div>
                              <div className="room-price">₹{room.price}</div>
                            </div>
                          </div>
                          <div className="room-desc">{room.description}</div>
                          <div className="room-amenities">
                            <span className="room-badge">Free WiFi</span>
                            <span className="room-badge">AC</span>
                          </div>
                          <div className="mt-2 text-right">
                            <button className="btn btn-primary" onClick={() => handleRoomSelect(room)}>Select Room</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="card p-2 text-center text-muted">No rooms available for these dates.</div>
                )}
              </div>
            )}

            {/* STEP 2: Guest Details */}
            {step === 2 && (
              <div className="card">
                <div className="card-header">Guest Details</div>
                <div className="card-body">
                  <form onSubmit={handleGuestSubmit}>
                    <div className="form-row">
                      <div className="form-group" style={{ flex: '0 0 100px' }}>
                        <label>Title</label>
                        <select className="form-control" value={guestDetails.title} onChange={e => updateBooking({ guestDetails: { ...guestDetails, title: e.target.value }})}>
                          <option>Mr</option><option>Mrs</option><option>Ms</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>First Name</label>
                        <input type="text" required className="form-control" value={guestDetails.firstName} onChange={e => updateBooking({ guestDetails: { ...guestDetails, firstName: e.target.value }})} />
                      </div>
                      <div className="form-group">
                        <label>Last Name</label>
                        <input type="text" required className="form-control" value={guestDetails.lastName} onChange={e => updateBooking({ guestDetails: { ...guestDetails, lastName: e.target.value }})} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Email</label>
                        <input type="email" required className="form-control" value={guestDetails.email} onChange={e => updateBooking({ guestDetails: { ...guestDetails, email: e.target.value }})} />
                      </div>
                      <div className="form-group">
                        <label>Phone</label>
                        <input type="tel" required className="form-control" value={guestDetails.phone} onChange={e => updateBooking({ guestDetails: { ...guestDetails, phone: e.target.value }})} />
                      </div>
                    </div>
                    <div className="d-flex justify-between mt-2">
                      <button type="button" className="btn btn-secondary" onClick={() => updateBooking({ step: 1 })}>Back</button>
                      <button type="submit" className="btn btn-primary">Continue</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* STEP 3: Review */}
            {step === 3 && (
              <div className="card">
                <div className="card-header">Review Booking</div>
                <div className="card-body">
                  <p><strong>Guest:</strong> {guestDetails.title} {guestDetails.firstName} {guestDetails.lastName}</p>
                  <p><strong>Contact:</strong> {guestDetails.email} | {guestDetails.phone}</p>
                  <hr style={{ margin: '1rem 0', borderColor: 'var(--border-color)' }} />
                  <div className="d-flex justify-between mt-2">
                    <button type="button" className="btn btn-secondary" onClick={() => updateBooking({ step: 2 })}>Back</button>
                    <button type="button" className="btn btn-primary" onClick={handleCreateBooking}>Confirm & Pay</button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Payment */}
            {step === 4 && (
              <div className="card">
                <div className="card-header">Secure Payment</div>
                <div className="card-body">
                  <div className="card-visual">
                    <div className="card-chip">💳</div>
                    <div className="card-number-display">**** **** **** {paymentData.cardNumber.slice(-4) || '****'}</div>
                    <div className="card-info-row">
                      <span>{paymentData.cardName.toUpperCase() || 'CARD HOLDER'}</span>
                      <span>{paymentData.expiryMonth || 'MM'}/{paymentData.expiryYear || 'YY'}</span>
                    </div>
                  </div>

                  <form onSubmit={handlePayment}>
                    <div className="form-group">
                      <label>Card Number</label>
                      <input type="text" maxLength="16" required className="form-control" value={paymentData.cardNumber} onChange={e => setPaymentData({...paymentData, cardNumber: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Name on Card</label>
                      <input type="text" required className="form-control" value={paymentData.cardName} onChange={e => setPaymentData({...paymentData, cardName: e.target.value})} />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Expiry Month (MM)</label>
                        <input type="text" maxLength="2" required className="form-control" value={paymentData.expiryMonth} onChange={e => setPaymentData({...paymentData, expiryMonth: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Expiry Year (YY)</label>
                        <input type="text" maxLength="2" required className="form-control" value={paymentData.expiryYear} onChange={e => setPaymentData({...paymentData, expiryYear: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>CVV</label>
                        <input type="password" maxLength="3" required className="form-control" value={paymentData.cvv} onChange={e => setPaymentData({...paymentData, cvv: e.target.value})} />
                      </div>
                    </div>
                    <button type="submit" className="pay-btn mt-2">
                      Pay ₹{booking?.totalAmount}
                    </button>
                  </form>
                </div>
              </div>
            )}
            
          </div>

          {/* Sidebar */}
          <div className="col-md-4" style={{ width: '320px' }}>
            <div className="reservation-summary">
              <h4>Your Reservation</h4>
              <div className="summary-row">
                <span>Check-in</span>
                <span className="font-semibold">{checkIn || '-'}</span>
              </div>
              <div className="summary-row">
                <span>Check-out</span>
                <span className="font-semibold">{checkOut || '-'}</span>
              </div>
              <div className="summary-row">
                <span>Guests</span>
                <span className="font-semibold">{guests} Adult(s)</span>
              </div>
              
              {selectedRoom && (
                <>
                  <hr style={{ margin: '1rem 0', borderColor: 'var(--border-color)' }} />
                  <div className="summary-row">
                    <span>Room Type</span>
                    <span className="font-semibold">{selectedRoom.roomType}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total Amount</span>
                    <span className="summary-price">₹{selectedRoom.price * (nights || 1)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="trust-section mt-3">
              <div className="trust-tag trust-green">
                <div className="trust-icon">✓</div>
                <div>Free Cancellation <small>Until 24h before check-in</small></div>
              </div>
              <div className="trust-tag trust-blue">
                <div className="trust-icon">🛡️</div>
                <div>Best Price Guarantee <small>You won't find it cheaper</small></div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}

export default Home;
