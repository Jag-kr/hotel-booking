# Requirement Analysis Document
> Hotel Booking Application — Trinity Suites Clone

## 1. Understanding of the Problem Statement

The goal is to build a full-stack hotel booking application that replicates the user experience of the reference site (Trinity Suites Bangalore). The application must allow:

- **Guests** to search for available rooms, view room details, complete a booking form, make a (dummy) payment, and receive a confirmation.
- **Admins** to manage the hotel's rooms, view all bookings, update booking statuses, and view customer information through a secured dashboard.

The system must be production-ready in design with clean, working frontend and backend code, even though the payment is simulated.

---

## 2. Key Assumptions Made During Implementation

| # | Assumption | Reason |
|---|---|---|
| 1 | **PostgreSQL instead of MongoDB** | Relational data (bookings → rooms → hotels → payments) benefits greatly from foreign keys, constraints, and JOIN queries. The schema requirements map naturally to relational tables. MongoDB was the spec recommendation but the tech stack was open. |
| 2 | **Single hotel (`Trinity Suites Bangalore`)** | The reference URL shows a single-hotel booking flow. We model one hotel with multiple room types. |
| 3 | **Razorpay is simulated** | The assignment explicitly states "dummy payment". A UI that mimics the Razorpay modal was built without an actual SDK integration. |
| 4 | **Admin login at `/admin/login`** | A separate route and endpoint was created for admin authentication to keep it isolated from the guest flow. |
| 5 | **Seed data for demo** | Since real hotel data was unavailable, realistic random seed data was generated for rooms (Deluxe, Suite, Premium), bookings, and customers. |
| 6 | **Local deployment first** | Per user instruction, the application is built and tested locally. Railway (backend) and Vercel (frontend) deployment configuration will be added before final submission. |
| 7 | **Room availability is date-based** | A room is considered "unavailable" if any confirmed/pending booking overlaps with the requested check-in and check-out dates. |
| 8 | **AI Tools Used** | This implementation was built with the assistance of **Google Antigravity AI (Gemini)** for code generation, architecture planning, debugging, and documentation. All code was reviewed and executed by the candidate. |

---

## 3. Clarification Questions Resolved

| Question | Resolution |
|---|---|
| How many hotels should be supported? | One hotel (Trinity Suites) with multiple room types. |
| Is payment a real integration? | No. Dummy/mock modal flow confirmed. |
| What counts as "admin"? | A seeded admin user (`admin@hotelbooking.com`) with role-based JWT middleware. |
| Is auth required for booking? | No. To streamline guest reservations and match reference hotel flows, checkout (`POST /api/bookings`) and payment (`POST /api/payments`) are public. Guests can check and cancel bookings via `/manage-booking` using their Ref Number & Email. |
