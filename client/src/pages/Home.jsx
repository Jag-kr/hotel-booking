import { useState, useEffect } from 'react';
import { hotelAPI, bookingAPI, paymentAPI } from '../api';
import { useBooking } from '../context/BookingContext';

const ROOM_IMAGES = {
  'Deluxe Room': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
  'Suite': 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80',
  'Premium Suite': 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80',
  'default': 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&q=80',
};

const ADD_ONS = [
  { id: 'airport_pickup', label: 'Airport Pick Up Charges', desc: 'Airport Pick Up Charges (one way)', price: 1100, perUnit: null },
  { id: 'dinner', label: 'Dinner Charges', desc: 'Dinner Charges (Veg or Non Veg)', price: 300, perUnit: 'Per Adult' },
  { id: 'lunch', label: 'Lunch Charges', desc: 'Lunch Charges (Veg or Non Veg)', price: 300, perUnit: 'Per Adult' },
  { id: 'railway_pickup', label: 'Railway Station Pick Up Charges', desc: 'Railway Station Pick Up Charges (one way)', price: 600, perUnit: null },
];

function getNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 1;
  const diff = new Date(checkOut) - new Date(checkIn);
  const n = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  return n;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Razorpay Modal ───────────────────────────────────────
function RazorpayModal({ amount, onSuccess, onClose }) {
  const [modalStep, setModalStep] = useState(1); // 1=contact, 2=payment options, 3=processing
  const [contact, setContact] = useState({ phone: '', email: '' });
  const [payTab, setPayTab] = useState('card');
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleContinue = (e) => {
    e.preventDefault();
    setModalStep(2);
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setProcessing(true);
    // Simulate payment delay
    await new Promise(r => setTimeout(r, 2000));
    onSuccess({ ...cardData, ...contact });
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rzp-modal">
        {/* Left panel */}
        <div className="rzp-left">
          <div className="rzp-brand">
            <span className="rzp-logo">⚡</span>
            <span>Razorpay.com</span>
          </div>
          <div className="rzp-price-summary">
            <div className="rzp-price-label">Price Summary</div>
            <div className="rzp-price-amount">₹{amount?.toLocaleString('en-IN')}</div>
          </div>
          <div className="rzp-using">
            <span>🔒</span>
            <span>Secured by <strong>#Razorpay</strong></span>
          </div>
        </div>

        {/* Right panel */}
        <div className="rzp-right">
          <div className="rzp-right-header">
            <span className="font-semibold">Payment Options</span>
            <button className="rzp-close-btn" onClick={onClose}>✕</button>
          </div>

          {modalStep === 1 && (
            <div className="rzp-contact-form">
              <h3>Contact details</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Enter mobile &amp; email to continue
              </p>
              <form onSubmit={handleContinue}>
                <div className="rzp-input-group">
                  <span className="rzp-country-code">🇮🇳 +91</span>
                  <input
                    type="tel" required placeholder="Mobile number"
                    className="form-control" style={{ borderRadius: '0 6px 6px 0', borderLeft: 'none' }}
                    value={contact.phone}
                    onChange={e => setContact({ ...contact, phone: e.target.value })}
                  />
                </div>
                <input
                  type="email" required placeholder="example@example.com"
                  className="form-control mt-1"
                  value={contact.email}
                  onChange={e => setContact({ ...contact, email: e.target.value })}
                />
                <button type="submit" className="rzp-continue-btn mt-2">Continue</button>
              </form>
            </div>
          )}

          {modalStep === 2 && (
            <div className="rzp-payment-options">
              <div className="rzp-tabs">
                <button className={`rzp-tab ${payTab === 'upi' ? 'active' : ''}`} onClick={() => setPayTab('upi')}>UPI</button>
                <button className={`rzp-tab ${payTab === 'card' ? 'active' : ''}`} onClick={() => setPayTab('card')}>Cards</button>
                <button className={`rzp-tab ${payTab === 'netbanking' ? 'active' : ''}`} onClick={() => setPayTab('netbanking')}>Net Banking</button>
              </div>

              {payTab === 'card' && (
                <form onSubmit={handlePay} className="rzp-card-form">
                  <div className="rzp-card-preview">
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💳</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '1rem', letterSpacing: '0.2em' }}>
                      {cardData.number ? cardData.number.replace(/(.{4})/g, '$1 ').trim() : '**** **** **** ****'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.85 }}>
                      <span>{cardData.name || 'CARD HOLDER'}</span>
                      <span>{cardData.expiry || 'MM/YY'}</span>
                    </div>
                  </div>
                  <input type="text" required maxLength="16" placeholder="Card Number" className="form-control mt-1"
                    value={cardData.number} onChange={e => setCardData({ ...cardData, number: e.target.value })} />
                  <input type="text" required placeholder="Name on Card" className="form-control mt-1"
                    value={cardData.name} onChange={e => setCardData({ ...cardData, name: e.target.value })} />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <input type="text" required maxLength="5" placeholder="MM/YY" className="form-control"
                      value={cardData.expiry} onChange={e => setCardData({ ...cardData, expiry: e.target.value })} />
                    <input type="password" required maxLength="3" placeholder="CVV" className="form-control"
                      value={cardData.cvv} onChange={e => setCardData({ ...cardData, cvv: e.target.value })} />
                  </div>
                  <button type="submit" className="rzp-pay-btn mt-2" disabled={processing}>
                    {processing ? '⏳ Processing...' : `Pay ₹${amount?.toLocaleString('en-IN')}`}
                  </button>
                </form>
              )}

              {payTab === 'upi' && (
                <form onSubmit={handlePay} className="rzp-card-form">
                  <div className="rzp-upi-icon" style={{ textAlign: 'center', padding: '1.5rem', fontSize: '3rem' }}>📲</div>
                  <input type="text" required placeholder="Enter UPI ID (e.g. user@upi)" className="form-control mt-1"
                    value={upiId} onChange={e => setUpiId(e.target.value)} />
                  <button type="submit" className="rzp-pay-btn mt-2" disabled={processing}>
                    {processing ? '⏳ Verifying...' : `Verify & Pay ₹${amount?.toLocaleString('en-IN')}`}
                  </button>
                </form>
              )}

              {payTab === 'netbanking' && (
                <form onSubmit={handlePay} className="rzp-card-form">
                  <select className="form-control mt-1" required>
                    <option value="">Select Your Bank</option>
                    <option>State Bank of India</option>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Kotak Mahindra Bank</option>
                  </select>
                  <button type="submit" className="rzp-pay-btn mt-2" disabled={processing}>
                    {processing ? '⏳ Redirecting...' : `Pay ₹${amount?.toLocaleString('en-IN')}`}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Success / Confirmation Page ─────────────────────────
function ConfirmationPage({ booking, onNewBooking }) {
  return (
    <div className="confirmation-page">
      <div className="confirmation-card">
        <div className="confirmation-icon">✓</div>
        <h2 style={{ color: '#1a7a4a', marginBottom: '0.5rem' }}>Booking Confirmed!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Your reservation at Trinity Suites Bangalore is confirmed. A confirmation has been recorded.
        </p>

        <div className="booking-id-display">
          <div className="label">Booking Reference ID</div>
          <div className="id">#{String(booking?.id).padStart(6, '0')}</div>
        </div>

        <div className="confirmation-details">
          <div className="conf-row">
            <span>Room</span>
            <strong>{booking?.room?.roomType || 'Selected Room'}</strong>
          </div>
          <div className="conf-row">
            <span>Guest</span>
            <strong>{booking?.guestName}</strong>
          </div>
          <div className="conf-row">
            <span>Check-in</span>
            <strong>{formatDate(booking?.checkIn)}</strong>
          </div>
          <div className="conf-row">
            <span>Check-out</span>
            <strong>{formatDate(booking?.checkOut)}</strong>
          </div>
          <div className="conf-row">
            <span>Guests</span>
            <strong>{booking?.guests} Adult(s)</strong>
          </div>
          <div className="conf-row conf-total">
            <span>Total Paid</span>
            <strong style={{ color: 'var(--brand)', fontSize: '1.2rem' }}>
              ₹{parseFloat(booking?.totalAmount || 0).toLocaleString('en-IN')}
            </strong>
          </div>
          <div className="conf-row">
            <span>Payment Status</span>
            <span className="badge badge-confirmed">Paid ✓</span>
          </div>
        </div>

        <div className="confirmation-actions">
          <button className="btn btn-primary btn-lg" onClick={onNewBooking}>Make Another Booking</button>
        </div>

        <div className="confirmation-policy">
          <p>📋 <strong>Check-in:</strong> 12:00 PM &nbsp;|&nbsp; <strong>Check-out:</strong> 12:00 PM</p>
          <p>For any changes, contact us at <strong>+91 80 1234 5678</strong></p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Home Component ──────────────────────────────────────
function Home() {
  const { bookingState, updateBooking, resetBooking } = useBooking();

  const {
    step, checkIn, checkOut, guests,
    selectedRoom, guestDetails, booking
  } = bookingState;

  const nights = getNights(checkIn, checkOut);

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [guestFormData, setGuestFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    city: '', country: 'India', specialRequests: ''
  });

  // Set default dates
  useEffect(() => {
    if (!checkIn) {
      const today = new Date();
      const tmrw = new Date(today);
      tmrw.setDate(tmrw.getDate() + 1);
      updateBooking({
        checkIn: today.toISOString().split('T')[0],
        checkOut: tmrw.toISOString().split('T')[0],
      });
    }
  }, []);



  const searchRooms = async () => {
    if (!checkIn || !checkOut) return;
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
    if (checkIn && checkOut) searchRooms();
  }, [checkIn, checkOut, guests]);

  // Calculate grand total
  const roomBasePrice = selectedRoom ? (
    selectedRoom.discountPercent > 0
      ? selectedRoom.price * (1 - selectedRoom.discountPercent / 100)
      : selectedRoom.price
  ) : 0;
  const roomTotal = roomBasePrice * nights;
  const roomOriginalTotal = selectedRoom ? selectedRoom.price * nights : 0;
  const discount = roomOriginalTotal - roomTotal;
  const addOnTotal = Object.entries(selectedAddOns)
    .filter(([, v]) => v)
    .reduce((sum, [id]) => {
      const ao = ADD_ONS.find(a => a.id === id);
      return sum + (ao ? ao.price : 0);
    }, 0);
  const taxRate = 0.05;
  const taxes = Math.round((roomTotal + addOnTotal) * taxRate);
  const grandTotal = Math.round(roomTotal + addOnTotal + taxes);

  const handleRoomBook = (room) => {
    updateBooking({ selectedRoom: room, step: 2 });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMakePayment = async () => {
    if (!termsAccepted) {
      alert('Please accept the Reservation & Cancellation Policy.');
      return;
    }
    if (!guestFormData.firstName || !guestFormData.email || !guestFormData.phone) {
      alert('Please fill in all required guest details.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        roomId: selectedRoom.id,
        checkIn,
        checkOut,
        guests,
        guestName: `${guestFormData.firstName} ${guestFormData.lastName}`.trim(),
        guestEmail: guestFormData.email,
        guestPhone: guestFormData.phone,
        specialRequests: guestFormData.specialRequests,
      };
      const res = await bookingAPI.create(payload);
      updateBooking({ booking: res.data });
      setShowRazorpay(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      await paymentAPI.process({
        bookingId: booking.id,
        paymentMethod: 'card',
        cardNumber: '4111111111111111',
      });
      setShowRazorpay(false);
      updateBooking({ step: 3 });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert(err.response?.data?.message || 'Payment recording failed');
    }
  };

  const handleNewBooking = () => {
    resetBooking();
    setSelectedAddOns({});
    setTermsAccepted(false);
    setGuestFormData({ firstName: '', lastName: '', email: '', phone: '', city: '', country: 'India', specialRequests: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── CONFIRMATION PAGE ──
  if (step === 3 && booking) {
    return <ConfirmationPage booking={booking} onNewBooking={handleNewBooking} />;
  }

  return (
    <main>
      {/* Blue Search Banner */}
      <div className="booking-banner">
        <div className="container">
          <div className="search-bar">
            <div className="search-field">
              <label>Check In</label>
              <input type="date" value={checkIn}
                onChange={e => updateBooking({ checkIn: e.target.value })} />
            </div>
            <div className="search-field">
              <label>Check Out</label>
              <input type="date" value={checkOut}
                onChange={e => updateBooking({ checkOut: e.target.value })} />
            </div>
            <div className="search-field" style={{ minWidth: '80px' }}>
              <label>Nights</label>
              <input type="text" disabled value={`${nights} Night${nights !== 1 ? 's' : ''}`} />
            </div>
            <div className="search-field" style={{ minWidth: '80px' }}>
              <label>Guests</label>
              <select value={guests} onChange={e => updateBooking({ guests: parseInt(e.target.value) })}>
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={() => { updateBooking({ step: 1, selectedRoom: null }); searchRooms(); }}
              style={{ alignSelf: 'flex-end', height: '42px' }}>
              Search Rooms
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="booking-layout">

        {/* LEFT: Main Content */}
        <div className="booking-main">

          {/* ── STEP 1: Room Listing ── */}
          {step === 1 && (
            <div>
              {loading ? (
                <div className="spinner-overlay"><div className="spinner" /></div>
              ) : rooms.length > 0 ? (
                rooms.map(room => {
                  const discountedPrice = room.discountPercent > 0
                    ? Math.round(room.price * (1 - room.discountPercent / 100))
                    : room.price;
                  const img = ROOM_IMAGES[room.roomType] || ROOM_IMAGES.default;

                  return (
                    <div key={room.id} className="room-card">
                      <div className="room-card-inner">
                        {/* Image */}
                        <div className="room-image-col">
                          <img src={img} alt={room.roomType} />
                          <div className="room-image-overlay">
                            <span>See More</span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="room-details-col">
                          <div className="room-title-row">
                            <div className="room-name">{room.roomType}</div>
                            <div className="room-price-block">
                              {room.discountPercent > 0 && (
                                <div className="room-price-original">INR {room.price.toLocaleString('en-IN')}</div>
                              )}
                              <div className="room-price">INR {discountedPrice.toLocaleString('en-IN')}</div>
                              <div className="room-price-label">Per Night</div>
                            </div>
                          </div>

                          {room.discountPercent > 0 && (
                            <div className="room-deal-badge">
                              <span className="deal-tag">DEAL</span>
                              {room.discountPercent}% Off on stays
                            </div>
                          )}

                          <div className="room-desc">{room.description}</div>

                          <div className="room-amenities" style={{ marginTop: '0.5rem' }}>
                            {['wifi', 'tv', 'ac'].map(icon => (
                              <span key={icon} className="amenity-ico" title={icon}>
                                {icon === 'wifi' ? '📶' : icon === 'tv' ? '📺' : '❄️'}
                              </span>
                            ))}
                          </div>

                          {room.roomsLeft && room.roomsLeft <= 3 && (
                            <div className="rooms-left-warning">Only {room.roomsLeft} room{room.roomsLeft !== 1 ? 's' : ''} left!</div>
                          )}
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="room-action-bar">
                        <div className="room-select-controls">
                          <label className="select-label">Select Room</label>
                          <select className="room-qty-select" defaultValue="1">
                            {[0,1,2,3].map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                          <span className="select-plus">+</span>
                          <label className="select-label">Meal Plan</label>
                          <select className="room-qty-select" defaultValue="room_only">
                            <option value="room_only">Room Only</option>
                            <option value="breakfast">With Breakfast</option>
                            <option value="all_meals">All Meals</option>
                          </select>
                        </div>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleRoomBook(room)}
                          disabled={room.status === 'Maintenance'}
                        >
                          {room.status === 'Maintenance' ? 'Unavailable' : 'BOOK NOW'}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏨</p>
                  <p className="font-semibold">No rooms available for the selected dates.</p>
                  <p className="text-muted">Try different dates or fewer guests.</p>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: Booking Details (Add-ons + Guest Info + Payment) ── */}
          {step === 2 && (
            <div>
              <div className="step2-back">
                <button className="btn btn-secondary btn-sm" onClick={() => updateBooking({ step: 1, selectedRoom: null })}>
                  ← Back to Rooms
                </button>
                <span className="step2-room-title">Booking: {selectedRoom?.roomType}</span>
              </div>

              {/* Add to your Stay */}
              <div className="section-card">
                <div className="section-header">Add to your stay</div>
                <div className="section-body">
                  {ADD_ONS.map(addon => (
                    <div key={addon.id} className="addon-row">
                      <input
                        type="checkbox"
                        id={addon.id}
                        checked={!!selectedAddOns[addon.id]}
                        onChange={e => setSelectedAddOns(prev => ({ ...prev, [addon.id]: e.target.checked }))}
                        className="addon-checkbox"
                      />
                      <label htmlFor={addon.id} className="addon-label">
                        <span className="addon-name">{addon.label}</span>
                        <span className="addon-desc">{addon.desc}</span>
                      </label>
                      <div className="addon-pricing">
                        <span className="addon-rate">INR {addon.price}{addon.perUnit ? ` ${addon.perUnit}` : ''}</span>
                        <span className="addon-total">INR {selectedAddOns[addon.id] ? addon.price : 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guest Information */}
              <div className="section-card">
                <div className="section-header">Guest Information</div>
                <div className="section-body">
                  <div className="form-row">
                    <div className="form-group">
                      <input type="text" placeholder="First Name" required className="form-control"
                        value={guestFormData.firstName}
                        onChange={e => setGuestFormData({ ...guestFormData, firstName: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <input type="text" placeholder="Last Name" className="form-control"
                        value={guestFormData.lastName}
                        onChange={e => setGuestFormData({ ...guestFormData, lastName: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <input type="email" placeholder="Email Address" required className="form-control"
                      value={guestFormData.email}
                      onChange={e => setGuestFormData({ ...guestFormData, email: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <div className="form-group" style={{ flex: '0 0 auto' }}>
                      <select className="form-control" style={{ width: 'auto' }}>
                        <option>IN +91</option><option>US +1</option><option>GB +44</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <input type="tel" placeholder="Phone" required className="form-control"
                        value={guestFormData.phone}
                        onChange={e => setGuestFormData({ ...guestFormData, phone: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <input type="text" placeholder="City" className="form-control"
                        value={guestFormData.city}
                        onChange={e => setGuestFormData({ ...guestFormData, city: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <select className="form-control"
                        value={guestFormData.country}
                        onChange={e => setGuestFormData({ ...guestFormData, country: e.target.value })}>
                        <option>India</option><option>United States</option><option>United Kingdom</option>
                        <option>Australia</option><option>Canada</option><option>UAE</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <textarea placeholder="Message / Special Requests to Property" className="form-control"
                      rows="3"
                      value={guestFormData.specialRequests}
                      onChange={e => setGuestFormData({ ...guestFormData, specialRequests: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Make Payment */}
              <div className="section-card">
                <div className="section-header">Make Payment</div>
                <div className="section-body">
                  <div className="payment-gateway-row">
                    <label className="payment-gateway-option">
                      <input type="radio" name="gateway" defaultChecked />
                      <span>RazorPay OAuth Payment Gateway</span>
                    </label>
                    <div className="payment-logos">
                      <span className="payment-logo-badge" style={{ background: '#072654', color: 'white' }}>Razorpay</span>
                      <span className="payment-logo-badge" style={{ background: '#1a5cff', color: 'white' }}>VISA</span>
                      <span className="payment-logo-badge" style={{ background: '#eb001b', color: 'white' }}>MC</span>
                      <span className="payment-logo-badge" style={{ background: '#ff6600', color: 'white' }}>RuPay</span>
                      <span className="payment-logo-badge" style={{ background: '#6b3fa0', color: 'white' }}>UPI</span>
                    </div>
                  </div>
                  <label className="terms-checkbox">
                    <input type="checkbox" checked={termsAccepted}
                      onChange={e => setTermsAccepted(e.target.checked)} />
                    <span>I have read and accept the <strong>Reservation &amp; Cancellation Policy</strong>.</span>
                  </label>
                  <button
                    className="make-payment-btn"
                    onClick={handleMakePayment}
                    disabled={submitting || !termsAccepted}
                  >
                    {submitting ? '⏳ Please wait...' : 'MAKE PAYMENT'}
                  </button>
                </div>
              </div>

              {/* Reservation Policy */}
              <div className="section-card">
                <div className="section-header">Reservation Policy and Terms &amp; Conditions</div>
                <div className="section-body policy-text">
                  <p>Early check-in or late check-out is subject to availability and may be chargeable by the hotel directly.</p>
                  <p><strong>Check-in time is 12:00 PM. Check-out time is 12:00 PM.</strong></p>
                  <p><strong>STANDARD CANCELLATION AND AMENDMENT POLICY</strong></p>
                  <ul>
                    <li>Cancellation made within 24 hrs of the check-in date and in case of no show, full cost of stay shall be charged.</li>
                    <li>Cancellation made between 48–24 hrs of the check-in date, one night retention would be charged.</li>
                    <li>All amendments would be done as per hotels policy. We accept amendments, only 48 hours prior to check-in.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT: Sticky Sidebar */}
        <div className="booking-sidebar">
          {/* Promo Code */}
          <div className="sidebar-section sidebar-promo">
            <div className="sidebar-section-title">Promo Code</div>
            <div className="promo-input-row">
              <input type="text" placeholder="Promo Code" className="form-control" />
              <button className="btn btn-primary btn-sm">APPLY →</button>
            </div>
          </div>

          {/* Reservation Summary */}
          <div className="sidebar-section sidebar-summary">
            <div className="sidebar-section-title">Reservation Summary</div>

            <div className="summary-dates-row">
              <div className="summary-date-box">
                <div className="sdb-label">Check In</div>
                <div className="sdb-date">{formatDate(checkIn)}</div>
              </div>
              <div className="nights-pill">{nights} night{nights !== 1 ? 's' : ''}</div>
              <div className="summary-date-box text-right">
                <div className="sdb-label">Check Out</div>
                <div className="sdb-date">{formatDate(checkOut)}</div>
              </div>
            </div>

            {selectedRoom && (
              <>
                <div className="summary-room-name">{selectedRoom.roomType}</div>
                <div className="summary-meal-plan">Meal Plan: Room Only</div>
                <div className="summary-guests-row">
                  <div><span>Adults</span><span>{guests}</span></div>
                  <div><span>Child (&lt;6 yrs)</span><span>0</span></div>
                  <div><span>Child (6–12 yrs)</span><span>0</span></div>
                </div>
                <hr className="summary-divider" />
                <div className="summary-line"><span>Total Charges</span><span>INR {roomOriginalTotal.toLocaleString('en-IN')}.00</span></div>
                {discount > 0 && <div className="summary-line discount"><span>Total Discount</span><span>– INR {discount.toLocaleString('en-IN')}.00</span></div>}
                {addOnTotal > 0 && <div className="summary-line"><span>Add-ons</span><span>INR {addOnTotal.toLocaleString('en-IN')}.00</span></div>}
                <div className="summary-line"><span>Total Taxes (5%)</span><span>INR {taxes.toLocaleString('en-IN')}.00</span></div>
                <div className="summary-grand-total">
                  <span>Grand Total</span>
                  <span>INR {grandTotal.toLocaleString('en-IN')}.00</span>
                </div>
              </>
            )}

            {!selectedRoom && (
              <p className="text-muted" style={{ fontSize: '0.8rem', padding: '0.5rem 0' }}>Select a room to see the reservation summary.</p>
            )}
          </div>

          {/* Trust Signals */}
          <div className="trust-section">
            <div className="trust-tag trust-green">
              <div className="trust-icon">⚡</div>
              <div>Instant Reservation Confirmation <small>Secure your stay with immediate booking confirmation</small></div>
            </div>
            <div className="trust-tag trust-blue">
              <div className="trust-icon">🛡️</div>
              <div>Book Direct &amp; Save More <small>You are booking from Property's Official Booking Engine</small></div>
            </div>
            <div className="trust-tag trust-orange">
              <div className="trust-icon">🏷️</div>
              <div>Lowest Rates <small>Enjoy Special Rates and Hassle-Free Fast Refunds</small></div>
            </div>
          </div>
        </div>

      </div>

      {/* Razorpay Modal */}
      {showRazorpay && (
        <RazorpayModal
          amount={grandTotal}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowRazorpay(false)}
        />
      )}
    </main>
  );
}

export default Home;
