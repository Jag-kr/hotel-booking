const { Sequelize } = require('sequelize');

let sequelize;

if (process.env.DATABASE_URL) {
  // Cloud deployment (Render, Neon, Supabase, Railway, etc.) using single connection string
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
} else {
  // Separate environment variables or local development fallback
  const host = process.env.DB_HOST || '127.0.0.1';
  const isCloudHost = host !== '127.0.0.1' && host !== 'localhost';

  sequelize = new Sequelize(
    process.env.DB_NAME || 'hotel_booking',
    process.env.DB_USER || 'jagjeet',
    process.env.DB_PASSWORD || 'jagjeet123',
    {
      host: host,
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
      dialectOptions: isCloudHost
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : {
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
}

module.exports = sequelize;
