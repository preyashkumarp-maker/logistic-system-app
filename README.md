# Logistics Tracking System

A production-ready MVP mobile app for parcel/logistics management, built with **Expo (React Native + TypeScript)** and **Firebase**. It includes authentication, parcel & driver CRUD, live GPS tracking, a tracking map, a tracking timeline, and a modern dashboard.

> No custom backend server is used — Firebase (Auth, Firestore, Storage) is the entire backend.

---

## 1. Project Overview

Logistics Tracking System lets a dispatcher/admin:

- Sign up / log in with Firebase Authentication.
- Create, view, search, filter, edit, and delete **parcels**.
- Create, view, edit, and delete **drivers**, and assign a driver to a parcel.
- Track a parcel live on a map, powered by GPS updates written to Firestore.
- View a chronological **tracking timeline** of status changes.
- View a dashboard with parcel/driver counters and recent activity.

## 2. Requirements

- Node.js 20+ and npm
- The [Expo Go](https://expo.dev/go) app (for quick testing on a physical device) or an Android/iOS simulator
- A free [Firebase](https://console.firebase.google.com/) project

## 3. Installation

```bash
npm install
```

Install the Expo-managed native packages used for maps/location (already declared in `package.json`, run this if you ever need to reinstall/align versions):

```bash
npx expo install expo-location react-native-maps expo-device firebase
```

## 4. Firebase Project Creation

1. Go to the [Firebase console](https://console.firebase.google.com/) → **Add project**.
2. Give it a name and finish the wizard (Google Analytics is optional).
3. In **Project settings → General**, add a **Web app** to obtain your Firebase config values (`apiKey`, `authDomain`, etc.).

## 5. Firebase Authentication Setup

1. In the Firebase console, open **Build → Authentication → Get started**.
2. Enable the **Email/Password** sign-in provider.

## 6. Firestore Setup

1. Open **Build → Firestore Database → Create database**.
2. Start in **production mode** (rules are provided in [`firestore.rules`](./firestore.rules)).
3. Pick a region close to your users.

## 7. Firebase Storage Setup

1. Open **Build → Storage → Get started** (used for optional parcel/document images via `firebase/storage.ts`).
2. Accept the default security rules for now, or restrict to authenticated users only.

## 8. Environment Variables

Copy `.env.example` to `.env` and fill in the values from your Firebase web app config:

```bash
cp .env.example .env
```

```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=

EXPO_PUBLIC_TRACKING_UPDATE_INTERVAL_MS=15000
EXPO_PUBLIC_TRACKING_DISTANCE_FILTER=25
```

`EXPO_PUBLIC_TRACKING_UPDATE_INTERVAL_MS` / `EXPO_PUBLIC_TRACKING_DISTANCE_FILTER` throttle how often GPS updates are written to Firestore (time in ms / distance in meters), so the app does not write on every GPS tick.

**Never commit `.env`** — it is already listed in `.gitignore`. Only `.env.example` (with placeholder values) should be committed.

## 9. Firestore Collections

| Collection | Description |
|---|---|
| `users/{userId}` | `{ id, name, email, phone, role: "admin" \| "driver" \| "user", createdAt, updatedAt }` |
| `drivers/{driverId}` | `{ id, name, phone, email, vehicleNumber, vehicleType, status, currentLocation, createdAt, updatedAt }` |
| `parcels/{parcelId}` | `{ id, trackingNumber, senderName, senderPhone, receiverName, receiverPhone, pickupAddress, deliveryAddress, packageType, packageWeight, status, driverId, currentLocation, createdAt, updatedAt, estimatedDeliveryDate }` |
| `parcelTracking/{parcelId}/events/{eventId}` | `{ status, latitude, longitude, timestamp, updatedBy }` — append-only tracking history used for the timeline |

Parcel statuses: `CREATED → PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED` (or `CANCELLED`).
Driver statuses: `AVAILABLE`, `ON_DELIVERY`, `OFFLINE`.

## 10. Firestore Security Rules

See [`firestore.rules`](./firestore.rules) for the full rules. Summary:

- Any signed-in user can **read** `parcels` and `drivers` (dashboard/list access).
- Only users with `role: "admin"` (in their `users/{uid}` document) can **create/update/delete** parcels and drivers.
- A **driver** account (where `drivers/{uid}` doc id equals their auth uid) may update **only** the `currentLocation`, `status`, and `updatedAt` fields — and only on their own driver document, or on a parcel where `driverId == request.auth.uid`. This is what powers self-service live location updates without letting drivers edit arbitrary logistics data.
- Users can read/update only their own `users/{uid}` profile; admins can manage any profile.

Deploy the rules with the Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

(Requires a `firebase.json` / `firebase init firestore` pointing at `firestore.rules` — or simply paste the file's contents into the Firestore console's Rules tab.)

## 11. Expo Setup

This project uses [Expo Router](https://docs.expo.dev/router/introduction/) with the **top-level `app/` directory** as the router root (no `src/` directory is used). File-based routes:

```
app/
├── _layout.tsx            # Root stack + SafeAreaProvider
├── index.tsx               # Redirects to /dashboard or /login based on auth state
├── (auth)/                 # Public auth routes
│   ├── login.tsx
│   └── register.tsx
└── (app)/                  # Protected tab routes
    ├── dashboard.tsx
    ├── profile.tsx
    ├── parcels/{index,create,[id],edit}.tsx
    ├── drivers/{index,create,[id],edit}.tsx
    └── tracking/[id].tsx
```

## 12. Map Setup

- Uses [`react-native-maps`](https://github.com/react-native-maps/react-native-maps) via the reusable `components/tracking/TrackingMap.tsx`.
- Works out of the box in **Expo Go** for quick testing (iOS uses Apple Maps, Android uses Google Maps bundled with Expo Go).
- For a **production/standalone build**, add your own Google Maps API key under `app.json → expo.android.config.googleMaps.apiKey` (Android requires it; iOS does not).

## 13. Location Permission Setup

- Location permissions are configured via the `expo-location` config plugin in `app.json`, which sets the iOS `NSLocationWhenInUseUsageDescription` message and Android permissions automatically.
- At runtime, `services/trackingService.ts` calls `Location.requestForegroundPermissionsAsync()` before starting a live tracking session; if denied, the UI shows a friendly error instead of crashing.

## 14. Running the Application

```bash
npm install
npx expo start
```

From the Expo CLI output you can:

- Press `w` to open in a web browser.
- Press `a` / `i` to open an Android/iOS emulator (requires Android Studio / Xcode).
- Scan the QR code with the **Expo Go** app on a physical device.

## 15. Testing CRUD

1. Register a new account (Register screen) — this creates a `users/{uid}` document with `role: "admin"`.
2. From the Dashboard, tap **Create Parcel** or **Add Driver**.
3. Open the **Parcels** / **Drivers** tab to see the list update in real time (Firestore `onSnapshot` listeners).
4. Tap a card to view details, then **Edit** or **Delete** (delete asks for confirmation).
5. From the parcel **Edit** screen, assign a driver and change the status.

Optional: seed sample data (5 parcels, 3 drivers) after you have at least one admin account:

```bash
# In .env (or exported in your shell):
SEED_ADMIN_EMAIL=you@example.com
SEED_ADMIN_PASSWORD=yourpassword

npm run seed
```

## 16. Testing Live Tracking

1. Assign a driver to a parcel (Parcel → Edit → Assign Driver).
2. Open the parcel → **Track Parcel**.
3. Tap **Start Live Tracking**. This requests device location permission, then starts `Location.watchPositionAsync` with the configured time/distance filter, writing updates to both the parcel and the assigned driver's Firestore documents.
4. Move around (or use a simulator's location simulation) — the map marker and "Current Location" / "Last Updated" fields update automatically via real-time listeners.
5. Tap **Stop Live Tracking** to end the session (sets the driver back to `AVAILABLE`).

Every status change made from the parcel Edit screen also appends an entry to `parcelTracking/{parcelId}/events`, which renders in the **Tracking Timeline** on the tracking screen.

## 17. Testing on a Physical Device

1. Install **Expo Go** from the App Store / Play Store.
2. Run `npx expo start` and scan the QR code.
3. Grant location permission when prompted to test live tracking with real GPS movement.

> **Note:** Basic `expo-location` + `react-native-maps` functionality works in Expo Go. If you later add native modules that Expo Go doesn't support, you'll need an [EAS development build](https://docs.expo.dev/develop/development-builds/introduction/) — this project does not currently require one.

## 18. Production Build Instructions

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android
eas build --platform ios
```

Remember to:
- Set the production Firebase env vars as [EAS secrets](https://docs.expo.dev/build-reference/variables/) (`eas env:create`) since `.env` is not committed.
- Add a Google Maps API key for Android production builds (see [Map Setup](#12-map-setup)).

## 19. Troubleshooting

| Issue | Fix |
|---|---|
| `Unable to resolve module @/...` | Make sure there's no stray `src/` folder — Expo Router always prefers `src/app` over `app/` if both exist. This project intentionally keeps everything at the root. |
| Map is blank | Confirm you're testing on a real device/emulator with Google Play Services (Android) or check your Google Maps API key for production builds. |
| Location permission errors | Check `app.json`'s `expo-location` plugin config, and make sure you accepted the OS permission prompt. |
| Firestore `permission-denied` errors | Verify your `users/{uid}` document has the expected `role`, and that `firestore.rules` has been deployed. |
| Auth errors on login/register | The UI shows a generic "Login failed" / "Unable to create your account" message — check the Metro/console logs for the underlying Firebase error code during development. |

## 20. Tech Stack

- Expo SDK 57 / React Native 0.86 / React 19
- Expo Router (file-based navigation)
- Firebase JS SDK (modular, v9+ syntax) — Auth, Firestore, Storage
- `expo-location` + `react-native-maps` for GPS tracking and maps
- TypeScript throughout, no unnecessary dependencies

## 21. Project Structure

```
app/                    Expo Router screens (auth + protected tabs)
components/             Reusable UI: common/, parcel/, driver/, tracking/
firebase/               Firebase modular SDK setup: config, auth, firestore, storage
services/               Firestore/Auth business logic (authService, parcelService, driverService, trackingService)
hooks/                  useAuth, useParcels, useDrivers, useTracking
types/                  Shared TypeScript types
constants/              Colors, status maps, app config (tracking interval/distance filter)
utils/                  Validation, date formatting, tracking helpers
scripts/seed-data.js    Optional sample data seeding script
firestore.rules         Firestore security rules
```

