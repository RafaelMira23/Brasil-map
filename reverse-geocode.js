import fs from 'fs';

// Load existing data (we keep the real coordinates, just fix the addresses)
const data = JSON.parse(fs.readFileSync('./public/pessoas.json', 'utf8'));

// Deduplicate coordinates to minimize API calls
const uniqueCoords = new Map();
data.forEach((p, i) => {
  const key = `${p.coordinates[0]},${p.coordinates[1]}`;
  if (!uniqueCoords.has(key)) {
    uniqueCoords.set(key, { lat: p.coordinates[0], lon: p.coordinates[1], indices: [i] });
  } else {
    uniqueCoords.get(key).indices.push(i);
  }
});

console.log(`Total people: ${data.length}`);
console.log(`Unique coordinates: ${uniqueCoords.size}`);
console.log(`Estimated time: ~${Math.ceil(uniqueCoords.size * 1.1 / 60)} minutes`);
console.log('Starting reverse geocoding...\n');

let processed = 0;
let successCount = 0;
let failCount = 0;

const entries = Array.from(uniqueCoords.values());

async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&zoom=18`;
  const res = await fetch(url, { 
    headers: { 'User-Agent': 'BrazilMapApp/1.0 (local educational project)' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function processAll() {
  for (const entry of entries) {
    try {
      const result = await reverseGeocode(entry.lat, entry.lon);
      const addr = result.address || {};
      
      const street = addr.road || addr.pedestrian || addr.street || null;
      const number = addr.house_number || null;
      const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || null;
      const state = addr.state || null;
      
      if (street && city && state) {
        // Build a real address string
        const fullAddr = number 
          ? `${street}, ${number} - ${city}/${state}`
          : `${street} - ${city}/${state}`;
        
        // Apply to all people at this coordinate
        entry.indices.forEach(idx => {
          data[idx].address.street = street;
          data[idx].address.number = number || 's/n';
          data[idx].address.city = city;
          data[idx].address.state = state;
          data[idx].address.full = fullAddr;
        });
        successCount += entry.indices.length;
      } else {
        failCount += entry.indices.length;
      }
    } catch (e) {
      failCount += entry.indices.length;
      // If rate limited (429), wait extra
      if (e.message.includes('429')) {
        console.log('  Rate limited, waiting 5s...');
        await new Promise(r => setTimeout(r, 5000));
      }
    }
    
    processed++;
    if (processed % 25 === 0 || processed === entries.length) {
      const pct = ((processed / entries.length) * 100).toFixed(1);
      console.log(`[${pct}%] ${processed}/${entries.length} coords | ${successCount} OK | ${failCount} failed`);
    }
    
    // Respect rate limit: 1 req/sec
    await new Promise(r => setTimeout(r, 1100));
  }
  
  fs.writeFileSync('./public/pessoas.json', JSON.stringify(data, null, 2));
  console.log(`\nDone! ${successCount} addresses fixed, ${failCount} unchanged.`);
  console.log('Sample addresses:');
  data.slice(0, 10).forEach(p => console.log('  ', p.address.full));
}

processAll();
