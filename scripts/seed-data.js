/* eslint-disable no-console */
/**
 * Seeds sample data (3 drivers + 5 parcels) into Firestore for local testing.
 *
 * Usage:
 *   1. Register an admin account in the app (Register screen creates role: "admin").
 *   2. Set SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD to that account's credentials.
 *   3. Run: npm run seed
 */
const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

function loadEnvFile() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;

  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) return;
      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();
      if (key && !process.env[key]) process.env[key] = value;
    });
}

loadEnvFile();

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const SEED_EMAIL = process.env.SEED_ADMIN_EMAIL;
const SEED_PASSWORD = process.env.SEED_ADMIN_PASSWORD;

function generateTrackingNumber() {
  return `TRK-${Math.floor(10000 + Math.random() * 90000)}`;
}

const driverSeeds = [
  { name: 'Ravi Kumar', phone: '9876543210', email: 'ravi.driver@example.com', vehicleNumber: 'MH12AB1234', vehicleType: 'Van', status: 'AVAILABLE' },
  { name: 'Suresh Patil', phone: '9876543211', email: 'suresh.driver@example.com', vehicleNumber: 'MH14CD5678', vehicleType: 'Truck', status: 'ON_DELIVERY' },
  { name: 'Anita Shah', phone: '9876543212', email: 'anita.driver@example.com', vehicleNumber: 'MH04EF9012', vehicleType: 'Bike', status: 'OFFLINE' },
];

async function seed() {
  if (!SEED_EMAIL || !SEED_PASSWORD) {
    console.error('Missing SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD environment variables.');
    console.error('Register an admin account in the app first, then set these variables before running the seed script.');
    process.exit(1);
  }

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log('Signing in as seed admin account...');
  await signInWithEmailAndPassword(auth, SEED_EMAIL, SEED_PASSWORD);

  console.log('Seeding drivers...');
  const driverIds = [];
  for (const driver of driverSeeds) {
    const ref = await addDoc(collection(db, 'drivers'), {
      ...driver,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    driverIds.push(ref.id);
    console.log(`  created driver "${driver.name}" (${ref.id})`);
  }

  const parcelSeeds = [
    { senderName: 'Amit Traders', senderPhone: '9800000001', receiverName: 'Neha Verma', receiverPhone: '9800000011', pickupAddress: 'Andheri, Mumbai', deliveryAddress: 'Kothrud, Pune', packageType: 'Documents', packageWeight: '0.5 kg', status: 'CREATED' },
    { senderName: 'Global Electronics', senderPhone: '9800000002', receiverName: 'Rahul Singh', receiverPhone: '9800000012', pickupAddress: 'Whitefield, Bengaluru', deliveryAddress: 'HSR Layout, Bengaluru', packageType: 'Electronics', packageWeight: '3.2 kg', status: 'PICKED_UP', driverId: driverIds[0] },
    { senderName: 'Fashion Hub', senderPhone: '9800000003', receiverName: 'Priya Nair', receiverPhone: '9800000013', pickupAddress: 'Connaught Place, Delhi', deliveryAddress: 'Sector 62, Noida', packageType: 'Apparel', packageWeight: '1.1 kg', status: 'IN_TRANSIT', driverId: driverIds[1] },
    { senderName: 'Home Essentials', senderPhone: '9800000004', receiverName: 'Karan Mehta', receiverPhone: '9800000014', pickupAddress: 'Banjara Hills, Hyderabad', deliveryAddress: 'Gachibowli, Hyderabad', packageType: 'Home Goods', packageWeight: '5.0 kg', status: 'OUT_FOR_DELIVERY', driverId: driverIds[1] },
    { senderName: 'BookWorld', senderPhone: '9800000005', receiverName: 'Sanya Kapoor', receiverPhone: '9800000015', pickupAddress: 'Salt Lake, Kolkata', deliveryAddress: 'Park Street, Kolkata', packageType: 'Books', packageWeight: '2.0 kg', status: 'DELIVERED', driverId: driverIds[2] },
  ];

  console.log('Seeding parcels...');
  for (const parcel of parcelSeeds) {
    const ref = await addDoc(collection(db, 'parcels'), {
      ...parcel,
      trackingNumber: generateTrackingNumber(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      estimatedDeliveryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    });
    console.log(`  created parcel for "${parcel.receiverName}" (${ref.id})`);
  }

  console.log('Seed complete: 3 drivers and 5 parcels created.');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seeding failed:', error.message);
  process.exit(1);
});
