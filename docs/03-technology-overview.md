# Technology & Solution Overview
> Hotel Booking Application

## 1. Technology Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend Framework** | React | 19.x |
| **Frontend Build Tool** | Vite | 6.x |
| **Client-side Routing** | React Router DOM | 7.x |
| **HTTP Client** | Axios | 1.x |
| **State Management** | React Context API | (built-in) |
| **Styling** | Vanilla CSS (custom design system) | — |
| **Backend Framework** | Node.js + Express | 22.x / 5.x |
| **ORM** | Sequelize | 6.x |
| **Database** | PostgreSQL | 16.x |
| **Authentication** | JSON Web Tokens (JWT) | via `jsonwebtoken` |
| **Password Hashing** | bcryptjs | 2.x |
| **Environment Config** | dotenv | 16.x |

---

## 2. Justification for Technology Choices

### PostgreSQL over MongoDB
The assignment recommended MongoDB, but we chose PostgreSQL for the following reasons:
- **Relational integrity**: Bookings reference Rooms and Users. Foreign keys with CASCADE DELETE prevent orphaned records.
- **ACID transactions**: Critical for payment processing — a booking and its payment must either both succeed or both fail.
- **Rich query language**: Availability overlap detection (date-range exclusions) is cleaner in SQL.
- **Sequelize ORM**: Provides model validation, migrations, and type safety that map naturally to the schema.

### Vanilla CSS over Tailwind
- Full control over the design token system (CSS variables for brand colors extracted from the reference site).
- No build-step dependency for class generation.
- Closer fidelity to the Trinity Suites reference site's actual CSS patterns.

### Vite over Create React App
- Significantly faster hot module reloading.
- Better TypeScript-ready and plugin ecosystem.
- API proxy support built-in (`/api` → `localhost:5000`).

### Context API over Redux
- The application state (auth user, booking wizard) is simple enough for Context.
- Avoids the boilerplate overhead of Redux for a project of this scope.

---

## 3. Overall Application Architecture

```
┌─────────────────────────────────────────────────────┐
│                  CLIENT (React + Vite)              │
│                                                     │
│  ┌──────────┐  ┌───────────┐  ┌────────────────┐   │
│  │ AuthCtx  │  │BookingCtx │  │  React Router  │   │
│  │ (JWT +   │  │ (wizard   │  │  (pages +      │   │
│  │  user)   │  │  state)   │  │   guards)      │   │
│  └──────────┘  └───────────┘  └────────────────┘   │
│                                                     │
│  ┌────────────────────────────────────────────┐     │
│  │              Axios API Client              │     │
│  │  JWT interceptor + 401 global handler      │     │
│  └───────────────────┬────────────────────────┘     │
└──────────────────────┼──────────────────────────────┘
                       │ REST/JSON
┌──────────────────────▼──────────────────────────────┐
│                EXPRESS API SERVER                   │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │           Route Layer                        │    │
│  │  /api/auth  /api/rooms  /api/bookings        │    │
│  │  /api/payments  /api/admin                   │    │
│  └──────────────────┬──────────────────────────┘    │
│                     │                               │
│  ┌──────────────────▼──────────────────────────┐    │
│  │        Middleware (JWT, adminOnly)           │    │
│  └──────────────────┬──────────────────────────┘    │
│                     │                               │
│  ┌──────────────────▼──────────────────────────┐    │
│  │   Controllers (auth, hotel, booking, admin) │    │
│  └──────────────────┬──────────────────────────┘    │
│                     │                               │
│  ┌──────────────────▼──────────────────────────┐    │
│  │   Sequelize ORM (Models + Associations)     │    │
│  └──────────────────┬──────────────────────────┘    │
└─────────────────────┼───────────────────────────────┘
                      │ pg driver
┌─────────────────────▼───────────────────────────────┐
│              PostgreSQL (hotel_booking)              │
│  users  hotels  rooms  bookings  payments            │
└──────────────────────────────────────────────────────┘
```
