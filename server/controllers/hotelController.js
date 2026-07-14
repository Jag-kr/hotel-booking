const { Op } = require('sequelize');
const { Hotel, Room, Booking } = require('../models');

// GET /api/hotels
const getHotels = async (req, res) => {
  try {
    const hotels = await Hotel.findAll({ include: [{ model: Room, as: 'rooms', attributes: ['id', 'roomType', 'price', 'status'] }] });
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch hotels.', error: err.message });
  }
};

// GET /api/hotels/:id
const getHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByPk(req.params.id, {
      include: [{ model: Room, as: 'rooms' }],
    });
    if (!hotel) return res.status(404).json({ message: 'Hotel not found.' });
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch hotel.', error: err.message });
  }
};

// GET /api/rooms?hotelId=&checkIn=&checkOut=&guests=
const getRooms = async (req, res) => {
  try {
    const { hotelId, checkIn, checkOut, guests } = req.query;
    const where = {};
    if (hotelId) where.hotelId = hotelId;
    if (guests) where.capacity = { [Op.gte]: parseInt(guests) };

    const rooms = await Room.findAll({ where, include: [{ model: Hotel, as: 'hotel', attributes: ['id', 'name', 'address'] }] });

    // Availability check — exclude rooms booked during the requested dates
    if (checkIn && checkOut) {
      const bookedRoomIds = await Booking.findAll({
        where: {
          bookingStatus: { [Op.ne]: 'Cancelled' },
          [Op.or]: [
            { checkIn: { [Op.between]: [checkIn, checkOut] } },
            { checkOut: { [Op.between]: [checkIn, checkOut] } },
            { checkIn: { [Op.lte]: checkIn }, checkOut: { [Op.gte]: checkOut } },
          ],
        },
        attributes: ['roomId'],
      });
      const bookedIds = bookedRoomIds.map(b => b.roomId);
      const available = rooms.filter(r => !bookedIds.includes(r.id));
      return res.json(available);
    }

    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch rooms.', error: err.message });
  }
};

// GET /api/rooms/:id
const getRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id, {
      include: [{ model: Hotel, as: 'hotel' }],
    });
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch room.', error: err.message });
  }
};

// POST /api/rooms (admin)
const createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create room.', error: err.message });
  }
};

// PUT /api/rooms/:id (admin)
const updateRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    await room.update(req.body);
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update room.', error: err.message });
  }
};

// DELETE /api/rooms/:id (admin)
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    await room.destroy();
    res.json({ message: 'Room deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete room.', error: err.message });
  }
};

module.exports = { getHotels, getHotel, getRooms, getRoom, createRoom, updateRoom, deleteRoom };
