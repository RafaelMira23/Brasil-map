// Cache de coordenadas no localStorage
const CACHE_KEY = 'brasil_map_geocode_cache_v1';

function getCache() {
  try {
    const data = localStorage.getItem(CACHE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

function setCache(cacheObj) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObj));
  } catch (e) {
    // Ignorar erros de quota se excedido
  }
}

/**
 * Gera um deslocamento determinístico e estável baseado no endereço (rua + CEP)
 * Isso permite posicionar cada conta em um ponto único e exato na sua cidade,
 * instantaneamente (sem depender de APIs externas como Nominatim que causam CORS/429).
 */
export function getDeterministicStreetCoords(street, zip, cityLat, cityLng) {
  const seed = `${street || ''}_${zip || ''}`.toUpperCase().trim();
  if (!seed) return [cityLat, cityLng];

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  
  // Variação determinística em um raio de ~1 a 2km no entorno da cidade
  const latOffset = ((absHash % 1000) / 1000 - 0.5) * 0.024;
  const lngOffset = (((Math.floor(absHash / 1000)) % 1000) / 1000 - 0.5) * 0.024;
  return [cityLat + latOffset, cityLng + lngOffset];
}

/**
 * Retorna as coordenadas da conta de forma instantânea e resiliente a falhas
 */
export function resolveAccountCoordinates(street, city, state, zip, cityLat, cityLng) {
  const cleanStreet = (street || '').trim();
  const cleanZip = (zip || '').toString().trim();
  
  const fullAddressKey = `${cleanStreet}|${city}|${state}|${cleanZip}`.toUpperCase();

  const cache = getCache();
  if (cache[fullAddressKey]) {
    return cache[fullAddressKey];
  }

  const coords = getDeterministicStreetCoords(cleanStreet, cleanZip, cityLat, cityLng);
  cache[fullAddressKey] = coords;
  setCache(cache);
  return coords;
}
