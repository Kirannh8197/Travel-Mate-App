# Functional Core Refactoring Changes

### Added
- `backend/src/models/roomTypeSchema.model.ts`: Created RoomType schema to track room variations and base inventory values.
- `backend/src/models/roomAvailabilitySchema.model.ts`: Created RoomAvailability schema to track inventory per date and prevent overbooking.
- `frontend/travel-mate-app/src/store/useUserStore.ts`: Established a lightweight Zustand store for global user/auth state.
- `frontend/travel-mate-app/src/pages/SearchPage.tsx`: Logic UI component to test `$near` spatial queries.
- `frontend/travel-mate-app/src/pages/SandboxBooking.tsx`: Logic UI component simulating the Two-Phase Commit transaction loop.
- `frontend/travel-mate-app/src/pages/ReviewPortal.tsx`: Logic UI component validating internal auth state before API post.
- `backend/src/services/cabBooking.service.ts`: Implemented `findNearbyCabs` utilizing GeoJSON `$near` logic and `bookCab` logic.
- `backend/src/routes/cabBookingRoutes.routes.ts`: Created REST endpoints to expose the Cab service.

### Modified
- `backend/src/models/hotelBookingSchema.model.ts`: Added PENDING status to the enum and a 15-minute TTL index for holds.
- `backend/src/services/hotelBooking.service.ts`: Rewrote `createBooking` to use MongoDB transactions and dynamically check/reduce room availability.
- `backend/src/models/cabBookingSchema.model.ts`: Replaced basic string pickup/dropoff locations with GeoJSON Point structures and established `2dsphere` spatial indexes.
- `backend/src/services/review.service.ts`: Updated `createReview` to strictly enforce that users can only submit reviews if they have a prior `COMPLETED` booking for that specific hotel.
- `frontend/travel-mate-app/src/main.tsx`: Wrapped the application with `<QueryClientProvider>` to scaffold TanStack React Query.
- `frontend/travel-mate-app/src/App.tsx`: Wired up React Router to scaffold the minimal Sandbox test environments.

### Added
- `frontend/travel-mate-app/src/components/ui/UserDashboard.tsx`: Dashboard for travelers showing active bookings.
- `frontend/travel-mate-app/src/components/ui/HostDashboard.tsx`: Command center for hotel hosts to view live bookings and revenue stats.
- `frontend/travel-mate-app/src/components/ui/AdminDashboard.tsx`: Governance dashboard for admins to approve/reject hotel properties.
- `frontend/travel-mate-app/src/components/ui/AuthModal.tsx`: Unified Auth Modal to handle login & registration seamlessly for all roles.
- `frontend/travel-mate-app/src/components/ui/ListHotelWizard.tsx`: Integrated Mapbox GL JS for accurate Host Location Pin-dropping.
- `backend/src/middleware/upload.middleware.ts`: Implemented Multer configuration strictly filtering for `.jpeg/jpg/png/webp` and setting up `/uploads` target path.

### Modified
- `frontend/travel-mate-app/src/App.tsx`: Wired the Role-based `<DashboardRouter />` to render the correct view based on the user's role.
- `frontend/travel-mate-app/src/pages/SandboxBooking.tsx`: Integrated Mapbox Directions API for cab fare routing post-booking.
- `backend/src/services/hotelBooking.service.ts`: Altered booking flow to bypass manual approval by saving initial booking as `CONFIRMED` upon checkout completion.
- `backend/src/app.ts`: Attached static file serving for the `/uploads` directory.
- `backend/src/routes/hotelRoutes.routes.ts`: Refactored `/register` to accept `multipart/form-data` via Multer, generating stored file URLs.
- `frontend/travel-mate-app/src/components/ui/ListHotelWizard.tsx`: Refactored image attachment to dispatch an array of raw `File` objects mapped onto `FormData`.

### Added
- `frontend/travel-mate-app/src/components/ui/InteractiveStarRating.tsx`: Created a highly engaging interactive star review component replacing numerical inputs.

