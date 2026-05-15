/**
 * Fair Ride - Vercel Serverless Function
 * Backend using Supabase REST API via native fetch
 */
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'fairride_secret_2026';

// Helper to interact with Supabase REST API
async function supabaseFetch(table, method = 'GET', body = null, query = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}${query}`;
  const options = {
    method,
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': method === 'POST' ? 'return=representation' : undefined
    }
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase error: ${res.status} ${err}`);
  }
  return method === 'DELETE' || res.status === 204 ? null : res.json();
}

const router = express.Router();

// ─── Health Check ─────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  res.json({ status: '✅ Fair Ride API running on Vercel', backend: 'Supabase REST API', timestamp: new Date().toISOString() });
});

// ─── AUTH: Register ──────────────────────────────────────────────────────────
router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'All fields are required' });

    const lowerEmail = email.toLowerCase();

    // Check if user exists
    const existing = await supabaseFetch('users', 'GET', null, `?email=eq.${encodeURIComponent(lowerEmail)}&select=id`);
    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const users = await supabaseFetch('users', 'POST', {
      name, email: lowerEmail, password: hashed, role: 'user'
    });
    
    if (!users || users.length === 0) throw new Error('Failed to create user');
    const user = users[0];

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── AUTH: Login ─────────────────────────────────────────────────────────────
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const users = await supabaseFetch('users', 'GET', null, `?email=eq.${encodeURIComponent(email.toLowerCase())}`);
    if (!users || users.length === 0) return res.status(400).json({ error: 'Invalid email or password' });
    
    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── RIDES ────────────────────────────────────────────────────────────────────
router.get('/rides', async (req, res) => {
  try {
    const data = await supabaseFetch('rides', 'GET', null, '?status=eq.active&seats=gt.0&order=created_at.desc');
    const formatted = data.map(r => ({ ...r, driverId: r.driver_id, driverName: r.driver_name, createdAt: r.created_at }));
    res.json(formatted);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/rides/driver/:driverId', async (req, res) => {
  try {
    const data = await supabaseFetch('rides', 'GET', null, `?driver_id=eq.${req.params.driverId}&order=created_at.desc`);
    const formatted = data.map(r => ({ ...r, driverId: r.driver_id, driverName: r.driver_name, createdAt: r.created_at }));
    res.json(formatted);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/rides', async (req, res) => {
  try {
    const { driverId, driverName, pickup, dropoff, time, seats, price, vehicle, tags } = req.body;
    const data = await supabaseFetch('rides', 'POST', {
      driver_id: driverId, driver_name: driverName, pickup, dropoff, time, seats, price, vehicle, tags: tags || [], status: 'active'
    });
    const r = data[0];
    res.status(201).json({ ...r, driverId: r.driver_id, driverName: r.driver_name, createdAt: r.created_at });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/rides/:id/complete', async (req, res) => {
  try {
    const data = await supabaseFetch('rides', 'PATCH', { status: 'completed' }, `?id=eq.${req.params.id}`);
    const r = data[0] || req.body; 
    res.json({ ...r, status: 'completed' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── BOOKINGS ────────────────────────────────────────────────────────────────
router.post('/bookings', async (req, res) => {
  try {
    const { rideId, passengerId } = req.body;
    
    const rides = await supabaseFetch('rides', 'GET', null, `?id=eq.${rideId}&select=seats`);
    if (!rides || rides.length === 0) return res.status(404).json({ error: 'Ride not found' });
    if (rides[0].seats <= 0) return res.status(400).json({ error: 'No seats available' });
    
    await supabaseFetch('rides', 'PATCH', { seats: rides[0].seats - 1 }, `?id=eq.${rideId}`);
    
    const bookings = await supabaseFetch('bookings', 'POST', {
      ride_id: rideId, passenger_id: passengerId, status: 'confirmed'
    });
    const b = bookings[0];
    res.status(201).json({ ...b, rideId: b.ride_id, passengerId: b.passenger_id, createdAt: b.created_at });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/bookings/passenger/:passengerId', async (req, res) => {
  try {
    const data = await supabaseFetch('bookings', 'GET', null, `?passenger_id=eq.${req.params.passengerId}&select=*,rides(*)&order=created_at.desc`);
    const formatted = data.map(b => ({
      ...b, rideId: b.ride_id, passengerId: b.passenger_id, createdAt: b.created_at,
      ride: b.rides ? { ...b.rides, driverId: b.rides.driver_id, driverName: b.rides.driver_name, createdAt: b.rides.created_at } : null
    }));
    res.json(formatted);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── MESSAGES ────────────────────────────────────────────────────────────────
router.get('/messages/:rideId', async (req, res) => {
  try {
    const data = await supabaseFetch('messages', 'GET', null, `?ride_id=eq.${req.params.rideId}&order=timestamp.asc`);
    const formatted = data.map(r => ({ ...r, rideId: r.ride_id, senderId: r.sender_id, senderName: r.sender_name }));
    res.json(formatted);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/messages', async (req, res) => {
  try {
    const { rideId, senderId, senderName, text } = req.body;
    const data = await supabaseFetch('messages', 'POST', {
      ride_id: rideId, sender_id: senderId, sender_name: senderName, text
    });
    const r = data[0];
    res.status(201).json({ ...r, rideId: r.ride_id, senderId: r.sender_id, senderName: r.sender_name });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/messages/:id/read', async (req, res) => {
  try {
    const data = await supabaseFetch('messages', 'PATCH', { is_read: true }, `?id=eq.${req.params.id}`);
    const r = data ? data[0] : { id: req.params.id };
    res.json({ ...r, is_read: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── REVIEWS ─────────────────────────────────────────────────────────────────
router.get('/reviews/driver/:driverId', async (req, res) => {
  try {
    const data = await supabaseFetch('reviews', 'GET', null, `?driver_id=eq.${req.params.driverId}&order=timestamp.desc`);
    const formatted = data.map(r => ({ ...r, driverId: r.driver_id, reviewerId: r.reviewer_id, reviewerName: r.reviewer_name }));
    res.json(formatted);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/reviews', async (req, res) => {
  try {
    const { driverId, reviewerId, reviewerName, rating, comment } = req.body;
    const data = await supabaseFetch('reviews', 'POST', {
      driver_id: driverId, reviewer_id: reviewerId, reviewer_name: reviewerName, rating, comment
    });
    const r = data[0];
    res.status(201).json({ ...r, driverId: r.driver_id, reviewerId: r.reviewer_id, reviewerName: r.reviewer_name });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── ADMIN ────────────────────────────────────────────────────────────────
router.post('/admin/test-db', async (req, res) => {
  const { uri } = req.body;
  if (!uri) return res.status(400).json({ error: 'URI required' });
  if (uri.includes('supabase.co')) {
    res.json({ success: true, message: '✅ Supabase URI accepted.' });
  } else {
    res.status(400).json({ success: false, message: '❌ Only Supabase API endpoints are supported.' });
  }
});

app.use('/api', router);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

// Vercel expects the express app to be exported
module.exports = app;
