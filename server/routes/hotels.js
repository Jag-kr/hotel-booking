const router = require('express').Router();
const { getHotels, getHotel, getRooms, getRoom, createRoom, updateRoom, deleteRoom } = require('../controllers/hotelController');
const { authenticate, adminOnly } = require('../middleware/auth');

// Hotels
router.get('/hotels', getHotels);
router.get('/hotels/:id', getHotel);

// Rooms
router.get('/rooms', getRooms);
router.get('/rooms/:id', getRoom);
router.post('/rooms', authenticate, adminOnly, createRoom);
router.put('/rooms/:id', authenticate, adminOnly, updateRoom);
router.delete('/rooms/:id', authenticate, adminOnly, deleteRoom);

module.exports = router;
