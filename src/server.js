const path = require('path');
const http = require('http');
const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const { getDb, writeDb, resetDb, DB_PATH, DB_VERSION } = require('./db');
const { ROUTES, routeById, CENTER } = require('./routeCatalog');

const PORT = Number(process.env.PORT || 3021);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-cambia-esto-para-produccion';
const ACTIVE_TTL_MS = 1000 * 18;

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: true, credentials: true } });
const activeShares = new Map();

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cache-Control', req.path.startsWith('/api/') || req.path.endsWith('.js') || req.path.endsWith('.css') ? 'no-store, max-age=0' : 'no-cache');
  next();
});
app.use(express.json({ limit: '160kb' }));
app.use(express.static(path.join(__dirname, '..', 'public'), { etag: false, maxAge: 0 }));

function nowIso() { return new Date().toISOString(); }
function cleanText(value, max = 160) { return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max); }
function publicUser(user) { return { id: user.id, name: user.name, email: user.email }; }
function signToken(user) { return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' }); }
function verifyToken(token) { return jwt.verify(token, JWT_SECRET); }
function authFromReq(req) {
  const raw = req.headers.authorization || '';
  const token = raw.startsWith('Bearer ') ? raw.slice(7) : '';
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    const db = getDb();
    return db.users.find((u) => u.id === payload.id) || null;
  } catch (_) { return null; }
}
function requireAuth(req, res, next) {
  const user = authFromReq(req);
  if (!user) return res.status(401).json({ error: 'Necesitas iniciar sesión.' });
  req.user = user;
  next();
}
function validLatLng(lat, lng) {
  const a = Number(lat); const b = Number(lng);
  return Number.isFinite(a) && Number.isFinite(b) && a > 21.8 && a < 22.7 && b > -98.2 && b < -97.55;
}
function activeList() {
  const now = Date.now();
  for (const [id, share] of activeShares.entries()) {
    if (now - share.updatedAtMs > ACTIVE_TTL_MS) activeShares.delete(id);
  }
  return Array.from(activeShares.values()).map((s) => ({
    userId: s.userId,
    userName: s.userName,
    routeId: s.routeId,
    routeCode: s.routeCode,
    lat: s.lat,
    lng: s.lng,
    accuracy: s.accuracy,
    speed: s.speed,
    heading: s.heading,
    updatedAt: s.updatedAt,
    ageSeconds: Math.max(0, Math.round((Date.now() - s.updatedAtMs) / 1000))
  }));
}
function emitState() {
  const db = getDb();
  io.emit('live:state', { activeShares: activeList(), reports: db.reports.slice(-120) });
}
function routeSummary(r) {
  return {
    id: r.id, code: r.code, number: r.number, name: r.name, shortName: r.shortName,
    color: r.color, city: r.city, type: r.type, keywords: r.keywords,
    source: r.source, sourceUrl: r.sourceUrl, sourceLabel: r.sourceLabel,
    geometryStatus: r.geometryStatus
  };
}
function scoreRoute(route, q) {
  const terms = cleanText(q, 140).toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return 0;
  const hay = [route.code, route.name, route.shortName, ...(route.keywords || [])].join(' ').toLowerCase();
  return terms.reduce((sum, t) => sum + (hay.includes(t) ? 1 : 0), 0);
}

app.get('/api/health', (req, res) => {
  const db = getDb();
  res.json({
    ok: true,
    app: 'ahi-viene-gps-real-v4',
    port: PORT,
    dbVersion: DB_VERSION,
    dbPath: DB_PATH,
    users: db.users.length,
    reports: db.reports.length,
    activeShares: activeList().length,
    routeCatalog: ROUTES.length,
    center: CENTER,
    time: nowIso()
  });
});

app.get('/api/debug/db', requireAuth, (req, res) => {
  const db = getDb();
  res.json({
    dbPath: DB_PATH,
    dbVersion: DB_VERSION,
    users: db.users.map((u) => ({ id: u.id, name: u.name, email: u.email, createdAt: u.createdAt, lastLoginAt: u.lastLoginAt })),
    reportsCount: db.reports.length,
    activeShares: activeList(),
    routesCount: ROUTES.length
  });
});

app.post('/api/debug/reset-db', requireAuth, (req, res) => {
  const db = resetDb();
  activeShares.clear();
  emitState();
  res.json({ ok: true, dbPath: DB_PATH, dbVersion: DB_VERSION, users: db.users.length, reports: db.reports.length });
});

