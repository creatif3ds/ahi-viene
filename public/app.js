const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

const state = {
  mode: 'login', token: localStorage.getItem('ahi_rd_token') || '', user: null,
  routes: [], routeIndex: new Map(), reports: [], activeShares: [], socket: null,
  map: null, routeLayer: null, stopLayer: null, routeFocusLayer: null, userLayer: null, reportLayer: null, searchLayer: null,
  routeLines: new Map(), selectedRouteId: null, selectedReportPoint: null, manualPoint: null,
  watchId: null, gpsTimer: null, gpsBusy: false, lastGpsPoint: null, sharing: false,
  focusedRouteId: null, focusedRouteGeometry: null,
  toggles: { routes: true, stops: true, users: true, reports: true }
};

const typeLabels = { full: 'Unidad llena', delay: 'Retraso', detour: 'Desvío', incident: 'Incidente', normal: 'Todo normal', info: 'Información' };
const typeColors = { full: '#f59e0b', delay: '#f97316', detour: '#38bdf8', incident: '#ef4444', normal: '#22c55e', info: '#a78bfa' };
const ROUTE_STYLE_VERSION = 'lineas-pro-v1';

function setText(el, text) { if (el) el.textContent = text; }
function toast(message, ms = 2800) { const t = $('#toast'); t.textContent = message; t.classList.remove('hidden'); clearTimeout(toast.timer); toast.timer = setTimeout(() => t.classList.add('hidden'), ms); }
async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error de servidor');
  return data;
}
function escapeHtml(str) { return String(str || '').replace(/[&<>'"]/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[c])); }

function switchAuthMode(mode) {
  state.mode = mode;
  $('#login-tab').classList.toggle('active', mode === 'login');
  $('#register-tab').classList.toggle('active', mode === 'register');
  $('#name-field').classList.toggle('hidden', mode !== 'register');
  $('#auth-submit').textContent = mode === 'login' ? 'Entrar' : 'Crear cuenta';
  $('#password').setAttribute('autocomplete', mode === 'login' ? 'current-password' : 'new-password');
  setText($('#auth-error'), '');
}

async function handleAuth(event) {
  event.preventDefault();
  setText($('#auth-error'), '');
  const body = { email: $('#email').value.trim(), password: $('#password').value };
  if (state.mode === 'register') body.name = $('#name').value.trim() || 'Usuario';
  try {
    const data = await api(state.mode === 'login' ? '/api/auth/login' : '/api/auth/register', { method: 'POST', body: JSON.stringify(body) });
    state.token = data.token; state.user = data.user;
    localStorage.setItem('ahi_rd_token', state.token);
    await enterApp();
  } catch (error) { setText($('#auth-error'), error.message); }
}

async function loadSession() {
  if (!state.token) return false;
  try { const data = await api('/api/auth/me'); state.user = data.user; return true; }
  catch (_) { localStorage.removeItem('ahi_rd_token'); state.token = ''; return false; }
}

async function enterApp() {
  $('#auth').classList.add('hidden'); $('#app').classList.remove('hidden');
  $('#session-name').textContent = `${state.user.name} · ${state.user.email}`;
  initMap();
  await loadRoutes();
  await refreshHealth();
  connectSocket();
  await refreshLive();
  setTimeout(() => state.map.invalidateSize(), 120);
}

function logout() {
  stopSharing();
  if (state.socket) state.socket.disconnect();
  state.socket = null; state.token = ''; state.user = null;
  localStorage.removeItem('ahi_rd_token');
  $('#app').classList.add('hidden'); $('#auth').classList.remove('hidden');
}

function initMap() {
  if (state.map) return;
  state.map = L.map('map', { zoomControl: false }).setView([22.282, -97.878], 12);
  L.control.zoom({ position: 'bottomright' }).addTo(state.map);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(state.map);
  state.routeLayer = L.layerGroup().addTo(state.map);
  state.stopLayer = L.layerGroup().addTo(state.map);
  state.routeFocusLayer = L.layerGroup().addTo(state.map);
  state.userLayer = L.layerGroup().addTo(state.map);
  state.reportLayer = L.layerGroup().addTo(state.map);
  state.searchLayer = L.layerGroup().addTo(state.map);
  state.map.on('click', () => {
    toast('Los reportes y el compartir usan tu GPS real. No se elige punto manual.');
  });
}

function drawTemporaryPoint(latlng, mode) {
  state.searchLayer.clearLayers();
  const color = mode === 'gps' ? '#22c55e' : '#f59e0b';
  L.circleMarker(latlng, { radius: 9, color, weight: 3, fillColor: color, fillOpacity: .35 }).addTo(state.searchLayer);
}

async function loadRoutes(q = '') {
  const data = await api(`/api/routes${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  state.routes = data.routes;
  state.routeIndex = new Map(state.routes.map((r) => [r.id, r]));
  fillRouteSelects(data.routes);
  renderRouteList(data.routes);
  drawRoutes(data.routes);
  if (!state.selectedRouteId && data.routes[0]) selectRoute(data.routes[0].id, false);
}

function fillRouteSelects(routes) {
  const html = routes.map((r) => `<option value="${r.id}">${r.code} · ${escapeHtml(r.shortName)}</option>`).join('');
  $('#share-route').innerHTML = html; $('#report-route').innerHTML = html;
}

function renderRouteList(routes) {
  const wrap = $('#recommendations');
  if (!routes.length) { wrap.innerHTML = '<div class="empty">No encontré rutas con esa búsqueda.</div>'; return; }
  wrap.innerHTML = routes.map((r) => `
    <div class="route-item" data-route-id="${r.id}" role="button" tabindex="0">
      <span class="route-dot" style="background:${r.color}">${r.code}</span>
      <span class="route-item-main"><h4>${escapeHtml(r.shortName)}</h4><p>${escapeHtml(r.name)}</p></span>
      <button class="route-view-btn" data-route-id="${r.id}" type="button">Ver ruta</button>
    </div>
  `).join('');
  $$('.route-item').forEach((card) => {
    card.addEventListener('click', () => selectRoute(card.dataset.routeId, true));
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter') selectRoute(card.dataset.routeId, true); });
  });
  $$('.route-view-btn').forEach((btn) => btn.addEventListener('click', (e) => { e.stopPropagation(); viewRoute(btn.dataset.routeId); }));
}

function drawRoutes(routes) {
  state.routeLayer.clearLayers();
  state.stopLayer.clearLayers();
  state.routeFocusLayer.clearLayers();
  state.routeLines.clear();
  state.allBounds = null;
  // Sin trazos nativos: esta versión no dibuja recorridos propios.
  // El botón "Ver ruta" abre la ficha correspondiente en RutaDirecta.
  applyToggles();
}

function selectRoute(routeId, zoom = true) {
  const r = state.routeIndex.get(routeId); if (!r) return;
  state.selectedRouteId = routeId;
  $('#route-badge').textContent = r.code;
  $('#share-route').value = routeId; $('#report-route').value = routeId;
  state.routeLines.forEach((line, id) => line.setStyle({ weight: id === routeId ? 7 : 4, opacity: id === routeId ? .92 : .22 }));
  $$('.route-item').forEach((card) => card.classList.toggle('selected', card.dataset.routeId === routeId));
  $('#route-detail').classList.remove('empty');
  $('#route-detail').innerHTML = `
    <h3>${escapeHtml(r.code)} · ${escapeHtml(r.shortName)}</h3>
    <p>${escapeHtml(r.name)}</p>
    <p><strong>Recorrido:</strong> esta app ya no dibuja trazos internos. Usa RutaDirecta para ver la ruta seleccionada.</p>
    <p><strong>Uso:</strong> presiona <b>Ver ruta</b> para abrir la ficha de RutaDirecta en una pestaña nueva.</p>
    <div class="tags">${(r.keywords || []).slice(0, 10).map((k) => `<span class="tag">${escapeHtml(k)}</span>`).join('')}</div>
    <div class="actions two"><button class="primary-btn" id="view-route">Ver ruta</button><button class="secondary-btn" id="use-share-route">Compartir aquí</button></div>
  `;
  $('#view-route').addEventListener('click', () => viewRoute(r.id));
  $('#use-share-route').addEventListener('click', () => { $('#share-route').value = r.id; toast(`Ruta ${r.code} seleccionada para compartir.`); });
}

function centerRoute(routeId) {
  const line = state.routeLines.get(routeId);
  if (line) state.map.fitBounds(line.getBounds(), { padding: [70, 70] });
}

function toLatLngArray(path) {
  return (path || [])
    .map((p) => Array.isArray(p) ? [Number(p[0]), Number(p[1])] : [Number(p.lat), Number(p.lng)])
    .filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]));
}

function distanceMeters(a, b) {
  const R = 6371000;
  const lat1 = a[0] * Math.PI / 180;
  const lat2 = b[0] * Math.PI / 180;
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLng = (b[1] - a[1]) * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function pathDistance(path) {
  let total = 0;
  for (let i = 1; i < path.length; i += 1) total += distanceMeters(path[i - 1], path[i]);
  return total;
}

function routeAngle(a, b) {
  const avgLat = ((a[0] + b[0]) / 2) * Math.PI / 180;
  const dx = (b[1] - a[1]) * Math.cos(avgLat);
  const dy = -(b[0] - a[0]);
  return Math.atan2(dy, dx) * 180 / Math.PI;
}

function pointAtDistance(path, targetMeters) {
  let traveled = 0;
  for (let i = 1; i < path.length; i += 1) {
    const a = path[i - 1];
    const b = path[i];
    const seg = distanceMeters(a, b);
    if (traveled + seg >= targetMeters) {
      const t = Math.max(0, Math.min(1, (targetMeters - traveled) / Math.max(seg, 1)));
      return {
        point: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t],
        angle: routeAngle(a, b)
      };
    }
    traveled += seg;
  }
  const last = path[path.length - 1];
  const prev = path[path.length - 2] || last;
  return { point: last, angle: routeAngle(prev, last) };
}

function chunkWaypoints(path, maxPoints = 24) {
  if (path.length <= maxPoints) return [path];
  const chunks = [];
  let i = 0;
  while (i < path.length - 1) {
    const chunk = path.slice(i, Math.min(i + maxPoints, path.length));
    if (chunk.length >= 2) chunks.push(chunk);
    i += maxPoints - 1;
  }
  return chunks;
}

function routeCacheKey(route) {
  const sig = route.path.map((p) => `${p[0].toFixed(5)},${p[1].toFixed(5)}`).join('|');
  return `${ROUTE_STYLE_VERSION}_${route.id}_${sig.length}_${route.path.length}`;
}

function useInternalLineRoute(route) {
  const path = toLatLngArray(route.path);
  return { path, source: 'lineas-internas', cached: false };
}

function routeStopIcon(stop, idx, color) {
  const label = idx === 0 ? 'I' : String(idx + 1);
  return L.divIcon({
    className: '',
    html: `<div class="stop-pin" style="--route-color:${color}"><span>${escapeHtml(label)}</span></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
}

function addSmartArrows(path, color) {
  const length = pathDistance(path);
  const spacing = length > 22000 ? 1300 : length > 12000 ? 950 : 620;
  const first = Math.min(450, length * 0.10);
  const last = Math.max(first + 1, length - Math.min(420, length * 0.10));
  for (let d = first; d < last; d += spacing) {
    const sample = pointAtDistance(path, d);
    L.marker(sample.point, {
      interactive: false,
      icon: L.divIcon({
        className: '',
        html: `<div class="route-chevron line-arrow" style="--route-color:${color}; transform: rotate(${sample.angle}deg)"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 5 25 16 7 27 12 16 7 5Z"/></svg></div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      })
    }).addTo(state.routeFocusLayer);
  }
}

function updateRouteHud(route, geometry, source, status = '') {
  const hud = $('#route-hud');
  if (!hud) return;
  hud.classList.remove('hidden');
  $('#hud-color').style.background = route.color || '#ef3b2d';
  $('#hud-title').textContent = `${route.code} · ${route.shortName}`;
  const km = pathDistance(geometry) / 1000;
  const sourceText = source === 'lineas-internas' ? 'trazo por líneas internas' : source === 'local' ? 'trazo local' : source;
  $('#hud-subtitle').textContent = status || `${km.toFixed(1)} km aprox. · ${sourceText} · ${route.stops.length} paradas base`;
}

function clearRouteFocus() {
  state.routeFocusLayer.clearLayers();
  state.focusedRouteId = null;
  state.focusedRouteGeometry = null;
  const hud = $('#route-hud');
  if (hud) hud.classList.add('hidden');
  state.routeLines.forEach((line, id) => line.setStyle({ weight: id === state.selectedRouteId ? 7 : 4, opacity: id === state.selectedRouteId ? .92 : .36 }));
}

function renderFocusedRoute(route, geometry, source) {
  state.routeFocusLayer.clearLayers();
  const color = '#ef3b2d';
  const bounds = L.latLngBounds(geometry);

  state.routeLines.forEach((line) => line.setStyle({ weight: 2.2, opacity: .10 }));

  // Estilo tipo mapa de ruta: línea roja segmentada, sin curvas raras ni enrutamiento externo.
  L.polyline(geometry, {
    color: '#111827', weight: 15, opacity: .30, lineJoin: 'miter', lineCap: 'butt', smoothFactor: 0, interactive: false
  }).addTo(state.routeFocusLayer);
  L.polyline(geometry, {
    color: '#ffffff', weight: 11, opacity: .98, lineJoin: 'miter', lineCap: 'butt', smoothFactor: 0, interactive: false
  }).addTo(state.routeFocusLayer);
  const main = L.polyline(geometry, {
    color, weight: 6.5, opacity: 1, lineJoin: 'miter', lineCap: 'butt', smoothFactor: 0, className: 'focused-route-main line-route-main'
  }).addTo(state.routeFocusLayer);
  L.polyline(geometry, {
    color: '#991b1b', weight: 1.6, opacity: .38, dashArray: '10 16', lineJoin: 'miter', lineCap: 'butt', smoothFactor: 0, className: 'route-flow', interactive: false
  }).addTo(state.routeFocusLayer);

  addSmartArrows(geometry, color);

  (route.stops || []).forEach((s, idx) => {
    const marker = L.marker([s.lat, s.lng], { icon: routeStopIcon(s, idx, color), zIndexOffset: 600 }).addTo(state.routeFocusLayer);
    marker.bindPopup(`<strong>${escapeHtml(idx === 0 ? 'Inicio' : idx === route.stops.length - 1 ? 'Fin' : 'Punto ' + (idx + 1))}</strong><br>${escapeHtml(s.name)}<br><small>${escapeHtml(route.code)} · ${escapeHtml(route.shortName)}</small>`);
  });

  const start = geometry[0];
  const end = geometry[geometry.length - 1];
  L.marker(start, { icon: L.divIcon({ className: '', html: `<div class="endpoint-pro start"><span>Inicio</span></div>`, iconSize: [86, 30], iconAnchor: [43, 15] }), zIndexOffset: 700 }).addTo(state.routeFocusLayer);
  L.marker(end, { icon: L.divIcon({ className: '', html: `<div class="endpoint-pro end"><span>Fin</span></div>`, iconSize: [70, 30], iconAnchor: [35, 15] }), zIndexOffset: 700 }).addTo(state.routeFocusLayer);

  main.bindPopup(`<strong>${escapeHtml(route.code)} · ${escapeHtml(route.shortName)}</strong><br>${escapeHtml(route.name)}<br><small>Trazo interno por líneas. No depende de RutaDirecta ni de OSRM.</small>`);
  state.map.fitBounds(bounds, { padding: [95, 95], maxZoom: 16 });
  state.focusedRouteId = route.id;
  state.focusedRouteGeometry = geometry;
  updateRouteHud(route, geometry, source);
}

async function viewRoute(routeId) {
  const r = state.routeIndex.get(routeId);
  if (!r) return;
  selectRoute(routeId, false);
  const url = r.sourceUrl || 'https://rutadirecta.com/city/tampico.tamaulipas';
  window.open(url, '_blank', 'noopener,noreferrer');
  toast(`${r.code}: abriendo RutaDirecta...`);
}

function connectSocket() {
  if (state.socket) state.socket.disconnect();
  state.socket = io({ auth: { token: state.token }, transports: ['websocket', 'polling'] });
  state.socket.on('connect', () => toast('Conectado en tiempo real.'));
  state.socket.on('connect_error', (e) => toast(`Socket: ${e.message}`));
  state.socket.on('live:state', (data) => { state.activeShares = data.activeShares || []; state.reports = data.reports || []; renderLive(); renderReports(); });
}

async function refreshLive() {
  try { const data = await api('/api/live'); state.activeShares = data.activeShares || []; state.reports = data.reports || []; renderLive(); renderReports(); }
  catch (e) { console.warn(e); }
}

function markerUserIcon(share) {
  const route = state.routeIndex.get(share.routeId);
  const color = route?.color || '#22c55e';
  const own = share.userId === state.user?.id ? ' own' : '';
  return L.divIcon({
    className: '',
    html: `<div class="marker-user${own}" style="background:${color}">${escapeHtml(share.routeCode || 'R')}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
}
function renderLive() {
  $('#live-count').textContent = `${state.activeShares.length} activos`;
  state.userLayer.clearLayers();
  if (!state.activeShares.length) { $('#live-list').className = 'live-list empty'; $('#live-list').textContent = 'Nadie está compartiendo ubicación todavía.'; return; }
  $('#live-list').className = 'live-list';
  $('#live-list').innerHTML = state.activeShares.map((s) => `<div class="live-card"><strong>${s.userId === state.user?.id ? 'Tú' : escapeHtml(s.userName)} · ${escapeHtml(s.routeCode)}</strong><span>GPS real · actualizado hace ${s.ageSeconds || 0}s ${s.accuracy ? `· ±${s.accuracy} m` : ''}</span></div>`).join('');
  state.activeShares.forEach((s) => {
    const m = L.marker([s.lat, s.lng], { icon: markerUserIcon(s) }).addTo(state.userLayer);
    m.bindPopup(`<strong>${s.userId === state.user?.id ? 'Tú' : escapeHtml(s.userName)}</strong><br>${escapeHtml(s.routeCode)}<br><small>GPS real actualizado hace ${s.ageSeconds || 0}s</small>`);
    if (s.accuracy) L.circle([s.lat, s.lng], { radius: Math.min(s.accuracy, 400), color: '#22c55e', weight: 1, fillColor: '#22c55e', fillOpacity: .08 }).addTo(state.userLayer);
  });
  applyToggles();
}

function renderReports() {
  $('#report-count').textContent = String(state.reports.length);
  state.reportLayer.clearLayers();
  if (!state.reports.length) { $('#feed').className = 'feed empty'; $('#feed').textContent = 'Aún no hay reportes publicados.'; return; }
  $('#feed').className = 'feed';
  $('#feed').innerHTML = state.reports.slice().reverse().slice(0, 50).map((r) => `<div class="feed-card"><strong>${escapeHtml(r.routeCode)} · ${escapeHtml(typeLabels[r.type] || r.type)}</strong><span>${escapeHtml(r.userName)} · ${new Date(r.createdAt).toLocaleTimeString()}</span><p>${escapeHtml(r.message || 'Sin mensaje')}</p></div>`).join('');
  state.reports.forEach((r) => {
    const color = typeColors[r.type] || '#a78bfa';
    const icon = L.divIcon({ className: '', html: `<div class="marker-report" style="background:${color}">${escapeHtml(r.routeCode)}</div>`, iconSize: [34, 34], iconAnchor: [17, 17] });
    L.marker([r.lat, r.lng], { icon }).addTo(state.reportLayer).bindPopup(`<strong>${escapeHtml(r.routeCode)} · ${escapeHtml(typeLabels[r.type] || r.type)}</strong><br>${escapeHtml(r.message || '')}<br><small>${escapeHtml(r.userName)} · ${new Date(r.createdAt).toLocaleString()}</small>`);
  });
  applyToggles();
}

function currentShareRouteId() {
  return $('#share-route').value || state.selectedRouteId;
}

function gpsOptions() {
  return { enableHighAccuracy: true, maximumAge: 1000, timeout: 12000 };
}

function readGpsOnce() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Tu navegador no soporta geolocalización.'));
    navigator.geolocation.getCurrentPosition(resolve, reject, gpsOptions());
  });
}

function payloadFromPosition(pos, routeId = currentShareRouteId()) {
  return {
    routeId,
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
    accuracy: pos.coords.accuracy,
    speed: pos.coords.speed,
    heading: pos.coords.heading
  };
}

async function pushGpsShare() {
  if (!state.sharing || state.gpsBusy) return;
  const routeId = currentShareRouteId();
  if (!routeId) { toast('Selecciona una ruta.'); return; }
  state.gpsBusy = true;
  try {
    const pos = await readGpsOnce();
    const payload = payloadFromPosition(pos, routeId);
    state.lastGpsPoint = {
      lat: payload.lat,
      lng: payload.lng,
      accuracy: payload.accuracy,
      speed: payload.speed,
      heading: payload.heading,
      routeId,
      capturedAt: Date.now()
    };
    sendShare(payload);
    setText($('#report-point-label'), `GPS ±${Math.round(payload.accuracy || 0)} m`);
  } catch (err) {
    toast(`GPS: ${err.message}`);
  } finally {
    state.gpsBusy = false;
  }
}

async function startGpsShare() {
  if (!navigator.geolocation) return toast('Tu navegador no soporta geolocalización.');
  const routeId = currentShareRouteId();
  if (!routeId) return toast('Selecciona una ruta.');
  if (!state.socket || !state.socket.connected) connectSocket();
  if (state.watchId) navigator.geolocation.clearWatch(state.watchId);
  clearInterval(state.gpsTimer);
  state.gpsTimer = null;
  state.lastGpsPoint = null;
  state.sharing = true;
  updateShareUi('GPS activo · cada 2s');
  await pushGpsShare();
  state.gpsTimer = setInterval(pushGpsShare, 2000);
}

function sendShare(payload) {
  if (state.socket) state.socket.emit('share:update', payload);
}

function stopSharing() {
  if (state.watchId) navigator.geolocation.clearWatch(state.watchId);
  state.watchId = null;
  clearInterval(state.gpsTimer); state.gpsTimer = null;
  clearInterval(state.manualTimer); state.manualTimer = null;
  state.gpsBusy = false; state.sharing = false;
  state.lastGpsPoint = null;
  setText($('#report-point-label'), 'Usa tu GPS');
  if (state.socket) state.socket.emit('share:stop');
  updateShareUi('Inactivo');
}
function updateShareUi(text) {
  $('#share-state').textContent = text;
  $('#stop-share').disabled = !state.sharing;
  $('#gps-share').disabled = state.sharing;
}

async function getReportPointFromGps() {
  const freshEnough = state.lastGpsPoint && (Date.now() - state.lastGpsPoint.capturedAt < 8000);
  if (freshEnough) return state.lastGpsPoint;
  const pos = await readGpsOnce();
  return {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
    accuracy: pos.coords.accuracy,
    speed: pos.coords.speed,
    heading: pos.coords.heading,
    capturedAt: Date.now()
  };
}

async function sendReport() {
  const routeId = $('#report-route').value;
  const route = state.routeIndex.get(routeId);
  if (!route) return toast('Selecciona una ruta válida.');
  try {
    const point = await getReportPointFromGps();
    await api('/api/reports', {
      method: 'POST',
      body: JSON.stringify({
        routeId,
        type: $('#report-type').value,
        message: $('#report-message').value,
        lat: point.lat,
        lng: point.lng,
        accuracy: point.accuracy
      })
    });
    $('#report-message').value = '';
    setText($('#report-point-label'), point.accuracy ? `GPS ±${Math.round(point.accuracy)} m` : 'GPS usado');
    toast('Reporte publicado desde tu ubicación real.');
  } catch (e) {
    toast(`No pude obtener tu GPS para reportar: ${e.message}`);
  }
}

async function searchDestination() {
  const q = $('#destination').value.trim();
  if (!q) return;
  const local = await api(`/api/routes/recommend?q=${encodeURIComponent(q)}`);
  renderRouteList(local.recommendations || []);
  if (local.recommendations?.length) { selectRoute(local.recommendations[0].id, true); toast(`Sugerencia: ${local.recommendations[0].code} · ${local.recommendations[0].shortName}`); }
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=mx&q=${encodeURIComponent(q + ' Tampico Madero Altamira Tamaulipas')}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const data = await res.json();
    if (data[0]) {
      const latlng = [Number(data[0].lat), Number(data[0].lon)];
      state.searchLayer.clearLayers();
      L.marker(latlng).addTo(state.searchLayer).bindPopup(`<strong>${escapeHtml(q)}</strong><br>${escapeHtml(data[0].display_name)}`).openPopup();
      state.map.setView(latlng, 15);
    }
  } catch (_) { /* nominatim optional */ }
}

function locateMe() {
  if (!navigator.geolocation) return toast('Tu navegador no tiene geolocalización.');
  navigator.geolocation.getCurrentPosition((pos) => {
    const ll = [pos.coords.latitude, pos.coords.longitude];
    state.searchLayer.clearLayers();
    L.circle(ll, { radius: pos.coords.accuracy || 30, color: '#38bdf8', fillColor: '#38bdf8', fillOpacity: .12 }).addTo(state.searchLayer);
    L.circleMarker(ll, { radius: 8, color: '#fff', weight: 3, fillColor: '#38bdf8', fillOpacity: 1 }).addTo(state.searchLayer).bindPopup('Tu ubicación').openPopup();
    state.map.setView(ll, 16);
  }, (err) => toast(`Ubicación: ${err.message}`), { enableHighAccuracy: true, timeout: 12000 });
}

function applyToggles() {
  if (!state.map) return;
  const pairs = [['routes', state.routeLayer], ['stops', state.stopLayer], ['users', state.userLayer], ['reports', state.reportLayer]];
  pairs.forEach(([key, layer]) => {
    if (!layer) return;
    if (state.toggles[key] && !state.map.hasLayer(layer)) layer.addTo(state.map);
    if (!state.toggles[key] && state.map.hasLayer(layer)) state.map.removeLayer(layer);
  });
}

async function refreshHealth() {
  try {
    const h = await api('/api/health');
    $('#health').textContent = JSON.stringify({ puerto: h.port, baseDeDatos: h.dbPath, usuariosRegistrados: h.users, reportes: h.reports, usuariosActivos: h.activeShares, rutasInternas: h.routeCatalog, modoGPS: "tiempo real cada 2 segundos", reportes: "usan GPS real" }, null, 2);
  } catch (e) { $('#health').textContent = e.message; }
}

function bindEvents() {
  $('#login-tab').addEventListener('click', () => switchAuthMode('login'));
  $('#register-tab').addEventListener('click', () => switchAuthMode('register'));
  $('#auth-form').addEventListener('submit', handleAuth);
  $('#logout').addEventListener('click', logout);
  $('#route-search').addEventListener('input', async (e) => { try { await loadRoutes(e.target.value); } catch (err) { toast(err.message); } });
  $('#gps-share').addEventListener('click', startGpsShare);
  $('#share-route').addEventListener('change', () => { if (state.sharing) { pushGpsShare(); toast('Ruta actualizada; tu GPS real se mantiene compartido.'); } });
  $('#stop-share').addEventListener('click', stopSharing);
  $('#send-report').addEventListener('click', sendReport);
  $('#go-destination').addEventListener('click', searchDestination);
  $('#destination').addEventListener('keydown', (e) => { if (e.key === 'Enter') searchDestination(); });
  $('#locate').addEventListener('click', locateMe);
  $('#fit-routes').addEventListener('click', () => { if (state.allBounds) state.map.fitBounds(state.allBounds, { padding: [70, 70] }); });
  $('#refresh-health').addEventListener('click', refreshHealth);
  const clearFocusBtn = $('#clear-route-focus');
  if (clearFocusBtn) clearFocusBtn.addEventListener('click', clearRouteFocus);
  $$('.map-tools button').forEach((btn) => btn.addEventListener('click', () => { const key = btn.dataset.toggle; state.toggles[key] = !state.toggles[key]; btn.classList.toggle('active', state.toggles[key]); applyToggles(); }));
}

(async function init() {
  bindEvents(); switchAuthMode('login');
  const ok = await loadSession();
  if (ok) await enterApp();
})();
