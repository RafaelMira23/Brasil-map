import fs from 'fs';
import * as XLSX from 'xlsx';

const data = JSON.parse(fs.readFileSync('./public/pessoas.json', 'utf8'));

const cityMap = {};
data.forEach((p) => {
  const key = `${p.address.city}|${p.address.state}`;
  if (!cityMap[key]) {
    cityMap[key] = {
      city: p.address.city,
      state: p.address.state,
      lat: 0,
      lng: 0,
      count: 0,
    };
  }
  cityMap[key].lat += p.coordinates[0];
  cityMap[key].lng += p.coordinates[1];
  cityMap[key].count++;
});

Object.values(cityMap).forEach((c) => {
  c.lat /= c.count;
  c.lng /= c.count;
});

const cityCoords = Object.values(cityMap);
fs.writeFileSync('./public/city-coords.json', JSON.stringify(cityCoords, null, 2));

const people = data.map((p, index) => ({
  'Name': p.fullName || '',
  'N Number': `SESA-${String(index + 1).padStart(4, '0')}`,
  'Email': `${p.firstName?.toLowerCase() || ''}.${p.lastName?.toLowerCase() || ''}@empresa.com.br`,
  'Manager name': `Manager ${String.fromCharCode(65 + (index % 26))}`,
  'City': p.address.city || '',
  'State': p.address.state || '',
  'Lat': p.coordinates[0],
  'Lng': p.coordinates[1],
}));

const ws = XLSX.utils.json_to_sheet(people);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Pessoas');
XLSX.writeFile(wb, './public/pessoas.xlsx');

console.log('Generated city-coords.json and pessoas.xlsx');
