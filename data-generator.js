import fs from 'fs';
import { fakerPT_BR as faker } from '@faker-js/faker';
import * as XLSX from 'xlsx';

async function generateData() {
    const terms = [
        "padaria", "escola", "farmacia", "hospital", "banco", 
        "supermercado", "igreja", "restaurante", "posto", "hotel", 
        "correios", "policia", "prefeitura", "praça", "museu", 
        "teatro", "estação", "aeroporto", "universidade", "shopping",
        "mercado", "clínica", "oficina", "bar", "lanchonete",
        "loja", "academia", "pet shop", "parque", "sorveteria", "dentista", "cartório"
    ];

    let realAddresses = [];
    console.log("Fetching real addresses from Nominatim...");
    
    for(const term of terms) {
        if(realAddresses.length >= 1000) break;
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(term)}&countrycodes=br&format=json&addressdetails=1&limit=50`;
        try {
            const res = await fetch(url, { headers: { 'User-Agent': 'BrazilMapApp/1.0' } });
            if (res.ok) {
                const data = await res.json();
                realAddresses.push(...data);
                console.log(`Got ${data.length} results for ${term}. Total: ${realAddresses.length}`);
            }
        } catch(e) {
            console.error(`Error fetching ${term}:`, e);
        }
        await new Promise(r => setTimeout(r, 1200));
    }

    const uniqueCount = realAddresses.length;
    while (realAddresses.length < 1000 && realAddresses.length > 0) {
        realAddresses.push(realAddresses[Math.floor(Math.random() * uniqueCount)]);
    }
    realAddresses = realAddresses.slice(0, 1000);

    const people = [];
    const cityMap = {};
    for (let i = 0; i < 1000; i++) {
        const addr = realAddresses[i];
        const hasMiddleName = Math.random() > 0.5;
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const middleName = hasMiddleName ? faker.person.lastName() : undefined;
        const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ");

        const city = addr.address?.city || addr.address?.town || addr.address?.village || addr.address?.municipality || "Cidade";
        const state = addr.address?.state || addr.address?.state_district || "Brasil";
        const lat = parseFloat(addr.lat);
        const lng = parseFloat(addr.lon);

        const key = `${city}|${state}`;
        if (!cityMap[key]) {
            cityMap[key] = { city, state, lat: 0, lng: 0, count: 0 };
        }
        cityMap[key].lat += lat;
        cityMap[key].lng += lng;
        cityMap[key].count++;

        people.push({
            "id": faker.string.uuid(),
            "firstName": firstName,
            "lastName": lastName,
            "middleName": middleName,
            "fullName": fullName,
            "address": {
                "street": addr?.address?.road || faker.location.street(),
                "number": Math.floor(Math.random() * 2000).toString(),
                "city": city,
                "state": state,
                "full": `${city}/${state}`
            },
            "coordinates": [lat, lng],
        });
    }

    Object.values(cityMap).forEach((c) => {
        c.lat /= c.count;
        c.lng /= c.count;
    });

    const ws = XLSX.utils.json_to_sheet(people);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pessoas");
    XLSX.writeFile(wb, './public/pessoas.xlsx');

    fs.writeFileSync('./public/pessoas.json', JSON.stringify(people, null, 2));
    fs.writeFileSync('./public/city-coords.json', JSON.stringify(Object.values(cityMap), null, 2));
    console.log("Gerado public/pessoas.xlsx e public/city-coords.json");
}

generateData().catch(console.error);
