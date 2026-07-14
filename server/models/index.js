const sequelize = require('../config/database');
const User = require('./User');
const Hotel = require('./Hotel');
const Room = require('./Room');
const Booking = require('./Booking');
const Payment = require('./Payment');

// Associations
Hotel.hasMany(Room, { foreignKey: 'hotelId', as: 'rooms', onDelete: 'CASCADE' });
Room.belongsTo(Hotel, { foreignKey: 'hotelId', as: 'hotel' });

User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Room.hasMany(Booking, { foreignKey: 'roomId', as: 'bookings' });
Booking.belongsTo(Room, { foreignKey: 'roomId', as: 'room' });

Booking.hasOne(Payment, { foreignKey: 'bookingId', as: 'payment' });
Payment.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

module.exports = { sequelize, User, Hotel, Room, Booking, Payment };
