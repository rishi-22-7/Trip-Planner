# ✈️ Trip Planner — Full Stack MERN Application

> A complete, production-ready travel planning platform built with **MongoDB, Express.js, React, and Node.js**. Plan trips, track bookings, manage activities, monitor budgets, and explore curated destinations — all from one clean dashboard.

---

## 📸 UI Screenshots

### 🏠 Landing Page
![Home Page](./docs/screenshots/home.png)

### 📊 User Dashboard
![Dashboard](./docs/screenshots/dashboard.png)

### 🗺️ Trip Details (Bookings Tab)
![Trip Details](./docs/screenshots/trip-details.png)

### 🛡️ Admin Dashboard
![Admin Dashboard](./docs/screenshots/admin-dashboard.png)

---

## 📑 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Database Models](#-database-models)
- [Environment Variables](#-environment-variables)
- [Running Locally](#-running-locally)
- [Route Guards](#-route-guards)
- [Known Issues & Fixes](#-known-issues--fixes)

---

## 🌍 Project Overview

**Trip Planner** is a full-stack web application that helps users organise their travel from start to finish. After registering, a user can:

- Create and manage multiple trips with destination, dates, and budget
- Log hotel and transport bookings under each trip
- Plan day-wise activities with costs
- Track estimated vs. actual budget spend in real time
- Browse admin-curated destinations with itinerary templates
- View their complete trip history

Admins get a separate, protected dashboard to monitor the platform — viewing all users, all trips, managing destination cards, and publishing travel recommendations.

---

## ✨ Features

### 👤 User Features
| Feature | Description |
|---|---|
| **Authentication** | JWT-based register & login; session persisted in `localStorage` |
| **Dashboard** | Overview of all trips with stats (total trips, upcoming, total spent) |
| **Create Trip** | Multi-field form: name, destination, start/end date, estimated budget, currency |
| **Trip Details** | Tabbed view — Overview, Itinerary, Bookings, Activities, Budget |
| **Bookings** | Add Hotel or Transport (Flight / Train / Bus / Own Vehicle) bookings with full details |
| **Activities** | Log activities per trip with date, location, description, and actual cost |
| **Budget Tracker** | Visual progress bar + breakdown of estimated vs. actual spend |
| **Trip History** | View all past trips in chronological order |
| **Destinations** | Browse admin-curated destinations with photos and itinerary previews |
| **User Profile** | Update name, email, profile picture (base64); change password |

### 🛡️ Admin Features
| Feature | Description |
|---|---|
| **Admin Dashboard** | Platform-level stats (total users, trips, destinations) |
| **User Management** | View all registered users with role and trip count |
| **Trip Management** | View all trips across all users |
| **Destination CRUD** | Create, edit, and delete destination cards with itinerary templates |
| **Recommendations** | Publish and manage travel recommendations for users |
| **Reports** | Platform activity reports |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 18+ | UI framework |
| **Vite** | 8.x | Build tool & dev server |
| **React Router DOM** | 7.x | Client-side routing |
| **Tailwind CSS** | 4.x | Utility-first styling |
| **Axios** | 1.x | HTTP client |
| **Lucide React** | 1.x | Icon library |
| **React Hot Toast** | 2.x | Toast notifications |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 18+ | Runtime |
| **Express** | 5.x | Web framework |
| **MongoDB** | Atlas | Database |
| **Mongoose** | 8.x | ODM |
| **bcryptjs** | 3.x | Password hashing |
| **jsonwebtoken** | 9.x | JWT auth tokens |
| **dotenv** | 17.x | Environment config |
| **cors** | 2.x | Cross-origin headers |
| **nodemon** | 3.x | Dev auto-restart |

---

## 📁 Project Structure

```
Full Stack Project/
├── client/                        # React frontend (Vite)
│   ├── index.html
│   ├── vite.config.js             # Vite config + API proxy
│   ├── package.json
│   └── src/
│       ├── main.jsx               # App entry point
│       ├── App.jsx                # Root component with providers
│       ├── routes.jsx             # Centralised route config + guards
│       ├── index.css              # Global styles & design tokens
│       │
│       ├── context/
│       │   ├── AuthContext.jsx    # Global auth state (login/logout/register)
│       │   └── TripContext.jsx    # Trip list state shared across pages
│       │
│       ├── pages/
│       │   ├── Home.jsx           # Public landing page
│       │   ├── Login.jsx          # Login form
│       │   ├── Register.jsx       # Registration form
│       │   ├── Dashboard.jsx      # User's trip list + stats
│       │   ├── CreateTrip.jsx     # Multi-step trip creation wizard
│       │   ├── TripDetails.jsx    # Tabbed trip detail view
│       │   ├── BookingPage.jsx    # Hotel & transport booking manager
│       │   ├── TripHistory.jsx    # Past trips timeline
│       │   ├── DestinationPage.jsx# Browse destinations
│       │   ├── UserProfile.jsx    # Profile & security settings
│       │   └── AdminDashboard.jsx # Admin control panel
│       │
│       ├── components/
│       │   ├── Navbar.jsx         # Responsive navigation bar
│       │   ├── Footer.jsx         # Site footer
│       │   ├── TripCard.jsx       # Trip summary card
│       │   ├── ActivityCard.jsx   # Activity item card
│       │   ├── BookingCard.jsx    # Booking item card
│       │   ├── DestinationCard.jsx# Destination preview card
│       │   ├── DestinationModal.jsx# Destination detail modal
│       │   └── admin/
│       │       ├── AdminUsers.jsx          # User list table
│       │       ├── AdminUserTrips.jsx      # Trips per user
│       │       ├── AdminDestinations.jsx   # Destination CRUD panel
│       │       ├── AdminRecommendations.jsx# Recommendations CRUD
│       │       ├── AdminReports.jsx        # Reports section
│       │       └── AdminPlatformContent.jsx# Platform content manager
│       │
│       ├── services/
│       │   ├── api.js             # Axios instance + interceptors (JWT inject, 401 redirect)
│       │   ├── authService.js     # login, register, updateProfile, changePassword
│       │   ├── tripService.js     # getTrips, createTrip, updateTrip, deleteTrip
│       │   ├── activityService.js # getActivities, createActivity, updateActivity, deleteActivity
│       │   ├── bookingService.js  # getBookings, createBooking, updateBooking, deleteBooking
│       │   ├── destinationService.js # getDestinations, getDestinationById
│       │   ├── tipsService.js     # (future) travel tips/recommendations
│       │   └── adminService.js    # Admin stats, users, trips, recommendations
│       │
│       └── utils/                 # Shared utility helpers
│
└── server/                        # Express backend (Node.js)
    ├── server.js                  # App entry point, middleware, routes
    ├── package.json
    ├── .env                       # Environment variables (not committed)
    │
    ├── config/
    │   ├── db.js                  # MongoDB connection via Mongoose
    │   └── jwtConfig.js           # JWT secret & expiry config
    │
    ├── models/
    │   ├── User.js                # User schema (name, email, password, role, profilePicture)
    │   ├── Trip.js                # Trip schema (userId, name, destination, dates, budget)
    │   ├── Activity.js            # Activity schema (tripId, name, date, location, cost)
    │   ├── Booking.js             # Booking schema (tripId, type, transportMode, dates, cost)
    │   ├── Destination.js         # Destination schema (name, description, imageUrl, itinerary[])
    │   └── Recommendation.js      # Recommendation schema
    │
    ├── controllers/
    │   ├── authController.js      # registerUser, loginUser, updateProfile
    │   ├── tripController.js      # getTrips, getTripById, createTrip, updateTrip, deleteTrip
    │   ├── activityController.js  # getActivitiesByTrip, createActivity, updateActivity, deleteActivity
    │   ├── bookingController.js   # getBookingsByTrip, createBooking, updateBooking, deleteBooking
    │   ├── destinationController.js # CRUD for destinations
    │   └── adminController.js     # getAdminStats, getAdminUsers, getAdminTrips, recommendations CRUD
    │
    ├── middleware/
    │   ├── authMiddleware.js      # protect (JWT verify), adminMiddleware (role check)
    │   └── errorMiddleware.js     # notFound & global error handler
    │
    ├── routes/
    │   ├── authRoutes.js          # /api/auth/*
    │   ├── tripRoutes.js          # /api/trips/*
    │   ├── activityRoutes.js      # /api/activities/*
    │   ├── bookingRoutes.js       # /api/bookings/*
    │   ├── destinationRoutes.js   # /api/destinations/*
    │   ├── adminRoutes.js         # /api/admin/* (admin-only)
    │   └── tipsRoutes.js          # /api/tips/*
    │
    └── utils/
        └── generateToken.js       # Signs a JWT with userId + role, expires in 7d
```

---

## 🔌 API Reference

All API responses follow a consistent envelope:
```json
{ "success": true, "data": { ... } }
{ "success": false, "message": "Error description" }
```

### Auth — `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ Public | Create a new user account |
| `POST` | `/api/auth/login` | ❌ Public | Login and receive a JWT |
| `PUT` | `/api/auth/profile` | ✅ Bearer | Update name, email, profilePicture |

### Trips — `/api/trips`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/trips` | ✅ Bearer | Get all trips for the logged-in user |
| `GET` | `/api/trips/:id` | ✅ Bearer | Get a single trip by ID |
| `POST` | `/api/trips` | ✅ Bearer | Create a new trip |
| `PUT` | `/api/trips/:id` | ✅ Bearer | Update a trip |
| `DELETE` | `/api/trips/:id` | ✅ Bearer | Delete a trip |

### Activities — `/api/activities`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/activities/trip/:tripId` | ✅ Bearer | Get all activities for a trip |
| `POST` | `/api/activities` | ✅ Bearer | Add an activity |
| `PUT` | `/api/activities/:id` | ✅ Bearer | Update an activity |
| `DELETE` | `/api/activities/:id` | ✅ Bearer | Delete an activity |

### Bookings — `/api/bookings`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/bookings/trip/:tripId` | ✅ Bearer | Get all bookings for a trip |
| `POST` | `/api/bookings` | ✅ Bearer | Add a booking (Hotel or Transport) |
| `PUT` | `/api/bookings/:id` | ✅ Bearer | Update a booking |
| `DELETE` | `/api/bookings/:id` | ✅ Bearer | Delete a booking |

### Destinations — `/api/destinations`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/destinations` | ❌ Public | Get all destinations |
| `GET` | `/api/destinations/:id` | ❌ Public | Get a single destination |
| `POST` | `/api/destinations` | ✅ Admin | Create a destination |
| `PUT` | `/api/destinations/:id` | ✅ Admin | Update a destination |
| `DELETE` | `/api/destinations/:id` | ✅ Admin | Delete a destination |

### Admin — `/api/admin` *(Admin only)*
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/stats` | Platform-level statistics |
| `GET` | `/api/admin/users` | List all registered users |
| `GET` | `/api/admin/trips` | List all trips on the platform |
| `GET` | `/api/admin/recommendations` | List all recommendations |
| `POST` | `/api/admin/recommendations` | Create a recommendation |
| `PUT` | `/api/admin/recommendations/:id` | Update a recommendation |
| `DELETE` | `/api/admin/recommendations/:id` | Delete a recommendation |

---

## 🗄️ Database Models

### User
```js
{
  name:           String (required),
  email:          String (required, unique, lowercase),
  password:       String (required, bcrypt-hashed),
  role:           "user" | "admin"  (default: "user"),
  profilePicture: String (base64 data URL, default: ""),
  timestamps:     true
}
```

### Trip
```js
{
  userId:          ObjectId → User (required),
  tripName:        String (required),
  destination:     String (required),
  startDate:       Date (required),
  endDate:         Date (required),
  estimatedBudget: Number (default: 0),
  actualBudget:    Number (default: 0),
  currency:        String (default: "INR"),
  timestamps:      true
}
```

### Activity
```js
{
  tripId:       ObjectId → Trip (required),
  activityName: String (required),
  activityDate: Date (required),
  location:     String (required),
  description:  String (default: ""),
  cost:         Number (default: 0, min: 0),
  timestamps:   true
}
```

### Booking
```js
{
  tripId:             ObjectId → Trip (required),
  bookingType:        "Hotel" | "Transport" (required),
  transportMode:      "Flight" | "Train" | "Bus" | "Own Vehicle" | "",
  bookingName:        String (required),
  // Hotel fields
  checkInDate:        Date,
  checkOutDate:       Date,
  // Flight-specific
  departureAirport:   String,
  arrivalAirport:     String,
  departureTime:      String,
  arrivalTime:        String,
  // General transport
  fromLocation:       String,
  toLocation:         String,
  travelDate:         Date,
  // Shared
  confirmationNumber: String,
  notes:              String,
  cost:               Number (default: 0),
  timestamps:         true
}
```

### Destination
```js
{
  destinationName: String (required),
  description:     String (required),
  imageUrl:        String (default: ""),
  itinerary: [{
    day:        Number,
    activities: [String]
  }],
  createdBy:       ObjectId → User (required),
  timestamps:      true
}
```

---

## 🔐 Environment Variables

Create a `.env` file inside the `server/` directory. **Never commit this file.**

```env
# ── Server ────────────────────────────────────────────────
PORT=5001

# ── MongoDB Atlas ─────────────────────────────────────────
# Replace <username>, <password>, and <cluster-url> with your Atlas credentials
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority

# ── JSON Web Token ────────────────────────────────────────
# Use a long, random, secret string. Never share this.
JWT_SECRET=your_super_secret_jwt_key_here
```

> **⚠️ macOS Port Conflict Warning**: macOS Ventura/Sonoma reserves **port 5000** for AirPlay Receiver. Use **port 5001** (or higher) for the backend to avoid 403 errors. Disable AirPlay Receiver in System Settings → General → AirDrop & Handoff, or simply keep `PORT=5001`.

---

## 🚀 Running Locally

### Prerequisites
- **Node.js** v18 or higher — [Download](https://nodejs.org/)
- **npm** v9 or higher (bundled with Node)
- A **MongoDB Atlas** account — [Sign up free](https://www.mongodb.com/atlas) *(or a local MongoDB instance)*

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/<your-username>/trip-planner.git
cd "trip-planner"
```

---

### Step 2 — Set Up the Backend

```bash
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Create your environment file
touch .env
```

Open `server/.env` and add the following (see [Environment Variables](#-environment-variables) for details):

```env
PORT=5001
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/tripplanner?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
```

Start the backend:

```bash
# Development (auto-restarts on file changes)
npm run dev

# Production
npm start
```

✅ You should see:
```
Server running on port 5001
MongoDB Connected: <your-cluster-host>
```

---

### Step 3 — Set Up the Frontend

Open a **new terminal tab/window**:

```bash
# Navigate to the client directory
cd client

# Install dependencies
npm install

# Start the Vite dev server
npm run dev
```

✅ You should see:
```
  VITE v8.x.x  ready in Xms

  ➜  Local:   http://localhost:5173/
```

---

### Step 4 — Open in Browser

Navigate to **[http://localhost:5173](http://localhost:5173)**

> The Vite dev server proxies all `/api/*` requests to `http://localhost:5001`, so no CORS issues during development.

---

### Creating an Admin Account

To access the Admin Dashboard, register a user normally and then manually set their role in MongoDB Atlas:

1. Go to your Atlas cluster → **Browse Collections** → `users` collection
2. Find your user document
3. Change `"role": "user"` → `"role": "admin"`
4. Log in again — you'll be redirected to `/admin/dashboard`

Alternatively, use the register endpoint and pass `"role": "admin"` in the request body (the controller accepts this during registration).

---

## 🔒 Route Guards

The frontend enforces three levels of access control:

| Guard | Behaviour |
|---|---|
| **PublicOnlyRoute** | Redirects authenticated users away from `/`, `/login`, `/register` → to `/trips` (or `/admin/dashboard` for admins) |
| **ProtectedRoute** | Redirects unauthenticated visitors to `/login` |
| **AdminRoute** | Redirects non-admin users to `/trips`; redirects unauthenticated users to `/` |

Token validity is not re-verified on every route change — if the JWT is expired, the first API call will return `401` and the `api.js` interceptor will clear `localStorage` and redirect to `/login`.

---

## ⚠️ Known Issues & Fixes

### 403 Forbidden on `POST /api/auth/login`

**Cause**: macOS Ventura/Sonoma reserves port 5000 for **AirPlay Receiver**. When the Express server isn't running, Vite proxies `/api` to the macOS service, which rejects the request with 403.

**Fix (Option A — Recommended)**: Use port 5001 in `.env`:
```env
PORT=5001
```
And update `vite.config.js`:
```js
proxy: {
  '/api': { target: 'http://localhost:5001', changeOrigin: true },
}
```

**Fix (Option B)**: Disable AirPlay Receiver:
> System Settings → General → AirDrop & Handoff → **AirPlay Receiver → Off**

---

## 📄 License

This project is open source and available under the [ISC License](./server/package.json).

---

<div align="center">
  Built with ❤️ using the MERN stack
</div>
