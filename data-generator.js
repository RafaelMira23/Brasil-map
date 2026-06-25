import fs from 'fs';
import { fakerPT_BR as faker } from '@faker-js/faker';

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

    // Duplicate if needed to reach 1000
    const uniqueCount = realAddresses.length;
    while (realAddresses.length < 1000 && realAddresses.length > 0) {
        realAddresses.push(realAddresses[Math.floor(Math.random() * uniqueCount)]);
    }
    realAddresses = realAddresses.slice(0, 1000);

    const people = [];
    for (let i = 0; i < 1000; i++) {
        const addr = realAddresses[i];
        const hasMiddleName = Math.random() > 0.5;
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const middleName = hasMiddleName ? faker.person.lastName() : undefined;
        const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ");

        // Use the REAL house_number from Nominatim if available.
        // If the API didn't return one, generate a realistic Brazilian number (1-9999).
        let street = addr.address?.road || addr.address?.pedestrian || addr.display_name?.split(',')[0] || "Rua Principal";
        let number = addr.address?.house_number || String(Math.floor(Math.random() * 2000) + 1);
        let city = addr.address?.city || addr.address?.town || addr.address?.village || addr.address?.municipality || "Cidade";
        let state = addr.address?.state || addr.address?.state_district || "Brasil";

        people.push({
            id: faker.string.uuid(),
            firstName,
            lastName,
            middleName,
            fullName,
            address: {
                street,
                number,
                city,
                state,
                full: `${street}, ${number} - ${city}/${state}`
            },
            coordinates: [parseFloat(addr.lat), parseFloat(addr.lon)]
        });
    }

    fs.writeFileSync('./public/pessoas.json', JSON.stringify(people, null, 2));
    console.log("Gerado 1000 pessoas em public/pessoas.json");
}

generateData();
