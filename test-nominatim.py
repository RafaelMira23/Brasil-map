import time
import requests
import json

cities = [
    "São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", 
    "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Goiânia", 
    "Belém", "Porto Alegre", "Guarulhos", "Campinas", "São Luís", 
    "São Gonçalo", "Maceió", "Duque de Caxias", "Campo Grande", "Natal",
    "Teresina", "São Bernardo do Campo", "Nova Iguaçu", "João Pessoa", "Sorocaba"
]

results = []
for city in cities:
    url = f"https://nominatim.openstreetmap.org/search?q=padaria+in+{city},+Brazil&format=json&addressdetails=1&limit=50"
    headers = {'User-Agent': 'BrazilMapApp/1.0'}
    try:
        res = requests.get(url, headers=headers)
        if res.status_code == 200:
            data = res.json()
            results.extend(data)
            print(f"Got {len(data)} results for {city}")
        else:
            print(f"Error {res.status_code} on {city}")
    except Exception as e:
        print(f"Error on {city}: {e}")
    time.sleep(1.2)

# If we need more to reach 1000, let's query farmacias too
if len(results) < 1000:
    for city in cities:
        url = f"https://nominatim.openstreetmap.org/search?q=farmacia+in+{city},+Brazil&format=json&addressdetails=1&limit=50"
        try:
            res = requests.get(url, headers={'User-Agent': 'BrazilMapApp/1.0'})
            if res.status_code == 200:
                data = res.json()
                results.extend(data)
                print(f"Got {len(data)} results for farmacia in {city}")
        except Exception as e:
            pass
        time.sleep(1.2)
        if len(results) >= 1000:
            break

print(f"Total results: {len(results)}")
with open('real_addresses.json', 'w') as f:
    json.dump(results[:1000], f)
