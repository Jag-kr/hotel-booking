# Requirement Analysis Document
> Senior Full-Stack Developer Assignment (`ABI Technologies`) — Hotel Booking Application

## 1. Understanding of the Problem Statement

The goal is to design, implement, and deploy a complete full-stack hotel booking application (`MERN/PostgreSQL` Stack) that accurately mirrors the user experience and multi-step reservation flow of the reference site ([Trinity Suites Bangalore](https://hotels.eglobe-solutions.com/trinitysuites/booking/hotels/trinity-suites-bangalore-bangalore?checkIn=26-May-2026&nights=1#bookingsteps)).

Per the assignment specification, the application fulfills:
- **Complete Frontend, Backend, and Database Architecture**: Built from scratch with modular separation of concerns.
- **Guest Reservation Flow**: Real-time date and room search, 4-step interactive booking wizard (`Select Room → Guest Details → Review → Payment`), and simulated payment gateway modal with instant confirmation.
- **Mandatory Admin Management Screens**: A secured staff portal (`/admin`) featuring an analytical KPI dashboard, full reservation management (`PUT /status`), room directory CRUD (`Add/Edit/Delete`), and customer lifetime value metrics.
- **Production Cloud Deployment**: Fully hosted online with public endpoints accessible for evaluation.
- **AI Tool Usage Declaration**: Transparently documented in accordance with assignment guidelines.

---

## 2. Key Assumptions Made During Implementation

| # | Assumption | Reason |
|---|---|---|
| 1 | **PostgreSQL instead of MongoDB** | Relational data (`bookings → rooms → hotels → payments`) benefits greatly from foreign keys, constraints, and JOIN queries. The schema requirements map naturally to relational tables (`Sequelize ORM`). The assignment spec recommended MERN but allowed full stack flexibility (`"Candidates are free to use any technology stack/framework"`). |
| 2 | **Single hotel (`Trinity Suites Bangalore`)** | The reference URL shows a single-hotel booking flow. We model one hotel with multiple room categories (`Standard`, `Deluxe`, `Executive Suite`). |
| 3 | **Simulated Payment Gateway** | The assignment explicitly specifies *"Payment gateway can be implemented as a dummy/mock flow"*. An interactive modal that mirrors Razorpay/credit card processing with live visual validation was built. |
| 4 | **Isolated Admin Auth (`/admin/login`)** | A dedicated authentication portal with role-based JWT validation (`role === 'admin'`) isolates staff operations from public guest checkout. |
| 5 | **Automated Boot Seeding (`seedDatabase()`)** | To ensure reviewers immediately experience a rich, populated environment without running CLI commands, the server auto-seeds realistic rooms, bookings, and customer profiles on first boot. |
| 6 | **Cloud-Native Live Deployment** | The full-stack system is deployed across **Vercel** (`Frontend SPA`), **Render** (`REST API Web Service`), and **Neon Serverless PostgreSQL** (`Cloud Database`). |
| 7 | **Dynamic Date-Range Availability** | A room is dynamically excluded from search results (`Op.or` SQL overlap filtering) if any existing confirmed or pending reservation overlaps with the requested stay dates. |
| 8 | **AI Tools Usage Declaration** | Developed with assistance from **Google Antigravity AI (Gemini)** for architecture scaffolding, styling generation, and comprehensive documentation in compliance with assignment guidelines. All code was reviewed, validated, and executed by the candidate. |

---

## 3. Clarification Questions Resolved

| Question | Resolution |
|---|---|
| How many hotels should be supported? | One hotel (Trinity Suites) with multiple room types. |
| Is payment a real integration? | No. Dummy/mock modal flow confirmed. |
| What counts as "admin"? | A seeded admin user (`admin@hotelbooking.com`) with role-based JWT middleware. |
| Is auth required for booking? | No. To streamline guest reservations and match reference hotel flows, checkout (`POST /api/bookings`) and payment (`POST /api/payments`) are public. Guests can check and cancel bookings via `/manage-booking` using their Ref Number & Email. |
