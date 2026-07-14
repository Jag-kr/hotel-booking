const router = require('express').Router();
const { getStats, getAllBookings, updateBookingStatus, getCustomers, getAdminRooms } = require('../controllers/adminController');
const { createRoom, updateRoom, deleteRoom } = require('../controllers/hotelController');
const { authenticate, adminOnly } = require('../middleware/auth');

router.use(authenticate, adminOnly);

router.get('/stats', getStats);
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/status', updateBookingStatus);
router.get('/customers', getCustomers);
router.get('/rooms', getAdminRooms);
router.post('/rooms', createRoom);
router.put('/rooms/:id', updateRoom);
router.delete('/rooms/:id', deleteRoom);

module.exports = router;