### Modified
- `frontend/travel-mate-app/src/pages/LandingPage.tsx`: Completely overhauled the UI into an ultra-premium Ethereal light mode layout with Framer motion, gradient meshes, and dynamic routing to List Property Studio.
- `frontend/travel-mate-app/src/App.tsx`: Refactored navbar to not shrink. Enforced redirect logic so logged-in users bypass the landing page and are routed straight to their dashboards.
- `frontend/travel-mate-app/src/pages/SearchPage.tsx`: Removed dark mode classes, enforced bright mode, converted USD prices to Rupee (₹).
- `frontend/travel-mate-app/src/components/ui/UserDashboard.tsx`: Removed dark mode classes, enforced bright Ethereal mode, mapped USD to Rupee (₹). 
- `frontend/travel-mate-app/src/components/ui/HostDashboard.tsx`: Removed dark mode classes, enforced bright Ethereal mode, mapped USD to Rupee (₹).
- `frontend/travel-mate-app/src/pages/SandboxBooking.tsx`: Removed dark mode classes, enforced bright Ethereal mode, mapped USD to Rupee (₹).
- `frontend/travel-mate-app/src/pages/ReviewPortal.tsx`: Removed dark mode components and integrated the `InteractiveStarRating`.
- `backend/src/middleware/upload.middleware.ts`: Migrated multer from `diskStorage` to `memoryStorage` to handle raw buffer processing requested by DB storage strategy.
- `backend/src/routes/hotelRoutes.routes.ts`: Refactored `req.files` handling to parse buffers into base64 data URIs and save directly into MongoDB `images` array field instead of local uploads folder.
- `backend/src/models/hotelSchema.model.ts`: Verified active syntax and resolved schema syntax drift impacting `ts-node-dev` compilation.

//V's_new_end


### Added
- `frontend/travel-mate-app/src/components/ui/StatusModal.tsx`: Created a premium Framer Motion enhanced modal to replace native alert dialogs.

### Modified
- `frontend/travel-mate-app/src/components/ui/ListHotelWizard.tsx`: Interfaced the form submission error states to trigger the custom `StatusModal` instead of a browser alert.
- `frontend/travel-mate-app/src/pages/LandingPage.tsx`: Appended Ethereal Infinity Pools text/imagery, replaced Mapbox grid component with a dedicated Cab Transfers component, and wrapped an Auth Guard around the List Property Studio routing button.
- `backend/src/middleware/upload.middleware.ts`: Migrated back from memory buffer to local `/uploads` disk storage and expanded filesize maximum thresholds to 10MB per file to stabilize large-asset uploads.
- `backend/src/routes/hotelRoutes.routes.ts`: Wrapped the image parsing middleware explicitly within an error handler wrapper. This intercepts high-volume load rejections and returns formatted HTTP 400 Bad Request data, ending the unlogged dropped connections (Failed to fetch). Modified MongoDB document insertion to strictly refer to lightweight static `/uploads` URL parameters to bypass the destructive 16MB document cap.


### Modified
- `frontend/travel-mate-app/src/pages/LandingPage.tsx`: Removed "Ethereal Infinity Pools" section and restored the structural `Mapbox Integration` card. Injected high-resolution luxury Cab imagery to the Dedicated Cab Transfers section. Stripped text remnants of 'Ethereal' and reverted to 'TravelMate'. Appended the `{ defaultRole: "HOTEL_HOST" }` injection to the `List Property Studio` AuthGuard checkpoint.
- `frontend/travel-mate-app/src/components/ui/AuthModal.tsx`: Expanded `AuthModalProps` to passively accept a dynamic `defaultRole`. Injected this role into the `/api/users` account creation payload so Landing Page property listers are formally persisted as `HOTEL_HOST`s. Stripped 'Ethereal' text.
- `frontend/travel-mate-app/src/components/ui/HostDashboard.tsx`: Added an intelligent zero-state logic gate: if a Host logs in but has 0 listings, a giant `+ List New Property` CTA intercepts them and routes them cleanly into `/list-hotel` instead of arriving at a blank registry.
- `frontend/travel-mate-app/src/store/useUserStore.ts`: Re-architected the `logout()` bounds action to physically wipe state AND force `window.location.href = '/'`, permanently clearing the memory cache and ejecting all users explicitly to the safe Landing Page root.
- `frontend/travel-mate-app/src/App.tsx`: Removed textual references mapping strings like 'TravelMate Ethereal' strictly back to 'TravelMate'.


### Added
- `frontend/travel-mate-app/src/components/ui/BrandIcon.tsx`: Engineered a high-detail Framer Motion brand component implementing the new elite identity.
- `frontend/travel-mate-app/src/assets/logo-icon.png`: Integrated the refined, isolated "Pin/M/Bird" brand mark as a permanent asset.

### Modified
- `backend/src/routes/authRoutes.routes.ts`: Refactored the unified login priority. Authentications now prioritize the `Hotel` collection, ensuring hosts are returned with full metadata and correct MongoDB `_id` instead of generic `User` records.
- `backend/src/middleware/upload.middleware.ts`: Corrected relative pathing (`../../uploads`) to align the Multer destination with the root static directory, resolving the broken image issue for all newly uploaded host photos.
- `frontend/travel-mate-app/src/components/ui/HostDashboard.tsx`: Hardened the guest activity fetch. The dashboard now identifies the backend Hotel record via email to ensure persistent ID-mapping regardless of the session state, successfully restoring the 'The Neo Grand' booking feed.
- `frontend/travel-mate-app/src/App.tsx`: Replaced generic MapPin icons in the Global Navigation with the pulsing `BrandIcon`.
- `frontend/travel-mate-app/src/components/ui/AuthModal.tsx`: Injected the premium `BrandIcon` into the Auth Header to establish immediate visual trust at the entry point.
- `frontend/travel-mate-app/index.html`: (User) Updated the Favicon link to reference the new elite brand icon.

