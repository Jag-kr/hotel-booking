# Feature Scope Document
> Hotel Booking Application

## Features Implemented ✅

### Guest Booking Flow
- [x] Date search (Check-in, Check-out, Guests)
- [x] Room availability filtering (excludes rooms booked on overlapping dates)
- [x] 4-step booking wizard (Select Room → Guest Details → Review → Payment)
- [x] Guest details form (Title, First/Last Name, Email, Phone, Special Requests)
- [x] Booking summary sidebar (dates, nights, total price)
- [x] Simulated Razorpay payment modal (credit card UI with live preview)
- [x] Mock payment success flow (generates transaction ID, updates booking/payment status)

### Authentication
- [x] Guest registration (name, email, phone, password)
- [x] Guest login with JWT
- [x] Admin-specific login endpoint (`/api/auth/admin/login`)
- [x] Role-based middleware (`authenticate`, `adminOnly`)
- [x] Protected routes on frontend (redirect to login if not authenticated)
- [x] JWT stored in localStorage, injected into all API calls

### Admin Dashboard
- [x] Dashboard statistics: Total Rooms, Available Rooms, Total Bookings, Revenue
- [x] All bookings table (guest name, email, room, dates, booking status, payment status)
- [x] Monthly booking and revenue stats (API — backend only)
- [x] Booking status breakdown by category (API — backend only)
- [x] Update booking status API (`PUT /admin/bookings/:id/status`)
- [x] Room CRUD APIs (Add, Edit, Delete rooms)
- [x] Customer list API with booking count and total spend

### Backend / API
- [x] Full RESTful API (20 endpoints)
- [x] Input validation and error handling on all routes
- [x] JWT authentication and authorization
- [x] Availability overlap detection (prevents double-booking)
- [x] Pagination on admin bookings (`?page=&limit=`)
- [x] Database seeding with realistic mock data

### Database
- [x] 5 well-defined tables with FK relationships
- [x] Cascade deletes (e.g., delete hotel → delete rooms)
- [x] Proper ENUM types for status fields
- [x] Sequelize associations and eager loading

---

## Features Intentionally Excluded ❌

| Feature | Reason |
|---|---|
| Real Razorpay/Stripe payment | Out of scope — assignment says "dummy payment" |
| Email notifications (booking confirmation) | Not in requirements |
| Multi-hotel support | Reference site is single-hotel; adds unnecessary complexity |
| Room image upload / file storage | No file hosting configured; placeholder URLs used |
| Ratings and reviews | Not in the original schema requirements |
| Coupon/discount codes | Not in requirements |
| Real-time availability updates (WebSocket) | Beyond the scope |
| Mobile app | Web-only requirement |
| Two-factor authentication | Not in requirements |

---

## Assumptions Taken Due to Missing Requirements

| Assumption | Impact |
|---|---|
| Room images use Unsplash placeholder URLs in seed data | Visual but not functional gap; easy to replace |
| Admin dashboard sidebar navigation uses interactive UI tabs (`Dashboard`, `Bookings`, `Rooms CRUD`, `Customers`) | Single-page admin experience; instant switching without full page reloads |
| Guest checkout is public (no mandatory user account registration) | Enables frictionless booking matching hotel standard practices; reservations lookup supported via `/manage-booking` with Reference ID & Email |
| Discount percent field on rooms drives automatic price calculation | Consistent pricing; not explicitly in spec but implied by reference site |
| Only one admin user seeded (`admin@hotelbooking.com`); no public admin registration endpoint | Admin accounts are provisioned manually; prevents unauthorized admin creation |
