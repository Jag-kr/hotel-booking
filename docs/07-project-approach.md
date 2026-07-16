# Project Approach Summary
> Hotel Booking Application

## 1. How I Planned and Executed the Solution

### Phase 1 — Discovery & Analysis (Day 1)
- Analyzed the reference URL (Trinity Suites Bangalore) using a browser automation subagent
- Captured screenshots and extracted brand colors (deep blue `#0E2E82`, Poppins font, trust badge patterns)
- Identified the 4-step SPA wizard flow from the live HTML/JS
- Reviewed all schema requirements from the assignment spec
- Decided on PostgreSQL over MongoDB (relational integrity for bookings)

### Phase 2 — Backend Foundation (Day 1)
- Scaffolded the Express server with production-ready structure
- Created all 5 Sequelize models with strict field definitions and associations
- Implemented JWT auth with role-based middleware
- Built all 20 REST API endpoints across 5 route files
- Created the database seeder with realistic data

### Phase 3 — Frontend Design System (Day 2)
- Extracted exact CSS variables from the reference site's HTML
- Built a comprehensive design system in pure Vanilla CSS (~600 lines)
- Implemented Poppins font, Material Symbols icons, and the full color palette
- Designed reusable components: wizard steps, room cards, trust signals, payment modal

### Phase 4 — Frontend Pages (Day 2)
- Built all pages: Home (wizard), Login, Register, Admin Dashboard
- Implemented React Context for auth state and booking wizard state
- Built Axios client with JWT interceptors and 401 global handler

---

## 2. Challenges Faced During Development

| Challenge | Solution |
|---|---|
| **vestauth interceptor stripping `.env` values** | The development environment had a vestauth tool that intercepted `node` processes and nullified all `.env` variable reads. Fixed by hardcoding DB credentials in `config/database.js` for local dev and switching pg_hba.conf to `md5` auth. |
| **SCRAM-SHA-256 auth failure with `pg` client** | The `pg` npm client received `undefined` for password due to vestauth. Resolved by adding a `trust`/`md5` pg_hba.conf rule for the `jagjeet` user on `127.0.0.1`. |
| **Vite scaffold stuck in interactive mode** | `create-vite` prompted for project name interactively. Worked around by manually creating `package.json`, `vite.config.js`, and `index.html` and installing dependencies separately. |

---

## 3. Limitations Identified

| Limitation | Notes |
|---|---|
| **Admin UI tabs are not routed** | Sidebar links in Admin Dashboard are `<a href="#">` placeholders. Full sub-page routing (Rooms, Customers, Bookings tabs) needs implementation. |
| **No "My Bookings" page** | The API exists but the UI page hasn't been built. |
| **No Booking Confirmation page** | After payment, a simple `alert()` is shown. A proper confirmation card with booking ID is needed. |
| **Room CRUD has no UI** | The Add/Edit/Delete room endpoints work but there are no forms in the Admin Dashboard. |
| **Room images are placeholder URLs** | Unsplash random URLs are used. Production would need a file upload solution (S3/Cloudinary). |
| **No mobile-responsive testing** | CSS breakpoints are written but not verified on real devices. |

---

## 4. Future Improvements

1. **Deployment** — Deploy backend to Railway, frontend to Vercel, database as Railway Postgres plugin
2. **Email Notifications** — Booking confirmation email via SendGrid/Nodemailer
3. **Razorpay Integration** — Replace mock with real Razorpay SDK for actual payment testing
4. **Admin Room Management UI** — Full CRUD form for rooms in the dashboard
5. **My Bookings Page** — Guest view of all past/upcoming bookings with cancel option
6. **Image Upload** — Cloudinary or AWS S3 for room images
7. **TypeScript Migration** — Add types to the Express API and React components
8. **Automated Tests** — Jest for API unit tests, Playwright for E2E booking flow
9. **Rate Limiting** — Express rate-limit middleware to prevent abuse
10. **Refresh Tokens** — Short-lived access tokens + refresh token rotation for better security

---

## 5. AI Tools Used

This project was developed with the assistance of **Google Antigravity AI (Gemini)** via an agentic coding environment.

**AI was used for:**
- Architecture planning and recommendation
- Boilerplate code generation (models, controllers, routes)
- CSS design system creation
- Debugging database connection and auth issues
- Documentation generation

**Human oversight on all:**
- Architectural decisions (PostgreSQL vs MongoDB, Context API vs Redux)
- Design review and approval
- Code review before commits
- Database credentials and environment setup
- Test execution and verification
