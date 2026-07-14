const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  hotelId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'hotels', key: 'id' },
  },
  roomNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  roomType: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  capacity: {
    type: DataTypes.INTEGER,
    defaultValue: 2,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: [],
  },
  amenities: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: [],
  },
  status: {
    type: DataTypes.ENUM('Available', 'Booked', 'Maintenance'),
    defaultValue: 'Available',
  },
  discountPercent: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'rooms',
  timestamps: true,
  underscored: true,
});

module.exports = Room;
