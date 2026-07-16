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

## 4. Production Deployment Guide (Free & Paid Options)

Our codebase is fully equipped for **100% Free Tier** deployment using cloud connection strings (`DATABASE_URL`), dynamic CORS, and **automatic initial seeding on startup**.

---

### ⭐ Option A: 100% Free Deployment Stack (Recommended if Railway Trial Expired)

#### 1. Database → Neon.tech (Free Serverless PostgreSQL)
1. Go to **[neon.tech](https://neon.tech)** and sign up for free with GitHub.
2. Click **Create Project** → Name it `hotel-booking` → Select region closest to you.
3. Copy the **Connection String** (`postgres://neondb_owner:xxxxx@ep-xxxx-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require`).

#### 2. Backend API → Render.com (Free Web Service)
1. Go to **[render.com](https://render.com)** and sign up for free with GitHub.
2. Click **New +** → **Web Service** → Connect your repository `https://github.com/Jag-kr/hotel-booking.git`.
3. Configure the Web Service:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
4. Under **Environment Variables**, add:
   ```env
   DATABASE_URL=postgres://neondb_owner:xxxxx@ep-xxxx-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   JWT_SECRET=trinity_suites_prod_jwt_secret_9f8a7c6d5e4b3a2f1e0d9c8b7a6f5e4d3c2b1a
   NODE_ENV=production
   ```
5. Click **Deploy Web Service**. Once deployed, copy your Render API URL (e.g., `https://hotel-booking-backend.onrender.com`).
   > **Note:** Our backend automatically detects an empty database on first run and auto-seeds all 9 rooms, admin credentials (`admin@hotelbooking.com` / `Admin@123`), and initial bookings!

#### 3. Frontend → Vercel (Free Static Hosting)
1. Go to **[vercel.com](https://vercel.com)** and import your GitHub repository.
2. Configure project settings:
   - **Root Directory:** Click Edit and select `client`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Under **Environment Variables**, add your Render API endpoint:
   ```env
   VITE_API_URL=https://your-backend-app.onrender.com/api
   ```
4. Click **Deploy**. Your full-stack hotel booking engine is now live and completely free!

---

## 5. Health Check & Verification

Once deployed, test your live backend by visiting `<your-backend-url>/api/health`:

```json
{ "status": "ok", "timestamp": "2026-07-16T..." }
```
