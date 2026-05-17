# Fair Ride - Developer Documentation & Handoff Guide

Welcome to the **Fair Ride** developer guide. This document provides a comprehensive overview of the application's architecture, core functionalities, local setup process, and deployment strategies. It is designed to act as a complete manual for any new developer taking over, modifying, or scaling the platform.

---

## 1. Application Overview

**Fair Ride** is a modern, mobile-first web application designed to be India's smartest ride fare aggregator. It solves the problem of price disparity among ride-hailing services by providing real-time fare comparisons and offering a community-driven ride-pooling feature.

### Core Value Propositions:
1. **Fare Aggregation:** Compares prices across major providers (Ola, Uber, Rapido, Namma Yatri, Bharat Taxi) based on distance and vehicle type (Bike, Auto, Cab).
2. **Direct Deep-Linking:** Instead of handling the actual dispatch, the app generates intent-based deep links to redirect the user to the specific provider's app (e.g., opening the Uber app with the pickup and drop-off coordinates pre-filled).
3. **Ride Pooling (Offer a Ride):** A peer-to-peer carpooling system where users can offer empty seats in their personal vehicles, and other users can book them.

---

## 2. Technology Stack

This application is built using a modern, serverless Javascript stack:

*   **Frontend Framework:** React 19 (via Vite)
*   **Styling:** Vanilla CSS with CSS Variables for a dynamic, mobile-optimized UI. (Includes Lucide React for iconography).
*   **Routing:** Conditional rendering based on state (Single Page App style without a heavy router like react-router, keeping it lightweight).
*   **Maps & Geocoding:** Leaflet & React-Leaflet for interactive maps. Nominatim OpenStreetMap API for free Geocoding (Address to Lat/Lng conversion).
*   **Backend API (Serverless):** Node.js / Express.js wrapped in `serverless-http`. Hosted on **Netlify Functions**.
*   **Database:** Supabase (PostgreSQL). The backend communicates with Supabase via its REST API.
*   **Authentication:** Custom JWT-based authentication using `bcryptjs` for password hashing, stored in Supabase.
*   **Mobile Wrapper (Optional):** Capacitor JS is configured to easily wrap this web app into a native Android APK (`android/` folder).

---

## 3. Project Structure

```text
fair_ride/comparify/
│
├── api/                  # Express app logic (used by Netlify Functions)
│   └── index.js          # Main Express router, Auth, and Supabase REST calls
├── functions/            # Netlify Serverless Functions wrapper
│   └── api.js            # Wraps the Express app using serverless-http
│
├── public/               # Static assets (Favicons, logos)
│
├── src/                  # React Frontend Source Code
│   ├── components/       # Reusable UI components (FareComparisonGrid, Header, MapSelector)
│   ├── pages/            # Main views (Home, OfferRide, AdminDashboard, LoginPage)
│   ├── services/         # External API integrations (geocoding.js for Nominatim)
│   ├── utils/            # Helper functions and State Stores
│   │   ├── authStore.js  # Manages JWT tokens, Login, Registration
│   │   ├── deepLinks.js  # Logic for generating intent URLs for Uber/Ola/etc.
│   │   ├── poolStore.js  # Local state manager for the Ride Pooling feature
│   │   └── pricingEngine.js # Distance calculation and dynamic fare generation
│   │
│   ├── App.jsx           # Root application component and state router
│   ├── index.css         # Global styles and design system variables
│   └── main.jsx          # React DOM mounting point
│
├── .gitignore            # Excludes node_modules, .env, etc.
├── netlify.toml          # Crucial configuration for Netlify deployment and API routing
├── package.json          # Dependencies and npm scripts
└── vite.config.js        # Vite build configuration
```

---

## 4. Key Implementation Details

### A. Dynamic Pricing Engine (`pricingEngine.js`)
Since third-party ride apps do not provide free public APIs for live pricing, the app uses a **Distance-Based Algorithmic Simulator**. 
1. It calculates the straight-line distance between the Pickup and Drop-off coordinates using the Haversine formula.
2. It multiplies the distance by a provider-specific Base Fare and Per-KM rate to generate a highly accurate estimation.
3. **Admin Gating:** Certain providers (like Namma Yatri) are gated. They only appear in the comparison grid if an Admin has entered a valid API Key in the `AdminDashboard`.

### B. Deep Linking (`deepLinks.js`)
When a user clicks "Confirm Ride", the app constructs a specific URI scheme.
*   *Example Uber Link:* `uber://?client_id=YOUR_CLIENT_ID&action=setPickup&pickup[latitude]=...&dropoff[latitude]=...`
*   If the user is on mobile and has the app installed, it opens natively.

