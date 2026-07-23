// Cache de coordenadas no localStorage para economizar requisições
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

// Geocodificação assíncrona com Nominatim (OSM) e fallback inteligente
export async function geocodeAccountAddress(street, city, state, zip) {
  const cleanStreet = (street || '').trim();
  const cleanCity = (city || '').trim();
  const cleanState = (state || '').trim();
  const cleanZip = (zip || '').toString().trim();

  const fullAddressKey = `${cleanStreet}|${cleanCity}|${cleanState}|${cleanZip}`.toUpperCase();

  const cache = getCache();
  if (cache[fullAddressKey]) {
    return cache[fullAddressKey];
  }

  // Tentar buscar no Nominatim do OpenStreetMap se houver rua informada
  if (cleanStreet) {
    try {
      const query = encodeURIComponent(`${cleanStreet}, ${cleanCity} ${cleanState}, Brasil`);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
        headers: {
          'Accept-Language': 'pt-BR,pt;q=0.9',
          'User-Agent': 'BrasilMapApp/1.0'
        }
      });

      if (response.ok) {
        const results = await response.json();
        if (results && results.length > 0) {
          const lat = parseFloat(results[0].lat);
          const lon = parseFloat(results[0].lon);
          const coords = [lat, lon];

          cache[fullAddressKey] = coords;
          setCache(cache);
          return coords;
        }
      }
    } catch (err) {
      // Falha de rede ou rate limit, continuar para o fallback
    }
  }

  return null;
}
