# 🏨 Trinity Suites — Hotel Booking Application

A full-stack hotel booking application built to mirror the UX flow of the [Trinity Suites Bangalore](https://hotels.eglobe-solutions.com/trinitysuites/booking/hotels/trinity-suites-bangalore-bangalore?checkIn=26-May-2026&nights=1#bookingsteps) reference site.

---

## 📚 Documentation Index

| Document | Link |
|---|---|
| Requirement Analysis | [docs/01-requirement-analysis.md](./docs/01-requirement-analysis.md) |
| Solution Design (Architecture + ER Diagram) | [docs/02-solution-design.md](./docs/02-solution-design.md) |
| Technology & Architecture Overview | [docs/03-technology-overview.md](./docs/03-technology-overview.md) |
| Feature Scope (Implemented / Excluded) | [docs/04-feature-scope.md](./docs/04-feature-scope.md) |
| Validation & Testing Checklist | [docs/05-validation-testing.md](./docs/05-validation-testing.md) |
| Deployment Documentation | [docs/06-deployment.md](./docs/06-deployment.md) |
| Project Approach Summary | [docs/07-project-approach.md](./docs/07-project-approach.md) |
| Database Setup (Quick Start) | [DB_SETUP.md](./DB_SETUP.md) |

---

## 🌟 Project Overview

Built as a comprehensive submission for the **Senior Full-Stack Developer Assignment (`ABI Technologies`)**, this application is a full-featured hotel booking web platform designed to mirror the reference flow of [Trinity Suites Bangalore](https://hotels.eglobe-solutions.com/trinitysuites/booking/hotels/trinity-suites-bangalore-bangalore?checkIn=26-May-2026&nights=1#bookingsteps).

Guests can search real-time room availability, complete a 4-step booking wizard without mandatory account registration, make a simulated payment, and manage or cancel reservations instantly. Admins get a comprehensive 4-tab staff portal (`Dashboard`, `Bookings`, `Rooms CRUD`, `Customers`) to manage operations.

---

## 🚀 Live Deployed Project

The complete full-stack application (`Frontend`, `REST API`, and `PostgreSQL Database`) is deployed and accessible online:

| Layer | Deployed Platform | Live URL & Status |
|---|---|---|
| **Frontend Application** | Vercel (Global Edge CDN) | **[🌐 https://hotel-booking-rho-ten.vercel.app](https://hotel-booking-rho-ten.vercel.app)** |
| **Backend REST API** | Render Cloud Web Service | **[⚡ https://hotel-booking-meed.onrender.com/api/health](https://hotel-booking-meed.onrender.com/api/health)** |
| **Database Engine** | Neon Serverless PostgreSQL | **Cloud PostgreSQL 16 Cluster** (Auto-seeded with 9 rooms, users, and reservations) |

> **Note:** The cloud database features automated boot initialization (`seedDatabase()`) and dynamic overlap filtering (`Op.or`) to prevent double-bookings.

---

## ✨ Features

### Guest
- 🔍 **Search rooms** by check-in date, check-out date, and number of guests
- 🏠 **Browse available rooms** with type, price, capacity, and amenities
- 📝 **4-step booking wizard** (Select Room → Guest Details → Review → Payment)
- 🔓 **Guest checkout (No auth needed)** — Book freely without creating an account
- 💳 **Simulated Razorpay payment** modal with live card preview
- ⚡ **Instant confirmation** screen with Booking Ref Number (`#000013`), stay dates, and payment status
- 📋 **Manage My Booking (`/manage-booking`)** — Look up any booking using Ref Number & Email, view details, and cancel if needed

### Admin
- 📊 **Dashboard Overview (`📊 Dashboard`)** — KPI stat cards (total rooms, available rooms, bookings, revenue) + recent bookings
- 📅 **Booking Management (`📅 Bookings`)** — Filter bookings (`All`, `Pending`, `Confirmed`, `Cancelled`) + instant status update dropdown
- 🛏️ **Room Management (`🛏️ Rooms CRUD`)** — Add new rooms via popup modal, edit pricing/descriptions, and delete rooms
- 👥 **Customer Management (`👥 Customers`)** — Directory aggregating registered accounts and guest checkouts with booking counts & total spent

---

## 📸 Screenshots & Flow Verification

| Screen | Description |
|---|---|
| **Public Booking Engine (`/`)** | 4-step wizard matching reference UI with check-in, room selection, guest info, and Razorpay modal. |
| **Manage My Booking (`/manage-booking`)** | Guest lookup page by Reference Number and Email with full reservation breakdown. |
| **Admin Login (`/admin/login`)** | Discreet staff portal with pre-filled default credentials (`admin@hotelbooking.com` / `Admin@123`). |
| **Admin Dashboard (`/admin`)** | 4 interactive tabs (`Dashboard`, `Bookings`, `Rooms CRUD`, `Customers`) for full hotel management. |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router DOM, Axios |
| Styling | Vanilla CSS (custom design system) |
| State | React Context API |
| Backend | Node.js, Express 5 |
| ORM | Sequelize 6 |
| Database | PostgreSQL 16 |
| Auth | JWT + bcryptjs |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Clone the repo
```bash
git clone https://github.com/Jag-kr/hotel-booking.git
cd hotel-booking
```

### 2. Install dependencies
```bash
cd server && npm install
cd ../client && npm install
```

### 3. Set up the database
See [docs/06-deployment.md](./docs/06-deployment.md) for full PostgreSQL setup steps, or run:
```bash
sudo -u postgres psql -c "CREATE USER jagjeet WITH PASSWORD 'jagjeet123';"
sudo -u postgres psql -c "CREATE DATABASE hotel_booking OWNER jagjeet;"
```

### 4. Configure environment
Create `server/.env`:
```env
PORT=5000
DB_NAME=hotel_booking
DB_USER=jagjeet
DB_PASSWORD=jagjeet123
DB_HOST=127.0.0.1
DB_PORT=5432
JWT_SECRET=trinity_suites_prod_jwt_secret_9f8a7c6d5e4b3a2f1e0d9c8b7a6f5e4d3c2b1a
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@hotelbooking.com
ADMIN_PASSWORD=Admin@123
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Seed the database
```bash
cd server && npm run seed
```

### 6. Start the servers
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔑 Default Login Credentials

| Portal | Email | Password | Role |
|---|---|---|---|
| **Admin Portal (`/admin/login`)** | `admin@hotelbooking.com` | `Admin@123` | Hotel Staff / Administrator |

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register |
| POST | `/api/auth/login` | Public | User login |
| POST | `/api/auth/admin/login` | Public | Admin login |
| GET | `/api/auth/me` | User | Current user |
| GET | `/api/hotels` | Public | List hotels |
| GET | `/api/rooms` | Public | Available rooms |
| POST | `/api/rooms` | Admin | Create room |
| PUT | `/api/rooms/:id` | Admin | Update room |
| DELETE | `/api/rooms/:id` | Admin | Delete room |
| POST | `/api/bookings` | Public | Create guest booking |
| GET | `/api/bookings/lookup` | Public | Lookup booking by Ref + Email |
| GET | `/api/bookings/my` | User | My bookings |
| PUT | `/api/bookings/:id/cancel` | Public/Admin | Cancel booking |
| POST | `/api/payments` | Public | Process guest payment |
| GET | `/api/admin/stats` | Admin | Dashboard stats |
| GET | `/api/admin/bookings` | Admin | All bookings |
| PUT | `/api/admin/bookings/:id/status` | Admin | Update status |
| GET | `/api/admin/customers` | Admin | All customers |
| GET | `/api/health` | Public | Health check |

Full details → [docs/02-solution-design.md](./docs/02-solution-design.md)

---

## 🔮 Future Improvements

- Printable PDF invoice and booking voucher download
- Email notifications via SendGrid/AWS SES upon booking confirmation
- Real Razorpay SDK integration with webhook verification
- Automated integration and E2E testing (Jest + Playwright)

---

## 🤖 AI Tools Used

This project was developed with assistance from **Google Antigravity AI (Gemini)** for code generation, architecture planning, debugging, and documentation. All code was reviewed and executed by the developer.

See details → [docs/07-project-approach.md](./docs/07-project-approach.md)

---

## 📁 Project Structure

```
hotel-booking/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── api/             # Axios client
│   │   ├── components/      # Navbar, etc.
│   │   ├── context/         # AuthContext, BookingContext
│   │   ├── pages/           # Home, Login, Register, AdminDashboard
│   │   └── index.css        # Design system (CSS variables + components)
│   └── vite.config.js
├── server/                  # Express backend
│   ├── config/              # Database connection
│   ├── controllers/         # Auth, Hotel, Booking, Payment, Admin
│   ├── middleware/          # JWT auth + adminOnly
│   ├── models/              # Sequelize models
│   ├── routes/              # Express routers
│   ├── seeders/             # DB seed script
│   └── index.js             # Server entry point
├── docs/                    # All documentation
│   ├── 01-requirement-analysis.md
│   ├── 02-solution-design.md
│   ├── 03-technology-overview.md
│   ├── 04-feature-scope.md
│   ├── 05-validation-testing.md
│   ├── 06-deployment.md
│   └── 07-project-approach.md
└── README.md
```
