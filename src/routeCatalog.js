const CENTER = { lat: 22.303, lng: -97.881 };

// Catálogo local. Los nombres/códigos salen del directorio público de RutaDirecta,
// pero los recorridos de abajo están trazados dentro de esta app para no redirigir.
const P = {
  aduana: [22.2178, -97.8599],
  centro: [22.2336, -97.8614],
  mercado: [22.2367, -97.8576],
  mirador: [22.2264, -97.8478],
  morelos: [22.2298, -97.8791],
  moralillo: [22.2198, -97.9164],
  hidalgoSur: [22.2468, -97.8664],
  hidalgoCentro: [22.2574, -97.8705],
  hidalgo: [22.2653, -97.8729],
  charro: [22.2829, -97.8615],
  aeropuerto: [22.2964, -97.8656],
  aviacion: [22.2869, -97.8669],
  hidalgoNorte: [22.2942, -97.8839],
  tancol: [22.3237, -97.8842],
  valle: [22.2605, -97.8876],
  universidad: [22.2847, -97.8709],
  uat: [22.2886, -97.8761],
  imss: [22.2524, -97.8649],
  maderoCentro: [22.2475, -97.8397],
  aguila: [22.2527, -97.8541],
  echeverria: [22.2569, -97.8427],
  maderoNorte: [22.2697, -97.8413],
  lasFlores: [22.2741, -97.8398],
  nuevoMadero: [22.2837, -97.8496],
  serapio: [22.2926, -97.8564],
  refineria: [22.2552, -97.8177],
  playaMiramar: [22.2865, -97.7868],
  escolleras: [22.2771, -97.7801],
  colosio: [22.2608, -97.8323],
  golfo: [22.2765, -97.8288],
  blancoPalmas: [22.2580, -97.8528],
  albaniles: [22.2656, -97.8486],
  revolucionVerde: [22.2739, -97.8558],
  lasTorres: [22.2818, -97.8580],
  maun: [22.2767, -97.8442],
  unidadNacional: [22.2860, -97.8722],
  infonavit: [22.3008, -97.8819],
  lomasInfonavit: [22.3070, -97.8775],
  fovisste: [22.2960, -97.8587],
  lucioBlanco: [22.3021, -97.8500],
  // Puntos internos para dibujar el circuito completo de Ruta 38 Circuito Norte.
  // Son trazos locales de referencia dentro de la app, pensados para funcionar sin redirigir.
  cnMaderoCentro: [22.2453, -97.8390],
  cnBlvdCostero: [22.2440, -97.8158],
  cnRefineria: [22.2525, -97.8174],
  cnFranciscoIMadero: [22.2584, -97.8288],
  cnMex180Oriente: [22.2630, -97.8415],
  cnMonterreySur: [22.2667, -97.8507],
  cnMonterreyMid: [22.2769, -97.8520],
  cnMonterreyAeropuerto: [22.2887, -97.8512],
  cnMonterreyNorte: [22.3013, -97.8518],
  cnFovisste: [22.3067, -97.8553],
  cnCordoba: [22.3160, -97.8617],
  cnAirportNorte: [22.3207, -97.8716],
  cnTancol: [22.3228, -97.8847],
  cnCementerioTancol: [22.3295, -97.8893],
  cnLasTorresNorte: [22.3194, -97.8947],
  cnCobat15: [22.3139, -97.8942],
  cnVelatorioImss: [22.3067, -97.8952],
  cnCentroSaludMujer: [22.3012, -97.8941],
  cnIssste: [22.3165, -97.9096],
  cnLasTorresCentro: [22.2938, -97.8902],
  cnAeropuertoPoniente: [22.2854, -97.8956],
  cnAeropuertoSuroeste: [22.2764, -97.8912],
  cnCurvaLaguna: [22.2676, -97.8848],
  cnMex180Centro: [22.2597, -97.8734],
  cnAeropuertoSur: [22.2658, -97.8634],
  cnUniversidad: [22.2791, -97.8684],
  cnAirportEste: [22.2922, -97.8620],
  cnRegresoMadero: [22.2768, -97.8481],
  santaElena: [22.3428, -97.9312],
  colonias: [22.3635, -97.9448],
  enriqueCardenas: [22.3143, -97.8972],
  centralCamionera: [22.2462, -97.8668],
  puertoAlegre: [22.3069, -97.9132],
  candelario: [22.3004, -97.9214],
  fuerte: [22.2944, -97.9063],
  penal: [22.2926, -97.8995],
  primavera: [22.3103, -97.9177],
  natividad: [22.2967, -97.9127],
  canada: [22.2705, -97.8990],
  contadero: [22.3157, -97.9394],
  puertasColoradas: [22.2517, -97.8942],
  germinal: [22.2826, -97.8935],
  divisoria: [22.3037, -97.8899],
  borreguera: [22.3048, -97.9075],
  centralAbastos: [22.3078, -97.8995],
  bosque: [22.3127, -97.9065],
  casaBlanca: [22.3192, -97.9147],
  tierraAlta: [22.3424, -97.9265],
  ninosHeroes: [22.3296, -97.9068],
  ricardoFlores: [22.4377, -97.9182],
  altamiraCentro: [22.3922, -97.9398],
  altamiraNorte: [22.4143, -97.9387],
  estacionColonias: [22.4201, -97.9512],
  ejido3mayo: [22.4674, -97.9605],
  km40: [22.4901, -97.9656],
  franciscoVilla: [22.4112, -97.9569],
  margaritas: [22.4328, -97.9742],
  upalt: [22.3989, -97.9331],
  santaAmalia: [22.3755, -97.9305],
  cuauhtemoc: [22.4139, -97.9274],
  // Puntos extra para ampliar el catálogo y dibujar rutas con segmentos lineales.
  tancolBosque: [22.3310, -97.8958],
  colBosque: [22.3252, -97.9078],
  panteon: [22.2709, -97.8552],
  heribertoKehoe: [22.2628, -97.8403],
  laPaz: [22.2620, -97.8378],
  ganadera: [22.3140, -97.8870],
  polvorin: [22.3458, -97.9318],
  playaSur: [22.2625, -97.7861],
  playaNorte: [22.3000, -97.7842],
  unidadMorelos: [22.2256, -97.8815],
  arbolGrande: [22.2473, -97.8319],
  pedroJoseMendez: [22.2457, -97.8556],
  carnitasOrta: [22.2562, -97.8626],
  republicaCuba: [22.2362, -97.8517],
  obrera: [22.2429, -97.8505],
  elBlanco: [22.2547, -97.8512],
  kinder: [22.2679, -97.8420],
  cetis78: [22.3041, -97.9042],
  bosquesAlt: [22.3159, -97.9107],
  serapioBoulevard: [22.2921, -97.8603],
  laCima: [22.3370, -97.9148],
  miramarNorte: [22.3017, -97.7890],
  universidadSur: [22.2706, -97.8650],
  lomaReal: [22.3260, -97.9190],
  hospitalIssste: [22.3165, -97.9096],
  cobat: [22.3139, -97.8942],
  velatorio: [22.3067, -97.8952],
  saludMujer: [22.3012, -97.8941]
};

