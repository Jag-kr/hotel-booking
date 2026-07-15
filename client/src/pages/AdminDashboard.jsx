import { useState, useEffect } from 'react';
import { adminAPI } from '../api';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getBookings()
        ]);
        setStats(statsRes.data);
        setBookings(bookingsRes.data.bookings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="spinner-overlay"><div className="spinner"></div></div>;

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div className="admin-sidebar-logo">Trinity Admin</div>
        <div className="admin-nav">
          <a href="#" className="admin-nav-item active">Dashboard</a>
          <a href="#" className="admin-nav-item">Bookings</a>
          <a href="#" className="admin-nav-item">Rooms</a>
          <a href="#" className="admin-nav-item">Customers</a>
        </div>
      </div>
      <div className="admin-main">
        <h2>Dashboard Overview</h2>
        
        <div className="stat-grid mt-2">
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>🏨</div>
            <div className="stat-card-info">
              <div className="value">{stats?.totalRooms}</div>
              <div className="label">Total Rooms</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>✅</div>
            <div className="stat-card-info">
              <div className="value">{stats?.availableRooms}</div>
              <div className="label">Available</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>📅</div>
            <div className="stat-card-info">
              <div className="value">{stats?.totalBookings}</div>
              <div className="label">Total Bookings</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>💰</div>
            <div className="stat-card-info">
              <div className="value">₹{stats?.revenue}</div>
              <div className="label">Revenue</div>
            </div>
          </div>
        </div>

        <h3 className="mt-3 mb-2">Recent Bookings</h3>
        <div className="card table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Check In/Out</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td>#{b.id}</td>
                  <td>
                    <div className="font-semibold">{b.guestName}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{b.guestEmail}</div>
                  </td>
                  <td>{b.room?.hotel?.name} - {b.room?.roomType}</td>
                  <td>
                    <div>{new Date(b.checkIn).toLocaleDateString()}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>to {new Date(b.checkOut).toLocaleDateString()}</div>
                  </td>
                  <td>
                    <span className={`badge badge-${b.bookingStatus.toLowerCase()}`}>{b.bookingStatus}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${b.paymentStatus.toLowerCase()}`}>{b.paymentStatus}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
