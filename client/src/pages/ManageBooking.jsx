import { useState } from 'react';
import { bookingAPI } from '../api';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ManageBooking() {
  const [ref, setRef] = useState('');
  const [email, setEmail] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLookup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setBooking(null);
    try {
      const res = await bookingAPI.lookup(ref, email);
      setBooking(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking not found. Please check your reference number and email.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingAPI.cancel(booking.id);
      setBooking({ ...booking, bookingStatus: 'Cancelled' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  return (
    <div className="manage-booking-page">
      <div className="manage-booking-container">
        <div className="manage-booking-card">
          <h2 className="manage-booking-title">My Bookings</h2>
          <p className="manage-booking-subtitle">
            Enter your Booking Reference Number and Email address to view your booking details.
          </p>

          <form onSubmit={handleLookup} className="manage-lookup-form">
            <div className="form-group">
              <label>Booking Ref. Number</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. 1001"
                  value={ref}
                  onChange={e => setRef(e.target.value)}
                />
                <span className="text-muted" style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                  (For Example: CODE-10164750513)
                </span>
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                required
                className="form-control"
                placeholder="Your booking email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            {error && <div className="form-error">{error}</div>}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? 'Searching...' : 'View Booking'}
            </button>
          </form>
        </div>

        {/* Booking Result */}
        {booking && (
          <div className="booking-result-card">
            <div className="booking-result-header">
              <div>
                <div className="booking-result-id">Booking #{String(booking.id).padStart(6, '0')}</div>
                <div className="booking-result-room">{booking.room?.roomType} — {booking.room?.hotel?.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`badge badge-${booking.bookingStatus.toLowerCase()}`}>
                  {booking.bookingStatus}
                </span>
                <div style={{ marginTop: '0.3rem' }}>
                  <span className={`badge badge-${booking.paymentStatus.toLowerCase()}`}>
                    {booking.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="booking-result-body">
              <div className="booking-result-dates">
                <div className="brd-box">
                  <div className="brd-label">Check In</div>
                  <div className="brd-date">{formatDate(booking.checkIn)}</div>
                </div>
                <div className="brd-nights">
                  {Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24))} Night(s)
                </div>
                <div className="brd-box" style={{ textAlign: 'right' }}>
                  <div className="brd-label">Check Out</div>
                  <div className="brd-date">{formatDate(booking.checkOut)}</div>
                </div>
              </div>

              <div className="booking-result-details">
                <div className="brd-row">
                  <span>Guest Name</span>
                  <strong>{booking.guestName}</strong>
                </div>
                <div className="brd-row">
                  <span>Email</span>
                  <strong>{booking.guestEmail}</strong>
                </div>
                <div className="brd-row">
                  <span>Phone</span>
                  <strong>{booking.guestPhone}</strong>
                </div>
                <div className="brd-row">
                  <span>Guests</span>
                  <strong>{booking.guests} Adult(s)</strong>
                </div>
                {booking.specialRequests && (
                  <div className="brd-row">
                    <span>Special Requests</span>
                    <strong>{booking.specialRequests}</strong>
                  </div>
                )}
                <div className="brd-row brd-total">
                  <span>Total Amount</span>
                  <strong style={{ color: 'var(--brand)', fontSize: '1.1rem' }}>
                    ₹{parseFloat(booking.totalAmount).toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>
            </div>

            {booking.bookingStatus !== 'Cancelled' && (
              <div className="booking-result-actions">
                <p className="text-muted" style={{ fontSize: '0.78rem', marginBottom: '0.75rem' }}>
                  To cancel this booking, click below. Cancellation charges may apply as per policy.
                </p>
                <button className="btn btn-danger btn-sm" onClick={handleCancel}>
                  Cancel Booking
                </button>
              </div>
            )}

            {booking.bookingStatus === 'Cancelled' && (
              <div className="booking-cancelled-notice">
                This booking has been cancelled.
              </div>
            )}
          </div>
        )}

        <div className="manage-booking-footer">
          <p>🔒 Your booking details are secure and private.</p>
          <p>For assistance, call us at <strong>+91 80 1234 5678</strong></p>
        </div>
      </div>
    </div>
  );
}

export default ManageBooking;
