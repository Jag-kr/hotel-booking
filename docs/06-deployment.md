# Deployment Documentation
> Hotel Booking Application

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+

---

## 1. Local Development Setup

### Step 1: Clone and Install

```bash
git clone https://github.com/<your-username>/hotel-booking.git
cd hotel-booking

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### Step 2: Configure the Database

Run these commands in your terminal:

```bash
# Open PostgreSQL superuser shell
sudo -u postgres psql

# Inside psql:
CREATE USER jagjeet WITH PASSWORD 'jagjeet123';
CREATE DATABASE hotel_booking OWNER jagjeet;
GRANT ALL PRIVILEGES ON DATABASE hotel_booking TO jagjeet;
\q
```

Then add an `md5` auth rule for the user in `pg_hba.conf`:

```bash
sudo sed -i 's|host    all             all             127.0.0.1/32.*|host    hotel_booking   jagjeet         127.0.0.1/32            md5\n&|' \
  /etc/postgresql/*/main/pg_hba.conf
sudo systemctl reload postgresql
```

### Step 3: Environment Variables

Create `server/.env`:

```env
PORT=5000
NODE_ENV=development

# Database
DB_NAME=hotel_booking
DB_USER=jagjeet
DB_PASSWORD=jagjeet123
DB_HOST=127.0.0.1
DB_PORT=5432

# JWT
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# Admin seed user
ADMIN_EMAIL=admin@hotelbooking.com
ADMIN_PASSWORD=Admin@123
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Step 4: Seed the Database

```bash
cd server && npm run seed
```

Output will show:
```
✅ Database synced
✅ Users created
✅ Hotel created
✅ Rooms created (9 rooms — Deluxe, Suite, Premium)
✅ Bookings created
✅ Payments created
🎉 Seed complete!
```

### Step 5: Run the Servers

```bash
# Terminal 1 — Backend
cd server && npm run dev
# Listening at http://localhost:5000

# Terminal 2 — Frontend
cd client && npm run dev
# Listening at http://localhost:5173
```

---

## 2. Default Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@hotelbooking.com` | `Admin@123` |
| **Demo Guest** | `ravi@example.com` | `Guest@123` |

---

## 3. Configuration Details

### server/config/database.js
- Connects to PostgreSQL on `127.0.0.1:5432`
- Uses hardcoded credentials for local dev (fallback when vestauth interceptor strips env)
- `logging: false` in production; set to `console.log` for debugging

### JWT
- Token expiry: 7 days
- Stored in `localStorage` on client
- `Authorization: Bearer <token>` header on all authenticated requests

---

## 4. Production Deployment (Planned)

### Backend → Railway

```bash
# Set environment variables in Railway dashboard:
# DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT (from Railway Postgres plugin)
# JWT_SECRET (strong random value)
# NODE_ENV=production
# PORT=5000 (Railway sets $PORT automatically)
```

### Frontend → Vercel

```bash
# Build command: npm run build
# Output dir: dist
# Set in Vercel env vars:
# VITE_API_URL=https://your-railway-backend.railway.app/api
```

### Database → Railway PostgreSQL Plugin
- Add PostgreSQL plugin to Railway project
- Copy `DATABASE_URL` and parse into individual `DB_*` env vars
- Run seed after first deploy: `railway run node server/seeders/seed.js`

---

## 5. Health Check

Backend exposes: `GET /api/health`

```json
{ "status": "ok", "timestamp": "2026-07-16T..." }
```