const LABELS = {
  aduana: 'Aduana', centro: 'Centro Tampico', mercado: 'Mercado', mirador: 'Mirador', morelos: 'Col. Morelos', moralillo: 'Moralillo',
  hidalgoSur: 'Av. Hidalgo Sur', hidalgoCentro: 'Av. Hidalgo Centro', hidalgo: 'Av. Hidalgo', charro: 'Glorieta del Charro', aeropuerto: 'Aeropuerto', aviacion: 'Aviación', hidalgoNorte: 'Hidalgo Norte', tancol: 'Tancol', valle: 'Col. Del Valle', universidad: 'Av. Universidad', uat: 'UAT', imss: 'Seguro Social / IMSS',
  maderoCentro: 'Centro Madero', aguila: 'Águila', echeverria: 'Col. Echeverría', maderoNorte: 'Madero Norte', lasFlores: 'Las Flores', nuevoMadero: 'Nuevo Madero', serapio: 'Serapio Venegas', refineria: 'Refinería', playaMiramar: 'Playa Miramar', escolleras: 'Escolleras', colosio: 'Colosio', golfo: 'Golfo', blancoPalmas: 'Blanco Palmas', albaniles: 'Albañiles', revolucionVerde: 'Revolución Verde', lasTorres: 'Las Torres', maun: 'Maun', unidadNacional: 'Unidad Nacional', infonavit: 'Infonavit', lomasInfonavit: 'Lomas de Infonavit', fovisste: 'Fovisste', lucioBlanco: 'Lucio Blanco',
  cnMaderoCentro: 'Centro Madero', cnBlvdCostero: 'Blvd. Adolfo López Mateos', cnRefineria: 'Refinería', cnFranciscoIMadero: 'Av. Francisco I. Madero', cnMex180Oriente: 'MEX 180', cnMonterreySur: 'Av. Monterrey Sur', cnMonterreyMid: 'Av. Monterrey', cnMonterreyAeropuerto: 'Av. Monterrey / Aeropuerto', cnMonterreyNorte: 'Av. Monterrey Norte', cnFovisste: 'Fovisste', cnCordoba: 'Córdoba', cnAirportNorte: 'Norte del Aeropuerto', cnTancol: 'Tancol', cnCementerioTancol: 'Cementerio de Tancol', cnLasTorresNorte: 'Av. Las Torres Norte', cnCobat15: 'COBAT 15', cnVelatorioImss: 'Velatorio IMSS', cnCentroSaludMujer: 'Centro de Salud de la Mujer', cnIssste: 'Nuevo Hospital ISSSTE', cnLasTorresCentro: 'Av. Las Torres', cnAeropuertoPoniente: 'Poniente del Aeropuerto', cnAeropuertoSuroeste: 'Suroeste del Aeropuerto', cnCurvaLaguna: 'Curva hacia Laguna', cnMex180Centro: 'MEX 180 Centro', cnAeropuertoSur: 'Sur del Aeropuerto', cnUniversidad: 'Av. Universidad', cnAirportEste: 'Oriente del Aeropuerto', cnRegresoMadero: 'Regreso a Madero',
  santaElena: 'Santa Elena', colonias: 'Colonias', enriqueCardenas: 'Enrique Cárdenas', centralCamionera: 'Central Camionera', puertoAlegre: 'Puerto Alegre', candelario: 'Candelario Garza', fuerte: 'El Fuerte', penal: 'Penal', primavera: 'Primavera', natividad: 'Natividad Garza Leal', canada: 'Cañada', contadero: 'Ejido Contadero', puertasColoradas: 'Puertas Coloradas', germinal: 'Germinal', divisoria: 'Divisoria', borreguera: 'Borreguera', centralAbastos: 'Central de Abastos', bosque: 'Bosque', casaBlanca: 'Casa Blanca', tierraAlta: 'Tierra Alta', ninosHeroes: 'Niños Héroes',
  ricardoFlores: 'Ricardo Flores Magón', altamiraCentro: 'Altamira Centro', altamiraNorte: 'Altamira Norte', estacionColonias: 'Estación Colonias', ejido3mayo: 'Ej. 3 de Mayo', km40: 'Km. 40', franciscoVilla: 'Francisco Villa', margaritas: 'Las Margaritas', upalt: 'Universidad Politécnica de Altamira', santaAmalia: 'Santa Amalia', cuauhtemoc: 'Cuauhtémoc',
  tancolBosque: 'Tancol / Bosque', colBosque: 'Col. del Bosque', panteon: 'Panteón', heribertoKehoe: 'Heriberto Kehoe', laPaz: 'Col. La Paz', ganadera: 'Ganadera', polvorin: 'Polvorín', playaSur: 'Playa Sur', playaNorte: 'Playa Norte', unidadMorelos: 'Unidad Morelos', arbolGrande: 'Árbol Grande', pedroJoseMendez: 'Pedro José Méndez', carnitasOrta: 'Carnitas Orta', republicaCuba: 'República de Cuba', obrera: 'Col. Obrera', elBlanco: 'El Blanco', kinder: 'Kínder', cetis78: 'CETis 78', bosquesAlt: 'Bosques', serapioBoulevard: 'Serapio Venegas / Blvd.', laCima: 'La Cima', miramarNorte: 'Miramar Norte', universidadSur: 'Universidad Sur', lomaReal: 'Loma Real', hospitalIssste: 'Nuevo Hospital ISSSTE', cobat: 'COBAT', velatorio: 'Velatorio IMSS', saludMujer: 'Centro de Salud de la Mujer'
};

