import { useState, useEffect } from 'react';
import { adminAPI } from '../api';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Room Modal state (for Add / Edit)
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    roomType: 'Deluxe Room',
    price: 3500,
    capacity: 2,
    status: 'Available',
    description: '',
    amenities: 'WiFi, AC, TV, Mini Fridge, En-suite Bathroom',
    images: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'
  });
  const [submittingRoom, setSubmittingRoom] = useState(false);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, bookingsRes, roomsRes, customersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getBookings({ limit: 50 }),
        adminAPI.getRooms(),
        adminAPI.getCustomers()
      ]);
      setStats(statsRes.data);
      setBookings(bookingsRes.data.bookings || []);
      setRooms(roomsRes.data || []);
      setCustomers(customersRes.data || []);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleUpdateBookingStatus = async (id, newStatus) => {
    try {
      await adminAPI.updateBookingStatus(id, newStatus);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, bookingStatus: newStatus } : b));
      // Refresh stats
      const statsRes = await adminAPI.getStats();
      setStats(statsRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booking status.');
    }
  };

  const handleOpenAddRoom = () => {
    setEditingRoom(null);
    setRoomForm({
      roomNumber: `${Math.floor(100 + Math.random() * 900)}`,
      roomType: 'Deluxe Room',
      price: 3500,
      capacity: 2,
      status: 'Available',
      description: 'Spacious room with modern furnishing, queen bed, and relaxing ambiance.',
      amenities: 'WiFi, AC, TV, Mini Fridge, En-suite Bathroom',
      images: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'
    });
    setShowRoomModal(true);
  };

  const handleOpenEditRoom = (room) => {
    setEditingRoom(room);
    setRoomForm({
      roomNumber: room.roomNumber || '',
      roomType: room.roomType || 'Deluxe Room',
      price: room.price || 3500,
      capacity: room.capacity || 2,
      status: room.status || 'Available',
      description: room.description || '',
      amenities: Array.isArray(room.amenities) ? room.amenities.join(', ') : (room.amenities || ''),
      images: Array.isArray(room.images) && room.images.length > 0 ? room.images[0] : 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'
    });
    setShowRoomModal(true);
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    setSubmittingRoom(true);
    const payload = {
      hotelId: 1,
      roomNumber: roomForm.roomNumber,
      roomType: roomForm.roomType,
      price: parseFloat(roomForm.price),
      capacity: parseInt(roomForm.capacity, 10),
      status: roomForm.status,
      description: roomForm.description,
      amenities: roomForm.amenities.split(',').map(s => s.trim()).filter(Boolean),
      images: [roomForm.images.trim()].filter(Boolean)
    };

    try {
      if (editingRoom) {
        await adminAPI.updateRoom(editingRoom.id, payload);
      } else {
        await adminAPI.createRoom(payload);
      }
      setShowRoomModal(false);
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save room details.');
    } finally {
      setSubmittingRoom(false);
    }
  };

  const handleDeleteRoom = async (id, roomNum) => {
    if (!window.confirm(`Are you sure you want to delete Room #${roomNum}?`)) return;
    try {
      await adminAPI.deleteRoom(id);
      setRooms(prev => prev.filter(r => r.id !== id));
      // Refresh stats
      const statsRes = await adminAPI.getStats();
      setStats(statsRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete room.');
    }
  };

  const filteredBookings = statusFilter
    ? bookings.filter(b => b.bookingStatus === statusFilter)
    : bookings;

  if (loading) {
    return (
      <div className="spinner-overlay" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <div className="text-muted">Loading Admin Portal...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
      {/* Sidebar Navigation */}
      <div className="admin-sidebar" style={{
        width: '240px',
        background: '#1e293b',
        color: 'white',
        padding: '1.5rem 1rem',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div className="admin-sidebar-logo" style={{
          fontSize: '1.1rem',
          fontWeight: 800,
          color: 'white',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>🏨</span> Trinity Admin
        </div>

        <div className="admin-nav" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'dashboard' ? 'var(--brand)' : 'transparent',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.88rem',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.7rem'
            }}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'bookings' ? 'var(--brand)' : 'transparent',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.88rem',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.7rem'
            }}
          >
            📅 Bookings
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'rooms' ? 'var(--brand)' : 'transparent',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.88rem',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.7rem'
            }}
          >
            🛏️ Rooms (CRUD)
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'customers' ? 'var(--brand)' : 'transparent',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.88rem',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.7rem'
            }}
          >
            👥 Customers
          </button>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid #334155', fontSize: '0.75rem', color: '#94a3b8' }}>
          <div>Trinity Suites Staff Portal</div>
          <div>v2.4 Pro</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="admin-main" style={{ flex: 1, padding: '2rem', background: '#f8fafc', overflowY: 'auto' }}>
        
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', color: '#0f172a' }}>Dashboard Overview</h2>
                <p className="text-muted">Real-time stats and operational overview of Trinity Suites.</p>
              </div>
              <button onClick={fetchAllData} className="btn btn-secondary btn-sm">🔄 Refresh Data</button>
            </div>

            <div className="stat-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2rem'
            }}>
              <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '54px', height: '54px', borderRadius: '12px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>🏨</div>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>{stats?.totalRooms || rooms.length}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Rooms</div>
                </div>
              </div>
              <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '54px', height: '54px', borderRadius: '12px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>✅</div>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>{stats?.availableRooms ?? rooms.filter(r => r.status === 'Available').length}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Available Rooms</div>
                </div>
              </div>
              <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '54px', height: '54px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>📅</div>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>{stats?.totalBookings || bookings.length}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Bookings</div>
                </div>
              </div>
              <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '54px', height: '54px', borderRadius: '12px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>💰</div>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>₹{parseFloat(stats?.revenue || 0).toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Paid Revenue</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Recent Bookings</h3>
              <button onClick={() => setActiveTab('bookings')} className="btn btn-ghost btn-sm">View All ({bookings.length}) →</button>
            </div>

            <div className="card table-wrapper" style={{ overflowX: 'auto', background: 'white' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#475569' }}>Ref ID</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#475569' }}>Guest Details</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#475569' }}>Room Type</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#475569' }}>Stay Dates</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#475569' }}>Amount</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#475569' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 8).map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--brand)' }}>#{String(b.id).padStart(6, '0')}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{b.guestName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.guestEmail} • {b.guestPhone}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem' }}>
                        <strong>{b.room?.roomType || 'Standard Room'}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Room #{b.room?.roomNumber || '101'}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem' }}>
                        <div>{new Date(b.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} → {new Date(b.checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.guests} Adult(s)</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                        ₹{parseFloat(b.totalAmount).toLocaleString('en-IN')}
                        <div style={{ fontSize: '0.72rem' }}>
                          <span className={`badge badge-${b.paymentStatus.toLowerCase()}`}>{b.paymentStatus}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className={`badge badge-${b.bookingStatus.toLowerCase()}`}>{b.bookingStatus}</span>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No recent bookings found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: BOOKINGS MANAGEMENT */}
        {activeTab === 'bookings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', color: '#0f172a' }}>Booking Management</h2>
                <p className="text-muted">Review all guest reservations, update statuses, and process cancellations.</p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['', 'Pending', 'Confirmed', 'Cancelled'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {st || 'All Bookings'}
                  </button>
                ))}
              </div>
            </div>

            <div className="card table-wrapper" style={{ overflowX: 'auto', background: 'white' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#475569' }}>Ref ID</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#475569' }}>Guest Details</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#475569' }}>Room Details</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#475569' }}>Dates & Nights</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#475569' }}>Total Amount</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#475569' }}>Status Control</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--brand)' }}>#{String(b.id).padStart(6, '0')}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{b.guestName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.guestEmail}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>📞 {b.guestPhone}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem' }}>
                        <strong>{b.room?.roomType || 'Standard Room'}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Room #{b.room?.roomNumber || '101'}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem' }}>
                        <div>{new Date(b.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} → {new Date(b.checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.guests} Adult(s)</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                        ₹{parseFloat(b.totalAmount).toLocaleString('en-IN')}
                        <div style={{ fontSize: '0.72rem', marginTop: '0.2rem' }}>
                          <span className={`badge badge-${b.paymentStatus.toLowerCase()}`}>{b.paymentStatus}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <select
                            value={b.bookingStatus}
                            onChange={e => handleUpdateBookingStatus(b.id, e.target.value)}
                            className="form-control"
                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.78rem', width: 'auto', fontWeight: 600 }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No bookings matching your criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ROOM MANAGEMENT (CRUD) */}
        {activeTab === 'rooms' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', color: '#0f172a' }}>Room Management (CRUD)</h2>
                <p className="text-muted">Add new room inventories, modify pricing & descriptions, or remove rooms.</p>
              </div>
              <button onClick={handleOpenAddRoom} className="btn btn-primary btn-sm">
                <span>+</span> Add New Room
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {rooms.map(room => (
                <div key={room.id} className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ position: 'relative', height: '160px', background: '#e2e8f0' }}>
                    <img
                      src={Array.isArray(room.images) && room.images.length > 0 ? room.images[0] : 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'}
                      alt={room.roomType}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                      <span className={`badge ${room.status === 'Available' ? 'badge-confirmed' : 'badge-cancelled'}`}>
                        {room.status}
                      </span>
                    </div>
                    <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                      Room #{room.roomNumber}
                    </div>
                  </div>

                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{room.roomType}</h4>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand)' }}>₹{room.price}/nt</div>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {room.description || 'No description provided.'}
                    </p>

                    <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '1rem' }}>
                      <strong>Capacity:</strong> {room.capacity} Guests • <strong>Amenities:</strong> {Array.isArray(room.amenities) ? room.amenities.slice(0, 3).join(', ') : 'AC, WiFi, TV'}
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleOpenEditRoom(room)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                        ✏️ Edit Room
                      </button>
                      <button onClick={() => handleDeleteRoom(room.id, room.roomNumber)} className="btn btn-danger btn-sm" style={{ padding: '0.35rem 0.65rem' }}>
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal for Add / Edit Room */}
            {showRoomModal && (
              <div className="modal-overlay" style={{ zIndex: 1100 }}>
                <div className="modal-box" style={{ maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
                  <div className="modal-razorpay-header">
                    <div className="brand">{editingRoom ? `Edit Room #${editingRoom.roomNumber}` : 'Add New Room'}</div>
                    <button onClick={() => setShowRoomModal(false)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
                  </div>
                  <form onSubmit={handleSaveRoom} style={{ padding: '1.5rem' }}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Room Number</label>
                        <input type="text" required className="form-control" placeholder="e.g. 201" value={roomForm.roomNumber} onChange={e => setRoomForm({ ...roomForm, roomNumber: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Room Type</label>
                        <select className="form-control" value={roomForm.roomType} onChange={e => setRoomForm({ ...roomForm, roomType: e.target.value })}>
                          <option value="Deluxe Room">Deluxe Room</option>
                          <option value="Standard Room">Standard Room</option>
                          <option value="Executive Suite">Executive Suite</option>
                          <option value="Family Suite">Family Suite</option>
                          <option value="Presidential Suite">Presidential Suite</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Price per Night (₹)</label>
                        <input type="number" required min="500" className="form-control" placeholder="3500" value={roomForm.price} onChange={e => setRoomForm({ ...roomForm, price: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Max Guests Capacity</label>
                        <input type="number" required min="1" max="10" className="form-control" placeholder="2" value={roomForm.capacity} onChange={e => setRoomForm({ ...roomForm, capacity: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Status</label>
                        <select className="form-control" value={roomForm.status} onChange={e => setRoomForm({ ...roomForm, status: e.target.value })}>
                          <option value="Available">Available</option>
                          <option value="Booked">Booked</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Image URL</label>
                      <input type="url" required className="form-control" placeholder="https://images.unsplash.com/..." value={roomForm.images} onChange={e => setRoomForm({ ...roomForm, images: e.target.value })} />
                    </div>

                    <div className="form-group">
                      <label>Amenities (comma separated)</label>
                      <input type="text" className="form-control" placeholder="WiFi, AC, TV, Mini Fridge" value={roomForm.amenities} onChange={e => setRoomForm({ ...roomForm, amenities: e.target.value })} />
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea rows="3" required className="form-control" placeholder="Brief description of the room..." value={roomForm.description} onChange={e => setRoomForm({ ...roomForm, description: e.target.value })}></textarea>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                      <button type="button" onClick={() => setShowRoomModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                      <button type="submit" disabled={submittingRoom} className="btn btn-primary" style={{ flex: 2 }}>
                        {submittingRoom ? 'Saving...' : (editingRoom ? 'Update Room' : 'Create Room')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CUSTOMERS MANAGEMENT */}
        {activeTab === 'customers' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.6rem', color: '#0f172a' }}>Customer Management</h2>
              <p className="text-muted">Directory of all registered accounts and guest checkout customers.</p>
            </div>

            <div className="card table-wrapper" style={{ overflowX: 'auto', background: 'white' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#475569' }}>Customer Name</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#475569' }}>Contact Details</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#475569' }}>Account Type</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#475569' }}>Total Bookings</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#475569' }}>Total Spent</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#475569' }}>Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c.id || c.email} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a' }}>{c.name}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: '#334155' }}>{c.email}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>📞 {c.phone}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {c.registered ? (
                          <span className="badge badge-confirmed">Registered Account</span>
                        ) : (
                          <span className="badge badge-pending">Guest Checkout</span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                        {c.totalBookings} Booking(s)
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--brand)' }}>
                        ₹{parseFloat(c.totalSpent || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#64748b' }}>
                        {c.lastBookingDate ? new Date(c.lastBookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                      </td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No customers found yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;
