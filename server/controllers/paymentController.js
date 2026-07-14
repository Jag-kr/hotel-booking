const { Payment, Booking, Room, Hotel } = require('../models');

// POST /api/payments  — mock Razorpay payment
const processPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod, cardNumber, cardName, expiryMonth, expiryYear, cvv } = req.body;

    const booking = await Booking.findByPk(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (booking.userId !== req.user.id) return res.status(403).json({ message: 'Access denied.' });
    if (booking.paymentStatus === 'Paid') return res.status(400).json({ message: 'Booking is already paid.' });

    // Simulate payment processing delay + success
    const transactionId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    const cardLast4 = cardNumber ? cardNumber.replace(/\s/g, '').slice(-4) : '0000';

    const payment = await Payment.create({
      bookingId,
      amount: booking.totalAmount,
      paymentMethod: paymentMethod || 'card',
      transactionId,
      status: 'Success',
      cardLast4,
    });

    // Update booking status
    await booking.update({ paymentStatus: 'Paid', bookingStatus: 'Confirmed' });

    const fullBooking = await Booking.findByPk(bookingId, {
      include: [
        { model: Room, as: 'room', include: [{ model: Hotel, as: 'hotel' }] },
        { model: Payment, as: 'payment' },
      ],
    });

    res.status(201).json({
      message: 'Payment successful!',
      transactionId,
      payment,
      booking: fullBooking,
    });
  } catch (err) {
    res.status(500).json({ message: 'Payment processing failed.', error: err.message });
  }
};

// GET /api/payments/:bookingId
const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      where: { bookingId: req.params.bookingId },
      include: [{ model: Booking, as: 'booking' }],
    });
    if (!payment) return res.status(404).json({ message: 'Payment not found.' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payment.', error: err.message });
  }
};

module.exports = { processPayment, getPayment };
