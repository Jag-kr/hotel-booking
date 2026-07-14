const router = require('express').Router();
const { createBooking, getMyBookings, getBooking, cancelBooking } = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, createBooking);
router.get('/my', authenticate, getMyBookings);
router.get('/:id', authenticate, getBooking);
router.put('/:id/cancel', authenticate, cancelBooking);

module.exports = router;
