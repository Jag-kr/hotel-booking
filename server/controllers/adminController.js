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
    const customers = await User.findAll({
      where: { role: 'user' },
      attributes: { exclude: ['password'] },
      include: [{
        model: Booking,
        as: 'bookings',
        attributes: ['id', 'totalAmount', 'bookingStatus', 'paymentStatus', 'createdAt'],
      }],
      order: [['createdAt', 'DESC']],
    });

    const customersWithStats = customers.map(c => ({
      ...c.toJSON(),
      totalBookings: c.bookings.length,
      totalSpent: c.bookings.filter(b => b.paymentStatus === 'Paid').reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0),
    }));

    res.json(customersWithStats);
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