app.post('/api/auth/register', async (req, res) => {
  const name = cleanText(req.body.name, 50) || 'Usuario';
  const email = cleanText(req.body.email, 120).toLowerCase();
  const password = String(req.body.password || '');
  if (!email.includes('@') || email.length < 5) return res.status(400).json({ error: 'Correo inválido.' });
  if (password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener mínimo 6 caracteres.' });

  const db = getDb();
  if (db.users.some((u) => u.email === email)) return res.status(409).json({ error: 'Ese correo ya está registrado.' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: crypto.randomUUID(), name, email, passwordHash, createdAt: nowIso(), lastLoginAt: nowIso() };
  db.users.push(user);
  writeDb(db);
  res.json({ token: signToken(user), user: publicUser(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const email = cleanText(req.body.email, 120).toLowerCase();
  const password = String(req.body.password || '');
  const db = getDb();
  const user = db.users.find((u) => u.email === email);
  if (!user) return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
  user.lastLoginAt = nowIso();
  writeDb(db);
  res.json({ token: signToken(user), user: publicUser(user) });
});

app.get('/api/auth/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

app.get('/api/routes', (req, res) => {
  const q = cleanText(req.query.q, 140).toLowerCase();
  const items = ROUTES
    .filter((r) => !q || scoreRoute(r, q) > 0)
    .sort((a, b) => a.number - b.number)
    .map(routeSummary);
  res.json({ routes: items, count: items.length, source: 'Catálogo local + redirección a RutaDirecta. GPS real cada 2 segundos.', generatedAt: '2026-06-13' });
});

app.get('/api/routes/recommend', (req, res) => {
  const q = cleanText(req.query.q, 140);
  const scored = ROUTES
    .map((r) => ({ ...routeSummary(r), score: scoreRoute(r, q) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.number - b.number)
    .slice(0, 8);
  res.json({ query: q, recommendations: scored });
});

app.get('/api/live', requireAuth, (req, res) => {
  const db = getDb();
  res.json({ activeShares: activeList(), reports: db.reports.slice(-120) });
});

app.post('/api/reports', requireAuth, (req, res) => {
  const route = routeById(cleanText(req.body.routeId, 40));
  if (!route) return res.status(400).json({ error: 'Ruta inválida.' });
  const lat = Number(req.body.lat); const lng = Number(req.body.lng);
  if (!validLatLng(lat, lng)) return res.status(400).json({ error: 'Ubicación fuera de la zona Tampico-Madero-Altamira.' });
  const allowedTypes = new Set(['full', 'delay', 'detour', 'incident', 'normal', 'info']);
  const type = allowedTypes.has(req.body.type) ? req.body.type : 'info';
  const message = cleanText(req.body.message, 220);
  const db = getDb();
  const report = {
    id: crypto.randomUUID(),
    userId: req.user.id,
    userName: req.user.name,
    routeId: route.id,
    routeCode: route.code,
    type,
    message,
    lat,
    lng,
    accuracy: Number.isFinite(Number(req.body.accuracy)) ? Math.round(Number(req.body.accuracy)) : null,
    createdAt: nowIso()
  };
  db.reports.push(report);
  db.reports = db.reports.slice(-500);
  writeDb(db);
  emitState();
  res.json({ report });
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Sin sesión.'));
    const payload = verifyToken(token);
    const db = getDb();
    const user = db.users.find((u) => u.id === payload.id);
    if (!user) return next(new Error('Usuario no encontrado.'));
    socket.user = user;
    next();
  } catch (error) { next(new Error('Sesión inválida.')); }
});

io.on('connection', (socket) => {
  socket.emit('live:state', { activeShares: activeList(), reports: getDb().reports.slice(-120) });

  socket.on('share:update', (payload = {}) => {
    const route = routeById(cleanText(payload.routeId, 40));
    const lat = Number(payload.lat); const lng = Number(payload.lng);
    if (!route || !validLatLng(lat, lng)) return;
    const share = {
      userId: socket.user.id,
      userName: socket.user.name,
      routeId: route.id,
      routeCode: route.code,
      lat,
      lng,
      accuracy: Number.isFinite(Number(payload.accuracy)) ? Math.round(Number(payload.accuracy)) : null,
      speed: Number.isFinite(Number(payload.speed)) ? Number(payload.speed) : null,
      heading: Number.isFinite(Number(payload.heading)) ? Number(payload.heading) : null,
      updatedAt: nowIso(),
      updatedAtMs: Date.now()
    };
    activeShares.set(socket.user.id, share);
    emitState();
  });

  socket.on('share:stop', () => {
    activeShares.delete(socket.user.id);
    emitState();
  });

  socket.on('disconnect', () => {
    activeShares.delete(socket.user.id);
    emitState();
  });
});

setInterval(() => emitState(), 15000).unref();

server.listen(PORT, '0.0.0.0', () => {
  getDb();
  console.log(`Ahí Viene Dual UI listo en http://localhost:${PORT}`);
  console.log(`También en red local: http://TU_IP:${PORT}`);
  console.log(`DB: ${DB_PATH}`);
  console.log(`Rutas cargadas: ${ROUTES.length}`);
});
