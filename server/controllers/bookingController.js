const { Op } = require('sequelize');
const { Booking, Room, Hotel, User, Payment } = require('../models');

// POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guests, guestName, guestEmail, guestPhone, specialRequests } = req.body;

    // Check room exists
    const room = await Room.findByPk(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    if (room.status === 'Maintenance') return res.status(400).json({ message: 'Room is under maintenance.' });

    // Check availability
    const conflict = await Booking.findOne({
      where: {
        roomId,
        bookingStatus: { [Op.ne]: 'Cancelled' },
        [Op.or]: [
          { checkIn: { [Op.between]: [checkIn, checkOut] } },
          { checkOut: { [Op.between]: [checkIn, checkOut] } },
          { checkIn: { [Op.lte]: checkIn }, checkOut: { [Op.gte]: checkOut } },
        ],
      },
    });
    if (conflict) return res.status(409).json({ message: 'Room is not available for the selected dates.' });

    // Calculate total
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const pricePerNight = room.discountPercent > 0
      ? room.price * (1 - room.discountPercent / 100)
      : room.price;
    const totalAmount = pricePerNight * nights;

    const booking = await Booking.create({
      userId: req.user.id,
      roomId,
      checkIn,
      checkOut,
      guests: guests || 1,
      totalAmount,
      bookingStatus: 'Pending',
      paymentStatus: 'Pending',
      guestName: guestName || req.user.name,
      guestEmail: guestEmail || req.user.email,
      guestPhone: guestPhone || req.user.phone,
      specialRequests,
    });

    const fullBooking = await Booking.findByPk(booking.id, {
      include: [{ model: Room, as: 'room', include: [{ model: Hotel, as: 'hotel' }] }],
    });

    res.status(201).json(fullBooking);
  } catch (err) {
    res.status(500).json({ message: 'Booking failed.', error: err.message });
  }
};

// GET /api/bookings/my
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [
        { model: Room, as: 'room', include: [{ model: Hotel, as: 'hotel' }] },
        { model: Payment, as: 'payment' },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookings.', error: err.message });
  }
};

// GET /api/bookings/:id
const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        { model: Room, as: 'room', include: [{ model: Hotel, as: 'hotel' }] },
        { model: Payment, as: 'payment' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
      ],
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    // Only owner or admin can see
    if (booking.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch booking.', error: err.message });
  }
};

// PUT /api/bookings/:id/cancel
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (booking.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }
    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled.' });
    }
    await booking.update({ bookingStatus: 'Cancelled' });
    res.json({ message: 'Booking cancelled successfully.', booking });
  } catch (err) {
    res.status(500).json({ message: 'Failed to cancel booking.', error: err.message });
  }
};

module.exports = { createBooking, getMyBookings, getBooking, cancelBooking };