function point(name) {
  const p = P[name];
  if (!p) throw new Error(`Punto no definido: ${name}`);
  return p;
}

function routePath(names) {
  return names.map(point);
}

function stopObjects(names) {
  return names.map((name, index) => {
    const p = point(name);
    return { id: `${name}-${index}`, name: LABELS[name] || name, lat: p[0], lng: p[1] };
  });
}

function meters(a, b) {
  const R = 6371000;
  const lat1 = a[0] * Math.PI / 180;
  const lat2 = b[0] * Math.PI / 180;
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLng = (b[1] - a[1]) * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function densify(path, stepMeters = 120) {
  if (!Array.isArray(path) || path.length < 2) return path || [];
  const out = [path[0]];
  for (let i = 1; i < path.length; i += 1) {
    const a = path[i - 1];
    const b = path[i];
    const seg = meters(a, b);
    const parts = Math.max(1, Math.ceil(seg / stepMeters));
    for (let j = 1; j <= parts; j += 1) {
      const t = j / parts;
      out.push([Number((a[0] + (b[0] - a[0]) * t).toFixed(6)), Number((a[1] + (b[1] - a[1]) * t).toFixed(6))]);
    }
  }
  return out;
}


const RUTADIRECTA_ROUTE_IDS = {
  '1': 1901, '2': 1902, '3': 1903, '4': 1904, '5': 1905, '6': 1906, '7': 1907, '8': 1908, '9': 1909, '10': 1910,
  '11A': 1911, '11B': 1912, '12': 1913, '13': 1914, '14': 1915, '15': 1916, '16': 1917, '17': 1918, '18': 1919, '19': 1920,
  '20': 1921, '21': 1922, '22': 1923, '23': 1924, '24': 1925, '25': 1926, '26': 1927, '27': 1928, '29': 1930, '31': 1932,
  '32': 1933, '33': 1934, '34': 1935, '35': 1936, '36': 1937, '38': 1939, '39': 1940, '40': 1941, '41': 1942, '42': 1943,
  '43': 1944, '44': 1945, '46': 1947, '47': 1948, '48': 1949, '50': 1951, '51': 1952, '61': 1962, '93': 1998, '94': 1999,
  '96': 2003, '99': 2006, '100A': 2007, '108': 2027, '110': 2029, '115': 2035
};

function slugifyRoute(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function rutaDirectaUrl(number, name) {
  const key = String(number).toUpperCase();
  const id = RUTADIRECTA_ROUTE_IDS[key];
  if (!id) return 'https://rutadirecta.com/city/tampico.tamaulipas';
  const routeNumber = key.replace(/[A-Z]+$/g, '');
  const slug = slugifyRoute(`ruta ${routeNumber} ${name}`);
  return `https://tam.rutadirecta.com/rutas/radial/${id}/${slug}.html`;
}

function route(number, name, shortName, color, names, keywords = []) {
  const id = `r${String(number).replace(/\D/g, '').padStart(3, '0')}${String(number).replace(/\d/g, '').toLowerCase()}`;
  const code = `R${number}`;
  return {
    id, code, number: Number.parseInt(number, 10), name: `Ruta ${number} ${name}`, shortName, color,
    path: [], stops: [],
    keywords: [...new Set([String(number), code.toLowerCase(), ...name.toLowerCase().split(/\s+|-/).filter(Boolean), ...shortName.toLowerCase().split(/\s+|-/).filter(Boolean), ...keywords])],
    city: 'Tampico, Ciudad Madero y Altamira',
    type: 'Radial / urbano',
    source: 'RutaDirecta',
    sourceLabel: 'Ver ficha en RutaDirecta',
    sourceUrl: rutaDirectaUrl(number, name),
    geometryStatus: 'rutadirecta-externa',
    updatedFromSource: '2026-06-13'
  };
}

const ROUTES = [
  route(1, 'Mirador - Aviación por Boulevard', 'Mirador - Aviación', '#0ea5e9', ['mirador','mercado','centro','hidalgoSur','hidalgoCentro','hidalgo','charro','aviacion','aeropuerto'], ['boulevard','aeropuerto']),
  route(2, 'Tampico - Bosque - Central de Abastos - Casa Blanca', 'Tampico - Casa Blanca', '#16a34a', ['centro','hidalgoSur','hidalgo','hidalgoNorte','centralAbastos','bosque','casaBlanca'], ['bosque','central de abastos']),
  route(3, 'Madero - Revolución Verde - Central de Abastos', 'Madero - Central de Abastos', '#f59e0b', ['maderoCentro','aguila','echeverria','revolucionVerde','unidadNacional','divisoria','centralAbastos'], ['madero','revolucion verde']),
  route(4, 'Colosio - Águila - Madero - Golfo', 'Colosio - Madero - Golfo', '#ef4444', ['colosio','aguila','maderoCentro','maderoNorte','golfo'], ['colosio','golfo']),
  route(5, 'Madero - Blanco Palmas - Albañiles', 'Madero - Albañiles', '#ec4899', ['maderoCentro','blancoPalmas','aguila','albaniles'], ['blanco palmas','albaniles']),
  route(6, 'Madero - Revolución Verde - Las Torres', 'Madero - Las Torres', '#f97316', ['maderoCentro','aguila','echeverria','revolucionVerde','lasTorres'], ['las torres','revolucion verde']),
  route(7, 'Tampico - Playa por Boulevard', 'Tampico - Playa', '#22c55e', ['centro','hidalgoSur','hidalgoCentro','hidalgo','charro','maderoCentro','refineria','playaMiramar','escolleras'], ['playa','miramar','boulevard']),
  route(8, 'Seguro Social - Lomas de Infonavit', 'IMSS - Lomas Infonavit', '#38bdf8', ['centro','imss','hidalgo','unidadNacional','infonavit','lomasInfonavit'], ['seguro social','imss','hospital']),
  route(9, 'Santa Elena - Colonias - Tampico', 'Santa Elena - Tampico', '#84cc16', ['santaElena','colonias','altamiraCentro','divisoria','hidalgoNorte','hidalgo','centro'], ['santa elena','colonias','altamira']),
  route(10, 'Enrique Cárdenas - Central Camionera - Tampico', 'E. Cárdenas - Central', '#eab308', ['enriqueCardenas','centralAbastos','hidalgoNorte','hidalgo','centralCamionera','centro'], ['central camionera','enrique cardenas']),
  route('11A', 'Puerto Alegre - Candelario Garza - Tampico', 'Puerto Alegre - Tampico', '#c084fc', ['puertoAlegre','candelario','germinal','hidalgo','centro'], ['puerto alegre','candelario garza']),
  route('11B', 'Tampico - Colonias - El Fuerte - Penal por Av. Hidalgo y Ayuntamiento', 'Tampico - El Fuerte - Penal', '#8b5cf6', ['centro','hidalgo','hidalgoNorte','divisoria','fuerte','penal'], ['el fuerte','penal','ayuntamiento']),
  route(12, 'Morelos - Moralillo', 'Morelos - Moralillo', '#14b8a6', ['centro','morelos','moralillo'], ['morelos','moralillo']),
  route(13, 'Col. Primavera - Natividad Garza Leal', 'Primavera - Natividad', '#a855f7', ['primavera','natividad','germinal','divisoria'], ['primavera','natividad']),
  route(14, 'Tampico - Cañada', 'Tampico - Cañada', '#64748b', ['centro','hidalgo','valle','canada'], ['cañada','canada']),
  route(15, 'Madero - UAT - Niños Héroes', 'Madero - UAT - Niños Héroes', '#06b6d4', ['maderoCentro','aguila','universidad','uat','ninosHeroes'], ['uat','niños heroes','universidad']),
  route(16, 'Ejido Contadero - Germinal - Águila', 'Contadero - Germinal - Águila', '#0f766e', ['contadero','candelario','germinal','unidadNacional','aguila'], ['contadero','aguila']),
  route(17, 'Maun - Revolución Verde - Madero', 'Maun - Madero', '#fb7185', ['maun','revolucionVerde','echeverria','aguila','maderoCentro'], ['maun','revolucion verde']),
  route(18, 'Tampico - Universidad - Echeverría', 'Tampico - Universidad - Echeverría', '#3b82f6', ['centro','hidalgo','universidad','aguila','echeverria'], ['universidad','echeverria']),
  route(19, 'Nuevo Madero - Serapio Venegas', 'Nuevo Madero - Serapio', '#f43f5e', ['nuevoMadero','serapio','maderoCentro','aguila','hidalgo','centro'], ['serapio venegas']),
  route(20, 'Miramar - Borreguera - Madero', 'Miramar - Borreguera - Madero', '#0891b2', ['playaMiramar','refineria','maderoCentro','unidadNacional','divisoria','borreguera'], ['miramar','borreguera']),
  route(21, 'Fovisste - Lucio Blanco', 'Fovisste - Lucio Blanco', '#0284c7', ['fovisste','lucioBlanco','nuevoMadero','serapio'], ['fovisste','lucio blanco']),
  route(22, 'Tampico - Borreguera por Boulevard', 'Tampico - Borreguera', '#10b981', ['centro','hidalgoSur','hidalgo','charro','unidadNacional','divisoria','borreguera'], ['borreguera','boulevard']),
  route(23, 'E. Cárdenas González - Universidad', 'E. Cárdenas - Universidad', '#facc15', ['enriqueCardenas','centralAbastos','hidalgoNorte','universidad','uat'], ['universidad','cardenas']),
  route(25, 'Madero - Col. Echeverría', 'Madero - Echeverría', '#dc2626', ['maderoCentro','aguila','echeverria'], ['echeverria']),
  route(26, 'Tampico - Puertas Coloradas - Divisoria', 'Puertas Coloradas - Divisoria', '#f43f5e', ['centro','morelos','puertasColoradas','germinal','divisoria'], ['puertas coloradas']),
  route(27, 'Tampico - Santa Elena', 'Tampico - Santa Elena', '#4ade80', ['centro','hidalgo','hidalgoNorte','centralAbastos','santaElena'], ['santa elena']),
  route(24, 'Tampico - Tancol - Col. del Bosque', 'Tampico - Tancol - Bosque', '#22d3ee', ['centro','hidalgo','hidalgoNorte','tancol','tancolBosque','colBosque'], ['tancol','col del bosque']),
  route(29, 'Águila Echeverría - Panteón', 'Águila - Echeverría - Panteón', '#fb923c', ['aguila','echeverria','heribertoKehoe','panteon'], ['panteon','aguila','echeverria']),
  route(32, 'Madero - Heriberto Kehoe - Las Flores', 'Madero - Heriberto Kehoe', '#f97316', ['maderoCentro','arbolGrande','heribertoKehoe','lasFlores'], ['heriberto kehoe','las flores']),
  route(33, 'Madero - La Paz', 'Madero - La Paz', '#dc2626', ['maderoCentro','arbolGrande','laPaz'], ['la paz','madero']),
  route(35, 'Madero - Ganadera - Niños Héroes', 'Madero - Ganadera', '#e11d48', ['maderoCentro','unidadNacional','uat','ninosHeroes','ganadera'], ['ganadera','niños heroes']),
  route(36, 'Santa Amalia - Polvorín - Madero', 'Santa Amalia - Madero', '#7c3aed', ['santaAmalia','altamiraCentro','polvorin','divisoria','unidadNacional','maderoCentro'], ['santa amalia','polvorin']),
  route(39, 'Playa Sur - Refinería', 'Playa Sur - Refinería', '#f43f5e', ['playaSur','escolleras','refineria'], ['playa sur','refineria']),
  route(40, 'Playa Norte - Refinería', 'Playa Norte - Refinería', '#ec4899', ['playaNorte','miramarNorte','playaMiramar','refineria'], ['playa norte','refineria']),
  route(41, 'Unidad Morelos UAT - Madero - Col. Árbol Grande', 'Morelos UAT - Árbol Grande', '#0ea5e9', ['unidadMorelos','centro','universidad','uat','maderoCentro','arbolGrande'], ['unidad morelos','arbol grande','uat']),
  route(42, 'Pedro José Méndez - Carnitas Orta', 'Pedro J. Méndez - Orta', '#14b8a6', ['pedroJoseMendez','centro','hidalgoSur','carnitasOrta'], ['pedro jose mendez','carnitas orta']),
  route(43, 'Aviación por Boulevard', 'Aviación por Boulevard', '#38bdf8', ['centro','hidalgoSur','hidalgoCentro','hidalgo','charro','aviacion'], ['aviacion','boulevard']),
  route(44, 'Obrera por República de Cuba', 'Obrera - Rep. de Cuba', '#facc15', ['centro','republicaCuba','obrera','hidalgoSur'], ['obrera','republica de cuba']),
  route(46, 'El Blanco - Kínder - Las Flores', 'El Blanco - Las Flores', '#a3e635', ['elBlanco','kinder','heribertoKehoe','lasFlores'], ['el blanco','kinder','las flores']),
  route(47, 'CETis 78 - Bosques por Boulevard', 'CETis 78 - Bosques', '#10b981', ['centro','hidalgo','hidalgoNorte','cetis78','bosquesAlt'], ['cetis 78','bosques','boulevard']),
  route(48, 'Germinal por Boulevard', 'Germinal por Boulevard', '#84cc16', ['centro','hidalgo','hidalgoNorte','germinal'], ['germinal','boulevard']),
  route(31, 'Tierra Alta - Niños Héroes - Casa Blanca', 'Tierra Alta - Casa Blanca', '#7c3aed', ['tierraAlta','ninosHeroes','centralAbastos','bosque','casaBlanca'], ['tierra alta','casa blanca']),
  route(34, 'Las Flores - Madero', 'Las Flores - Madero', '#a855f7', ['lasFlores','maderoNorte','maderoCentro','aguila','centro'], ['las flores']),
  route(38, 'Circuito Norte', 'Circuito Norte', '#ef3b2d', [
    'maderoCentro','cnFranciscoIMadero','cnMex180Oriente','cnMonterreySur','cnMonterreyMid','serapioBoulevard',
    'cnMonterreyAeropuerto','cnMonterreyNorte','cnFovisste','cnCordoba','cnAirportNorte','cnTancol','cnCementerioTancol',
    'cnLasTorresNorte','cobat','velatorio','saludMujer','hospitalIssste','lomaReal','cnLasTorresCentro',
    'cnAeropuertoPoniente','cnAeropuertoSuroeste','cnCurvaLaguna','cnMex180Centro','cnAeropuertoSur','cnUniversidad',
    'cnAirportEste','cnRegresoMadero','cnMonterreySur','cnMex180Oriente','cnFranciscoIMadero','maderoCentro'
  ], ['circuito norte','tancol','av las torres','aeropuerto','madero','issste','cobat','centro de salud de la mujer','velatorio imss','loma real']),
  route(50, 'Colonia Del Valle', 'Colonia Del Valle', '#14b8a6', ['centro','hidalgo','valle','germinal'], ['colonia del valle']),
  route(51, 'Serapio Venegas por Boulevard', 'Serapio por Boulevard', '#22c55e', ['centro','hidalgo','charro','serapioBoulevard','serapio'], ['serapio venegas','boulevard']),
  route(61, 'Obrera - Penal', 'Obrera - Penal', '#eab308', ['centro','hidalgo','germinal','penal'], ['obrera','penal']),
  route(69, 'Madero - Candelario Garza', 'Madero - Candelario', '#ef4444', ['maderoCentro','unidadNacional','divisoria','candelario'], ['candelario garza']),
  route(93, 'Ejido Ricardo Flores Magón - Altamira', 'Ricardo Flores - Altamira', '#4ade80', ['ricardoFlores','altamiraCentro'], ['ricardo flores magon','altamira']),
  route(94, 'Altamira - Estación Colonias - Ej. 3 de Mayo', 'Altamira - Estación Colonias', '#84cc16', ['altamiraCentro','estacionColonias','ejido3mayo'], ['estacion colonias','3 de mayo']),
  route(96, 'Altamira - Km. 40', 'Altamira - Km. 40', '#65a30d', ['altamiraCentro','estacionColonias','km40'], ['km 40','kilometro 40']),
  route(99, 'Altamira - Francisco Villa - Las Margaritas', 'Altamira - Las Margaritas', '#2dd4bf', ['altamiraCentro','franciscoVilla','margaritas'], ['francisco villa','margaritas']),
  route('100A', 'Infonavit - Altamira - Tampico por Av. Ayuntamiento y Av. Hidalgo', 'Infonavit - Altamira - Tampico', '#06b6d4', ['infonavit','divisoria','altamiraCentro','hidalgoNorte','hidalgo','centro'], ['infonavit','altamira','ayuntamiento']),
  route(108, 'Cuauhtémoc - Tampico - Universidad Politécnica de Altamira por Av. Hidalgo y Ayuntamiento', 'Cuauhtémoc - Tampico - UPALT', '#2563eb', ['cuauhtemoc','upalt','altamiraCentro','divisoria','hidalgoNorte','hidalgo','centro'], ['cuauhtemoc','upalt','universidad politecnica']),
  route(110, 'Universidad Politécnica de Altamira - Santa Amalia - Germinal', 'UPALT - Santa Amalia - Germinal', '#6366f1', ['upalt','santaAmalia','altamiraCentro','borreguera','germinal'], ['upalt','santa amalia'])
,
  route(115, 'Altamira - Zapata por Arboledas', 'Altamira - Zapata', '#059669', ['altamiraCentro','cuauhtemoc','altamiraNorte','franciscoVilla','margaritas'], ['zapata','arboledas','altamira'])
].sort((a, b) => a.number - b.number || a.code.localeCompare(b.code));

function routeById(routeId) {
  return ROUTES.find((r) => r.id === routeId) || null;
}

module.exports = { ROUTES, routeById, CENTER };
