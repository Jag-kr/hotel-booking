# Validation & Testing Checklist
> Hotel Booking Application

## 1. Backend Validation Rules

### Auth
| Rule | Implemented | Details |
|---|---|---|
| Email must be unique | ✅ | `findOne` check before creating user |
| Password is hashed | ✅ | `bcryptjs` with salt rounds 12 |
| JWT must be present on protected routes | ✅ | `authenticate` middleware |
| Admin-only routes reject non-admin JWT | ✅ | `adminOnly` middleware checks `role === 'admin'` |
| Invalid JWT returns 401 | ✅ | `jwt.verify` wrapped in try/catch |

### Rooms
| Rule | Implemented | Details |
|---|---|---|
| Room existence check before booking | ✅ | `Room.findByPk()` returns 404 if missing |
| Room under maintenance can't be booked | ✅ | Status check in `createBooking` |
| Admin-only room creation/update/delete | ✅ | `authenticate + adminOnly` on routes |

### Bookings
| Rule | Implemented | Details |
|---|---|---|
| Date overlap check | ✅ | SQL `Op.or` with 3-condition overlap detection |
| Total amount calculated server-side | ✅ | Price × nights computed in controller |
| User can only view/cancel own bookings | ✅ | `booking.userId !== req.user.id` check |
| Admin can see/update any booking | ✅ | Admin bypass in ownership check |
| Can't cancel an already-cancelled booking | ✅ | Status check before update |

### Payments
| Rule | Implemented | Details |
|---|---|---|
| Can't pay for an already-paid booking | ✅ | `paymentStatus === 'Paid'` check |
| Only booking owner can trigger payment | ✅ | `booking.userId !== req.user.id` check |
| Transaction ID is unique | ✅ | Generated with `Date.now() + random` |

---

## 2. Frontend Validation

| Rule | Implemented | Notes |
|---|---|---|
| Email format validation | 🟡 | Browser `type="email"` only; no regex |
| Phone format validation | 🟡 | Browser `type="tel"` only |
| All required booking fields checked | ✅ | HTML `required` on all form inputs |
| Card number max 16 digits | ✅ | `maxLength="16"` |
| CVV max 3 digits | ✅ | `maxLength="3"` |
| 401 auto-redirect to login | ✅ | Axios interceptor global handler |

---

## 3. Sample Test Scenarios

### User Flow
| # | Scenario | Expected Result |
|---|---|---|
| 1 | Register with new email | Creates account, logs in, redirects home |
| 2 | Register with duplicate email | Returns `409 Email already registered.` |
| 3 | Login with wrong password | Returns `401 Invalid email or password.` |
| 4 | Browse rooms without login | Rooms visible (public GET) |
| 5 | Attempt booking without login | Redirected to `/login` |
| 6 | Select room → fill details → confirm → pay | Booking created, payment success, confirmation shown |
| 7 | Select dates with no available rooms | Shows "No rooms available" message |
| 8 | Try to book an already-booked room | Returns `409 Room is not available` |

### Admin Flow
| # | Scenario | Expected Result |
|---|---|---|
| 9 | Login as `admin@hotelbooking.com` | JWT with `role: 'admin'`, redirected to dashboard |
| 10 | View dashboard stats | Correct counts and revenue shown |
| 11 | View all bookings | Paginated list with guest info and status badges |
| 12 | Update booking status to Cancelled | Booking record updated, badge changes |
| 13 | Non-admin user hits `/api/admin/stats` | Returns `403 Access denied. Admins only.` |
| 14 | View customer list | All users with booking count and spend |

---

## 4. Key User Flows Tested

- [x] Registration → Login → Room search → Booking → Payment → (Confirmation)
- [x] Admin login → Dashboard stats loaded → Booking table rendered
- [x] Attempting double booking on same room/dates → Conflict detected
- [x] Token expiry → Auto redirect to login (via Axios interceptor)
- [x] Admin CRUD on rooms (via API — UI pending)
