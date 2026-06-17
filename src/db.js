const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');
const DB_VERSION = 7;

const EMPTY_DB = {
  version: DB_VERSION,
  meta: {
    createdAt: null,
    lastRepairAt: null
  },
  users: [],
  reports: []
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function backupCorrupt(content) {
  ensureDir();
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backup = path.join(DATA_DIR, `db.corrupt-${stamp}.json`);
  fs.writeFileSync(backup, content || '', 'utf8');
  return backup;
}

function normalizeString(value, fallback, max = 120) {
  const v = String(value || '').replace(/\s+/g, ' ').trim();
  return (v || fallback).slice(0, max);
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeDb(raw) {
  const createdAt = raw?.meta?.createdAt || new Date().toISOString();
  const db = {
    ...clone(EMPTY_DB),
    ...(raw && typeof raw === 'object' ? raw : {}),
    version: DB_VERSION,
    meta: {
      createdAt,
      lastRepairAt: raw?.meta?.lastRepairAt || null
    }
  };

  if (!Array.isArray(db.users)) db.users = [];
  if (!Array.isArray(db.reports)) db.reports = [];

  const seen = new Set();
  db.users = db.users
    .filter((u) => u && typeof u === 'object')
    .map((u) => ({
      id: typeof u.id === 'string' && u.id ? u.id : crypto.randomUUID(),
      name: normalizeString(u.name, 'Usuario', 50),
      email: normalizeEmail(u.email),
      passwordHash: typeof u.passwordHash === 'string' ? u.passwordHash : '',
      createdAt: typeof u.createdAt === 'string' ? u.createdAt : new Date().toISOString(),
      lastLoginAt: typeof u.lastLoginAt === 'string' ? u.lastLoginAt : null
    }))
    .filter((u) => u.email && u.email.includes('@') && u.passwordHash)
    .filter((u) => {
      if (seen.has(u.email)) return false;
      seen.add(u.email);
      return true;
    });

  db.reports = db.reports
    .filter((r) => r && typeof r === 'object')
    .map((r) => ({
      id: typeof r.id === 'string' && r.id ? r.id : crypto.randomUUID(),
      userId: typeof r.userId === 'string' ? r.userId : null,
      userName: normalizeString(r.userName, 'Usuario', 50),
      routeId: typeof r.routeId === 'string' ? r.routeId : '',
      routeCode: normalizeString(r.routeCode, 'Ruta', 20),
      type: normalizeString(r.type, 'info', 40),
      message: normalizeString(r.message, '', 220),
      lat: Number.isFinite(Number(r.lat)) ? Number(r.lat) : null,
      lng: Number.isFinite(Number(r.lng)) ? Number(r.lng) : null,
      accuracy: Number.isFinite(Number(r.accuracy)) ? Math.round(Number(r.accuracy)) : null,
      createdAt: typeof r.createdAt === 'string' ? r.createdAt : new Date().toISOString()
    }))
    .filter((r) => r.routeId && r.lat !== null && r.lng !== null)
    .slice(-500);

  return db;
}

function readRaw() {
  ensureDir();
  if (!fs.existsSync(DB_PATH)) {
    const fresh = clone(EMPTY_DB);
    fresh.meta.createdAt = new Date().toISOString();
    fs.writeFileSync(DB_PATH, JSON.stringify(fresh, null, 2), 'utf8');
    return fresh;
  }
  const content = fs.readFileSync(DB_PATH, 'utf8');
  if (!content.trim()) return clone(EMPTY_DB);
  try {
    return JSON.parse(content);
  } catch (error) {
    backupCorrupt(content);
    const fresh = clone(EMPTY_DB);
    fresh.meta.createdAt = new Date().toISOString();
    fresh.meta.lastRepairAt = new Date().toISOString();
    fs.writeFileSync(DB_PATH, JSON.stringify(fresh, null, 2), 'utf8');
    return fresh;
  }
}

function getDb() {
  const raw = readRaw();
  const db = normalizeDb(raw);
  const normalized = JSON.stringify(db, null, 2);
  const current = fs.existsSync(DB_PATH) ? fs.readFileSync(DB_PATH, 'utf8') : '';
  if (current.trim() !== normalized.trim()) fs.writeFileSync(DB_PATH, normalized, 'utf8');
  return db;
}

function writeDb(db) {
  ensureDir();
  const normalized = normalizeDb(db);
  fs.writeFileSync(DB_PATH, JSON.stringify(normalized, null, 2), 'utf8');
  return normalized;
}

function resetDb() {
  const fresh = clone(EMPTY_DB);
  fresh.meta.createdAt = new Date().toISOString();
  fresh.meta.lastRepairAt = new Date().toISOString();
  return writeDb(fresh);
}

module.exports = { DB_PATH, DB_VERSION, DATA_DIR, getDb, writeDb, resetDb };
