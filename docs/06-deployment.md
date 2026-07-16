# Deployment Documentation
> Hotel Booking Application

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+

---

## 1. Local Development Setup

### Step 1: Clone and Install

```bash
git clone https://github.com/Jag-kr/hotel-booking.git
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
JWT_SECRET=trinity_suites_prod_jwt_secret_9f8a7c6d5e4b3a2f1e0d9c8b7a6f5e4d3c2b1a
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

## 4. Production Cloud Deployment Architecture

The application is deployed across cloud platforms to ensure zero-downtime availability, automated SSL encryption, and high performance.

---

### 🌐 Live Production Deployment Overview

| Component | Platform | Configuration & Environment Details |
|---|---|---|
| **Frontend Application** | **Vercel** (Global Edge CDN) | **Live URL:** `https://hotel-booking-rho-ten.vercel.app`<br>**Build Command:** `npm run build` (Output: `dist`)<br>**API Binding:** `VITE_API_URL` set to Render REST API endpoint |
| **Backend REST API** | **Render Cloud Web Service** | **Live Endpoint:** `https://hotel-booking-meed.onrender.com/api/health`<br>**Start Command:** `node index.js`<br>**Features:** Dual route mounting (`/` & `/api`), dynamic origin CORS (`credentials: true`), and automated initialization (`seedDatabase()`) |
| **Database Engine** | **Neon Serverless PostgreSQL** | **Version:** PostgreSQL 16 Cluster (`Connection String SSL required`)<br>**Connection Pool:** Max 5, acquire timeout 30000ms<br>**Seeding Status:** Auto-populated with 9 rooms across 3 categories, user accounts, and test reservations |

---

### 🛡️ Production Security & Environment Hardening
1. **Secrets Isolation:** All API keys and connection strings (`DATABASE_URL`, `JWT_SECRET`) are injected via encrypted environment variables (`Render Dashboard` & `Vercel Dashboard`).
2. **Database SSL/TLS Enforcement:** `server/config/database.js` enforces `ssl: { require: true, rejectUnauthorized: false }` for all cloud PostgreSQL connections while falling back cleanly for local development.
3. **Automated Boot Initialization:** On every deployment startup, the server inspects table records and executes initial data seeding (`seedDatabase()`) only if the schema is empty (`User.count() === 0`), guaranteeing consistent evaluation state without data duplication.

---

## 5. Health Check & Verification

Once deployed, test your live backend by visiting `<your-backend-url>/api/health`:

```json
{ "status": "ok", "timestamp": "2026-07-16T..." }
```
