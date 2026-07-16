const { sequelize, User, Hotel, Room, Booking, Payment } = require('../models');

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [totalRooms, totalBookings, totalCustomers, availableRooms] = await Promise.all([
      Room.count(),
      Booking.count(),
      User.count({ where: { role: 'user' } }),
      Room.count({ where: { status: 'Available' } }),
    ]);

    // Total revenue from paid bookings
    const revenue = await Booking.sum('totalAmount', { where: { paymentStatus: 'Paid' } });

    // Monthly booking stats (last 6 months)
    const monthlyStats = await sequelize.query(`
      SELECT 
        TO_CHAR(created_at, 'Mon YYYY') AS month,
        COUNT(*) AS bookings,
        SUM(total_amount) AS revenue
      FROM bookings
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
    `, { type: sequelize.QueryTypes.SELECT });

    // Booking status breakdown
    const statusBreakdown = await sequelize.query(`
      SELECT booking_status, COUNT(*) as count
      FROM bookings GROUP BY booking_status
    `, { type: sequelize.QueryTypes.SELECT });

    res.json({ totalRooms, totalBookings, totalCustomers, availableRooms, revenue: revenue || 0, monthlyStats, statusBreakdown });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats.', error: err.message });
  }
};

// GET /api/admin/bookings
const getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.bookingStatus = status;

    const { rows: bookings, count } = await Booking.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Room, as: 'room', include: [{ model: Hotel, as: 'hotel', attributes: ['id', 'name'] }] },
        { model: Payment, as: 'payment' },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({ bookings, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookings.', error: err.message });
  }
};

// PUT /api/admin/bookings/:id/status
const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    const { bookingStatus } = req.body;
    await booking.update({ bookingStatus });
    res.json({ message: 'Booking status updated.', booking });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update booking status.', error: err.message });
  }
};

// GET /api/admin/customers
const getCustomers = async (req, res) => {
  try {
    const allBookings = await Booking.findAll({
      order: [['createdAt', 'DESC']],
    });

    const customerMap = new Map();

    // Add registered users first
    const registeredUsers = await User.findAll({
      where: { role: 'user' },
      attributes: { exclude: ['password'] },
    });

    for (const u of registeredUsers) {
      customerMap.set(u.email.toLowerCase(), {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || '-',
        location: u.location || '-',
        registered: true,
        totalBookings: 0,
        totalSpent: 0,
        lastBookingDate: null,
      });
    }

    // Aggregate bookings by guestEmail
    for (const b of allBookings) {
      const emailKey = (b.guestEmail || '').toLowerCase().trim();
      if (!emailKey) continue;

      if (!customerMap.has(emailKey)) {
        customerMap.set(emailKey, {
          id: `guest_${b.id}`,
          name: b.guestName || 'Guest User',
          email: b.guestEmail,
          phone: b.guestPhone || '-',
          location: '-',
          registered: false,
          totalBookings: 0,
          totalSpent: 0,
          lastBookingDate: b.createdAt,
        });
      }

      const cust = customerMap.get(emailKey);
      cust.totalBookings += 1;
      if (b.paymentStatus === 'Paid') {
        cust.totalSpent += parseFloat(b.totalAmount || 0);
      }
      if (!cust.lastBookingDate || new Date(b.createdAt) > new Date(cust.lastBookingDate)) {
        cust.lastBookingDate = b.createdAt;
      }
    }

    const customersList = Array.from(customerMap.values());
    res.json(customersList);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch customers.', error: err.message });
  }
};

// GET /api/admin/rooms
const getAdminRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      include: [{ model: Hotel, as: 'hotel', attributes: ['id', 'name'] }],
      order: [['roomNumber', 'ASC']],
    });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch rooms.', error: err.message });
  }
};

module.exports = { getStats, getAllBookings, updateBookingStatus, getCustomers, getAdminRooms };
