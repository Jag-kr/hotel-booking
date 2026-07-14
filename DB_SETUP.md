# PostgreSQL Database Setup

Run these commands in your terminal to set up the database:

```bash
# 1. Open psql as postgres superuser
sudo -u postgres psql

# 2. Inside psql — run all of these:
CREATE USER jagjeet WITH PASSWORD 'jagjeet123';
CREATE DATABASE hotel_booking OWNER jagjeet;
GRANT ALL PRIVILEGES ON DATABASE hotel_booking TO jagjeet;
\q

# 3. Run the seed (from project root)
cd server && npm run seed
```

> Note: The pg_hba.conf already has an md5 entry for jagjeet on hotel_booking.
> If you still get auth errors, run:
>   sudo -u postgres psql -c "ALTER USER jagjeet WITH PASSWORD 'jagjeet123';"
