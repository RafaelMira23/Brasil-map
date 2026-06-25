import axios from 'axios';

const query = `
[out:json][timeout:25];
area["ISO3166-1"="BR"][admin_level=2]->.searchArea;
node["addr:street"]["addr:city"](area.searchArea)(0, 1000);
out body;
`;

async function test() {
  try {
    const res = await axios.get('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'BrazilMapApp/1.0 (Contact: myemail@example.com)'
      }
    });
    console.log(`Success! Got ${res.data.elements.length} elements.`);
  } catch (e) {
    console.log(`Error: ${e.message}`);
    if (e.response) {
      console.log(`Status: ${e.response.status}`);
      console.log(`Data: ${e.response.data}`);
    }
  }
}
test();
