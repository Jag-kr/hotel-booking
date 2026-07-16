const { Op } = require('sequelize');
const { Booking, Room, Hotel, User, Payment } = require('../models');

// POST /api/bookings  — no auth required, guests can book freely
const createBooking = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guests, guestName, guestEmail, guestPhone, specialRequests } = req.body;

    if (!roomId || !checkIn || !checkOut || !guestName || !guestEmail || !guestPhone) {
      return res.status(400).json({ message: 'roomId, checkIn, checkOut, guestName, guestEmail and guestPhone are required.' });
    }

    // Check room exists
    const room = await Room.findByPk(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    if (room.status === 'Maintenance') return res.status(400).json({ message: 'Room is under maintenance.' });

    // Check availability (date overlap)
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
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const pricePerNight = room.discountPercent > 0
      ? room.price * (1 - room.discountPercent / 100)
      : room.price;
    const totalAmount = Math.round(pricePerNight * nights);

    const booking = await Booking.create({
      userId: req.user?.id || null,  // optional — only set if admin/user is logged in
      roomId,
      checkIn,
      checkOut,
      guests: guests || 1,
      totalAmount,
      bookingStatus: 'Pending',
      paymentStatus: 'Pending',
      guestName,
      guestEmail,
      guestPhone,
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

// GET /api/bookings/lookup?ref=<id>&email=<email>  — no auth required
const lookupBooking = async (req, res) => {
  try {
    const { ref, email } = req.query;
    if (!ref || !email) {
      return res.status(400).json({ message: 'Booking reference and email are required.' });
    }

    const booking = await Booking.findOne({
      where: {
        id: parseInt(ref, 10),
        guestEmail: email.toLowerCase(),
      },
      include: [
        { model: Room, as: 'room', include: [{ model: Hotel, as: 'hotel' }] },
        { model: Payment, as: 'payment' },
      ],
    });

    if (!booking) return res.status(404).json({ message: 'Booking not found. Please check your reference number and email.' });

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Lookup failed.', error: err.message });
  }
};

// GET /api/bookings/my  — kept for admin use or future use, still protected
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

// GET /api/bookings/:id  — admin only
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
    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled.' });
    }
    await booking.update({ bookingStatus: 'Cancelled' });
    res.json({ message: 'Booking cancelled successfully.', booking });
  } catch (err) {
    res.status(500).json({ message: 'Failed to cancel booking.', error: err.message });
  }
};

module.exports = { createBooking, lookupBooking, getMyBookings, getBooking, cancelBooking };
