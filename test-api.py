import urllib.request
import urllib.parse
import json

query = """
[out:json][timeout:25];
area["ISO3166-1"="BR"][admin_level=2]->.searchArea;
node["addr:street"]["addr:city"](area.searchArea)(0, 1000);
out body;
"""

url = "https://overpass-api.de/api/interpreter"
data = urllib.parse.urlencode({'data': query}).encode('utf-8')
req = urllib.request.Request(url, data=data)

try:
    with urllib.request.urlopen(req) as response:
        res = json.loads(response.read().decode('utf-8'))
        print(f"Success! Got {len(res.get('elements', []))} elements.")
except Exception as e:
    print(f"Error: {e}")