### C. Serverless Backend (`functions/api.js` & `api/index.js`)
To avoid cold-start timeouts and connection pooling issues with standard Postgres connections on serverless environments, the backend does **not** use raw SQL connections. Instead, it uses standard `fetch()` requests to communicate with the **Supabase REST API**.
*   **Security:** `jwt` is issued upon login. The backend validates this token (though in the current lightweight iteration, frontend handles most routing security).
*   **Netlify Redirects:** The `netlify.toml` file redirects all traffic from `/api/*` to the serverless function `/.netlify/functions/api`.

---

## 5. Database Schema (Supabase)

To replicate this project, you need a Supabase project with the following tables:

1.  **`users`**
    *   `id` (uuid, primary key)
    *   `name` (text)
    *   `email` (text, unique)
    *   `password` (text - hashed)
    *   `role` (text - 'user' or 'admin')
2.  **`rides`** (For the carpooling feature)
    *   `id` (uuid)
    *   `driver_id` (uuid, foreign key to users.id)
    *   `driver_name` (text)
    *   `pickup` (text)
    *   `dropoff` (text)
    *   `price` (numeric)
    *   `seats` (integer)
    *   `status` (text - 'active' or 'completed')
3.  **`bookings`**
    *   `id` (uuid)
    *   `ride_id` (uuid, fk to rides)
    *   `passenger_id` (uuid, fk to users)
    *   `status` (text)
4.  **`messages`** & **`reviews`** (For peer-to-peer communication and trust rating).

---

## 6. Local Setup Instructions

Follow these steps to run the application on your local machine:

1.  **Install Node.js:** Ensure Node.js (v18+) is installed.
2.  **Clone & Install:**
    ```bash
    git clone <repository_url>
    cd fair_ride/comparify
    npm install
    ```
3.  **Environment Variables:** Create a `.env` file in the root directory (this file is ignored by Git for security).
    ```env
    VITE_SUPABASE_URL=https://your-project-id.supabase.co
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
    JWT_SECRET=your_secure_jwt_secret_string
    ```
4.  **Start Development Server:**
    ```bash
    npm run dev
    ```
    The frontend will run on `http://localhost:5173`. 
    *(Note: For full backend testing locally, you can use `netlify dev` if the Netlify CLI is installed, which simulates the serverless functions locally).*

---

## 7. Deployment Guide (Netlify)

The application is heavily optimized for **Netlify** deployment.

1.  **Connect to Netlify:**
    *   Log into Netlify and click "Add new site" -> "Import an existing project".
    *   Connect your GitHub repository.
2.  **Build Settings:**
    *   **Build command:** `npm run build`
    *   **Publish directory:** `dist`
    *   *Note: Netlify will automatically detect the `netlify.toml` file which configures the serverless functions.*
3.  **Environment Variables:**
    *   In the Netlify Dashboard, navigate to **Site configuration** -> **Environment variables**.
    *   Add the following keys exactly as they appear:
        *   `SUPABASE_URL` : (Your Supabase URL)
        *   `SUPABASE_ANON_KEY` : (Your Supabase Anon/Public Key)
        *   `JWT_SECRET` : (A secure random string)
4.  **Deploy:**
    *   Trigger a manual deploy. The site will build the React app and package the Node.js Express app into AWS Lambda functions automatically.

### Common Deployment Issues to Watch For:
*   **"Exposed Secrets" Error:** Never commit the `.env` file to GitHub. If you do, Netlify's security scanner will block the build.
*   **API 404 Errors:** Ensure the `netlify.toml` file correctly maps `[[redirects]]` from `/api/*` to `/.netlify/functions/api/:splat`.
*   **Blank Screen on Mobile:** The app previously used a Service Worker (PWA) which caused aggressive caching issues. This has been removed. If re-implementing PWA features, ensure proper cache-busting strategies are used.

---

## 8. Future Roadmap & Scaling

If you are a new developer taking over this project, here are the recommended next steps for scaling:

1.  **Live API Integration:** Replace the distance-based `pricingEngine.js` with real API calls to Uber/Ola/Rapido if official enterprise partnerships are secured.
2.  **Google Maps API:** Replace the free Nominatim API with Google Places API for faster, more robust location autocomplete (Nominatim has a strict 1 request/second limit which causes lag during rapid typing).
3.  **Payment Gateway:** Integrate Razorpay or Stripe into the "Offer a Ride" feature to hold funds in escrow until the ride is completed.
4.  **Push Notifications:** Implement Firebase Cloud Messaging (FCM) to replace the current localized polling/state-based notification system (`useNotifications.js`).
5.  **Native App Publishing:** Use the existing Capacitor setup (`android/` folder) to build an `.aab` file and publish directly to the Google Play Store.

---
*Document prepared for handoff and future maintenance.*
