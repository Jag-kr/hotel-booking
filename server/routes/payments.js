const router = require('express').Router();
const { processPayment, getPayment } = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

// Public — guest can process payment right after booking
router.post('/', processPayment);

// Protected — view payment details
router.get('/:bookingId', authenticate, getPayment);

module.exports = router;
