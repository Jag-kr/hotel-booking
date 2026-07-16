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

A full-featured hotel booking web application where guests can search rooms, complete a multi-step booking wizard, and make a dummy payment. Admins can manage rooms, bookings, and customers through a dedicated dashboard.

---

## ✨ Features

### Guest
- 🔍 **Search rooms** by check-in date, check-out date, and number of guests
- 🏠 **Browse available rooms** with type, price, capacity, and amenities
- 📝 **4-step booking wizard** (Select Room → Guest Details → Review → Payment)
- 💳 **Simulated Razorpay payment** modal with live card preview
- 🔐 **Secure auth** — JWT-based register/login

### Admin
- 📊 **Dashboard statistics** — total rooms, available rooms, total bookings, revenue
- 📋 **All bookings** table — view guest info, dates, and statuses
- 🏨 **Room management** — Add, edit, delete rooms via API
- 👥 **Customer management** — View all guests with booking history

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
git clone https://github.com/<your-username>/hotel-booking.git
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
JWT_SECRET=your_secret_key_here
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

| Role | Email | Password |
|---|---|---|
| Admin | `admin@hotelbooking.com` | `Admin@123` |
| Guest | `ravi@example.com` | `Guest@123` |

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
| POST | `/api/bookings` | User | Create booking |
| GET | `/api/bookings/my` | User | My bookings |
| PUT | `/api/bookings/:id/cancel` | User | Cancel booking |
| POST | `/api/payments` | User | Process payment |
| GET | `/api/admin/stats` | Admin | Dashboard stats |
| GET | `/api/admin/bookings` | Admin | All bookings |
| PUT | `/api/admin/bookings/:id/status` | Admin | Update status |
| GET | `/api/admin/customers` | Admin | All customers |
| GET | `/api/health` | Public | Health check |

Full details → [docs/02-solution-design.md](./docs/02-solution-design.md)

---

## 🔮 Future Improvements

- Booking confirmation page with printable voucher
- "My Bookings" page for guests
- Admin CRUD UI for rooms and customers
- Deploy to Vercel (frontend) + Railway (backend)
- Email notifications via SendGrid
- Real Razorpay SDK integration
- Automated tests (Jest + Playwright)

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
