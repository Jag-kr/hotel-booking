const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'bookings', key: 'id' },
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.STRING(100),
    defaultValue: 'card',
  },
  transactionId: {
    type: DataTypes.STRING(255),
    unique: true,
  },
  status: {
    type: DataTypes.ENUM('Success', 'Failed', 'Pending'),
    defaultValue: 'Pending',
  },
  cardLast4: {
    type: DataTypes.STRING(4),
    allowNull: true,
  },
}, {
  tableName: 'payments',
  timestamps: true,
  underscored: true,
});

module.exports = Payment;
