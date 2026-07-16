# Solution Design Overview
> Hotel Booking Application — Architecture & Design

## 1. Application Flow Diagram

```
                        ┌─────────────────────────┐
                        │       User (Browser)     │
                        └──────────┬──────────────┘
                                   │
                       ┌───────────▼───────────┐
                       │   React SPA (Vite)     │
                       │  Port 5173 (dev)       │
                       │  ─────────────────     │
                       │  React Router DOM      │
                       │  Context API (Auth,    │
                       │  Booking State)        │
                       │  Axios API Client      │
                       └───────────┬───────────┘
                                   │  HTTP/JSON
                                   │ (proxied in dev)
                       ┌───────────▼───────────┐
                       │   Express API Server  │
                       │   Port 5000           │
                       │  ─────────────────    │
                       │  JWT Auth Middleware  │
                       │  REST Routes          │
                       │  Sequelize ORM        │
                       └───────────┬───────────┘
                                   │  SQL (pg)
                       ┌───────────▼───────────┐
                       │  PostgreSQL Database  │
                       │  hotel_booking DB     │
                       │  ─────────────────    │
                       │  users               │
                       │  hotels              │
                       │  rooms               │
                       │  bookings            │
                       │  payments            │
                       └──────────────────────┘
```

---

## 2. Module / Component Breakdown

### Frontend (`client/src/`)

| Module | Path | Purpose |
|---|---|---|
| API Client | `api/index.js` | Axios instance with JWT interceptors + all API method helpers |
| Auth Context | `context/AuthContext.jsx` | Global user auth state (login, register, logout, isAdmin) |
| Booking Context | `context/BookingContext.jsx` | Booking wizard state (step, dates, selected room, guest details) |
| App Router | `App.jsx` | React Router — route definitions + protected route wrapper |
| Navbar | `components/Navbar.jsx` | Sticky header with auth-aware navigation |
| Home | `pages/Home.jsx` | 4-step booking wizard SPA |
| Login | `pages/Login.jsx` | Guest login form |
| Register | `pages/Register.jsx` | New guest registration form |
| Admin Dashboard | `pages/AdminDashboard.jsx` | Stats + bookings table + sidebar nav |
| Design System | `index.css` | All CSS variables, components, and utility classes |

### Backend (`server/`)

| Module | Path | Purpose |
|---|---|---|
| Entry | `index.js` | Express server, CORS, middleware, route registration |
| Database | `config/database.js` | Sequelize instance (PostgreSQL) |
| Models | `models/` | ORM models for User, Hotel, Room, Booking, Payment |
| Associations | `models/index.js` | FK relationships and cascade rules |
| Auth Controller | `controllers/authController.js` | Register, Login, AdminLogin, GetMe |
| Hotel Controller | `controllers/hotelController.js` | CRUD for hotels and rooms + availability filtering |
| Booking Controller | `controllers/bookingController.js` | Create, view, cancel bookings |
| Payment Controller | `controllers/paymentController.js` | Mock payment processing |
| Admin Controller | `controllers/adminController.js` | Dashboard stats, all bookings, customer list |
| Auth Middleware | `middleware/auth.js` | JWT verification + adminOnly guard |
| Seed | `seeders/seed.js` | Wipes and repopulates DB with demo data |

---

## 3. API Design Overview

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register new user |
| POST | `/auth/login` | Public | User login → JWT |
| POST | `/auth/admin/login` | Public | Admin login → JWT |
| GET | `/auth/me` | User | Get current user profile |
| GET | `/hotels` | Public | List all hotels |
| GET | `/hotels/:id` | Public | Hotel detail |
| GET | `/rooms` | Public | Rooms (with availability filter) |
| GET | `/rooms/:id` | Public | Room detail |
| POST | `/rooms` | Admin | Create room |
| PUT | `/rooms/:id` | Admin | Update room |
| DELETE | `/rooms/:id` | Admin | Delete room |
| POST | `/bookings` | User | Create a booking |
| GET | `/bookings/my` | User | My booking history |
| GET | `/bookings/:id` | User/Admin | Single booking detail |
| PUT | `/bookings/:id/cancel` | User/Admin | Cancel booking |
| POST | `/payments` | User | Process (mock) payment |
| GET | `/payments/:bookingId` | User | Get payment for a booking |
| GET | `/admin/stats` | Admin | Dashboard statistics |
| GET | `/admin/bookings` | Admin | All bookings (paginated) |
| PUT | `/admin/bookings/:id/status` | Admin | Update booking status |
| GET | `/admin/customers` | Admin | All customers + booking stats |
| GET | `/admin/rooms` | Admin | All rooms list |

---

## 4. Database Schema / ER Diagram

```
┌──────────────┐       ┌──────────────┐       ┌───────────────┐
│    users     │       │    hotels    │       │    rooms      │
│──────────────│       │──────────────│       │───────────────│
│ id (PK)      │       │ id (PK)      │       │ id (PK)       │
│ name         │       │ name         │       │ hotelId (FK)──┼─→ hotels.id
│ email        │       │ address      │       │ roomNumber    │
│ password     │       │ city         │       │ roomType      │
│ phone        │       │ description  │       │ price         │
│ location     │       │ amenities[]  │       │ discountPercent│
│ role         │       │ images[]     │       │ capacity      │
│              │       │ rating       │       │ description   │
└──────┬───────┘       └──────────────┘       │ images[]      │
       │                                      │ status        │
       │                                      └──────┬────────┘
       │                                             │
       │          ┌──────────────────────────────────┘
       │          │
       ▼          ▼
┌──────────────────────────┐       ┌──────────────────┐
│        bookings          │       │     payments     │
│──────────────────────────│       │──────────────────│
│ id (PK)                  │       │ id (PK)          │
│ userId (FK) ─────────────┼─→ users.id              │
│ roomId (FK) ─────────────┼─→ rooms.id              │
│ checkIn                  │       │ bookingId (FK)───┼─→ bookings.id
│ checkOut                 │       │ amount           │
│ guests                   │       │ paymentMethod    │
│ totalAmount              │       │ transactionId    │
│ bookingStatus            │       │ status           │
│ paymentStatus            │       │ cardLast4        │
│ guestName                │       └──────────────────┘
│ guestEmail               │
│ guestPhone               │
│ specialRequests          │
└──────────────────────────┘
```

**Relationships:**
- `Hotel` has many `Rooms` (CASCADE DELETE)
- `User` has many `Bookings` (CASCADE DELETE)
- `Room` has many `Bookings`
- `Booking` has one `Payment` (CASCADE DELETE)