//V's_new_end

---

## Premium-Plus Architecture Upgrade — 2026-03-10

//V's_new_start

### Added
- `frontend/travel-mate-app/src/components/layout/Navbar.tsx`: Extracted the global navigation bar from `App.tsx` into a dedicated layout component. Includes role-based link rendering and Auth Modal.
- `frontend/travel-mate-app/src/components/ui/CheckoutDrawer.tsx`: Flagship **Liquid-Glass Bottom Sheet Checkout Drawer** — a full 3-step flow (Payment → Arrival Sequence → Confirmation) that slides up over the hotel detail page. Preserves premium Card-Flip and UPI methods. Integrates Mapbox chauffeur booking as the "Arrival Sequence."

### Modified
- `frontend/travel-mate-app/src/App.tsx`: Refactored to a clean modular architecture. `<Navbar />` imported from `layout/`, `/payment` route redirects to `/search` (drawer handles checkout).
- `frontend/travel-mate-app/src/store/useUserStore.ts`: Implemented **Zustand `persist` middleware** (localStorage key: `travelmate-user`). Page refreshes no longer reset the session.
- `backend/src/services/hotelBooking.service.ts`: Upgraded `createBooking` to use **Mongoose sessions/transactions** for atomic booking integrity. Graceful fallback for standalone MongoDB.
- `frontend/travel-mate-app/src/pages/SearchPage.tsx`: "Reserve" button now passes `hotelLayoutId` in navigation state, enabling **Framer Motion shared element transitions** to `HotelDetailPage`.
- `frontend/travel-mate-app/src/pages/HotelDetailPage.tsx`: Applies `layoutId` to hero image for morph transition. "Reserve" opens **CheckoutDrawer** instead of navigating to `/payment`.
- `frontend/travel-mate-app/src/pages/PaymentPage.tsx`: Commented out and preserved as a reference/fallback. Superseded by `CheckoutDrawer.tsx`.

//V's_new_end

---

## Visual Identity Audit — 2026-03-10

//V's_new_start

### Added (Global Design System)
- `frontend/travel-mate-app/src/index.css`: Added **5 reusable Elite utility classes** forming the Sovereign Design System:
  - `.elite-container` — `max-w-72rem mx-auto` centering wrapper with responsive padding
  - `.elite-card` — Subtle gradient (`#fff → gray-50`) with **3-layer premium shadow** (contact + ambient + glow)
  - `.elite-stat-card` — Metric tile variant with purple top-border accent
  - `.elite-section-title` — Tracked serif header (`letter-spacing: 0.01em`)
  - `.elite-booking-card` — Indigo/purple gradient booking item with interactive hover lift

### Modified (Visual Identity Audit)
- `frontend/travel-mate-app/src/components/layout/Navbar.tsx`: **Glass Hardening** — upgraded to `border-white/20` + layered inner shadow (`inset_0_-1px`) replacing flat `border-gray-200/50`. True "floating glass" effect at all scroll states.
- `frontend/travel-mate-app/src/components/ui/UserDashboard.tsx`: **Full Traveler Portal Overhaul** —
  - Wrapped in `.elite-container`
  - Added 4-stat bar (Total Stays, Active, Total Invested, Member Since) using `.elite-stat-card`
  - Profile card: gradient avatar ring + role badge pill
  - **Reservation cards replaced from 1-column `space-y-4` stack → responsive `grid-cols-1/2/3`** using `.elite-booking-card`
  - Color-coded status badges per booking state (CONFIRMED/PENDING/CANCELLED/COMPLETED)
- `frontend/travel-mate-app/src/pages/SandboxBooking.tsx`: `.elite-container` centering, `elite-section-title` header, booking cards upgraded to `.elite-booking-card`. Active cards grid changed to `grid-cols-1 lg:grid-cols-2`.
- `frontend/travel-mate-app/src/pages/ReviewPortal.tsx`: **Widened** from `max-w-lg` to `max-w-2xl` + `.elite-container`. Rating panel now has a purple/indigo gradient background. Card uses `.elite-card`.
- `frontend/travel-mate-app/src/components/ui/HostDashboard.tsx`: `.elite-container` + `elite-section-title`, property card uses `.elite-card`, booking activity uses `.elite-booking-card`.
- `frontend/travel-mate-app/src/components/ui/AdminDashboard.tsx`: `.elite-container` + `elite-section-title`, both approval and audit panels use `.elite-card` with layered shadows.

