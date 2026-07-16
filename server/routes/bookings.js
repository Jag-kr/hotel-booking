const router = require('express').Router();
const { createBooking, lookupBooking, getMyBookings, getBooking, cancelBooking } = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');

// Public — no auth needed
router.post('/', createBooking);
router.get('/lookup', lookupBooking);

// Admin/authenticated
router.get('/my', authenticate, getMyBookings);
router.get('/:id', authenticate, getBooking);
router.put('/:id/cancel', cancelBooking);  // allow cancel via booking ref lookup too

module.exports = router;
