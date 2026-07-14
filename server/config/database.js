const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'hotel_booking',
  'jagjeet',
  'jagjeet123',
  {
    host: '127.0.0.1',
    port: 5432,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      // Force plain password auth — avoid SASL/SCRAM issues
      ssl: false,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

module.exports = sequelize;