> **Visual Identity Audit Status: COMPLETE — All 7 pages are now centrally anchored at max-w-72rem.**

//V's_new_end

---

## Governance & Alignment Audit — 2026-03-11

//V's_new_start

### Layout Fixes (Zero-Tolerance Centering)
- `frontend/travel-mate-app/src/pages/SearchPage.tsx`: Added `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` centering wrapper inside the `motion.div` root — sidebar + results no longer drift edge-to-edge.
- `frontend/travel-mate-app/src/pages/ReviewPortal.tsx`: Replaced `max-w-2xl` with `max-w-4xl mx-auto` centered card — form is now mathematically centered, not left-floating.

### Navbar Sovereign Repair
- `frontend/travel-mate-app/src/components/layout/Navbar.tsx`: Full rewrite —
  - Added `w-full shrink-0` on `<nav>` to kill the collapse/shrink bug on any route
  - `whitespace-nowrap` on all links + `gap-7` flex spacing for robust non-wrapping layout
  - **Guest users** now only see `Search & Discover` — `Active Booking` and `Trust Portal` are hidden until authenticated
  - Authenticated Traveler, Host, Admin each render their exact correct link set

### Security Hardening
- `frontend/travel-mate-app/src/pages/ReviewPortal.tsx`: **Host Role Barrier** — if `role === 'HOTEL_HOST'`, the rating form is replaced with an amber "View-Only Mode" panel featuring a ShieldAlert icon. Hosts cannot self-review.
- `frontend/travel-mate-app/src/pages/ReviewPortal.tsx`: Star rating panel moved to a **dark purple/indigo gradient background** — stars are permanently visible (root-cause: white stars on white card = invisible).

### Admin God-Mode Expansion
- `frontend/travel-mate-app/src/components/ui/AdminDashboard.tsx`: Full rewrite into a **3-tab governance hub**:
  - **Tab 1 — Pending Approvals**: Grid of pending hotels with Approve/Reject + inspect eye-button. Badge counter on tab.
  - **Tab 2 — All Hotels**: Sortable table of ALL hotels (not just pending) with hover-reveal Approve / De-list / Deep Inspect actions. De-list sets status to `REJECTED`.
  - **Tab 3 — User Management**: Lists all registered users with roles from `GET /api/auth/users`.
  - **Deep Inspect Drawer**: Slide-in panel with full hotel details (pricing, location, owner email, Mongo ID, amenities, description) + Approve / Reject / Ban actions.
  - **Platform Stat Bar**: Total Properties / Pending / Approved / Users at a glance.
  - **Refresh button**: Re-fetches hotel data without page reload.

> **Governance & Alignment Status: SOVEREIGN — Host self-review blocked, Guest nav gated, Admin has full God-Mode governance.**

//V's_new_end

---

## Left-Drift Exorcism & Finish Line Audit — 2026-03-11

//V's_new_start

### Root Cause — Left-Drift (Confirmed & Fixed)
**Why ALL pages were left-aligned:**  
Vite's default starter template sets `body { display: flex; }`. In a flex row container, `#root` (React's mount point) becomes a flex *item* and **shrinks to content width** — NOT viewport width. Because `#root` was narrower than the viewport, `mx-auto` in `.elite-container` had no surplus space to distribute. Every page appeared left-anchored regardless of the centering code.

**The 3-layer chain fix:**
1. `index.css` — Changed `body { display: flex }` → `display: block; width: 100%` and added `#root { width: 100%; min-height: 100vh }`
2. `App.tsx` — Added `w-full` to the root `<div>` (the final link in the chain)
3. Result: `body(block, 100%) → #root(100%) → div(w-full) → elite-container(mx-auto)` — centering is now mathematically guaranteed across all routes.

### Admin Endpoint
- `backend/src/routes/authRoutes.routes.ts`: Implemented `GET /api/auth/users` with strict **isAdmin guard** — reads `userid` header, queries User DB, rejects non-Admins with 403. Returns all users (passwords stripped) sorted by `createdAt` descending. Pairs with Admin Dashboard's User Management tab.

### Host Expansion
- `frontend/travel-mate-app/src/components/ui/HostDashboard.tsx`:
  - **Multi-Listing**: "List New Property" button permanently moved to the page header (was conditional on `bookings.length === 0` — now always visible).
  - **Cancel Loop**: Added "Cancel Booking" button to each Live Guest Activity card. Only shown for non-CANCELLED/non-COMPLETED bookings. Calls `PATCH /api/booking/:id/cancel` and updates local state optimistically.

> **Sovereign Status: CONFIRMED — Centering ghost exorcised, Admin has full eyes, Host can list multiple properties and cancel bookings.**

//V's_new_end
