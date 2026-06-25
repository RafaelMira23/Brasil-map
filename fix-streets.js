import fs from 'fs';

// Common Brazilian street prefixes for generating realistic-sounding street names
const prefixes = [
  "Rua", "Avenida", "Travessa", "Alameda", "Praça", "Rua", "Avenida", "Rua"
];

const surnames = [
  "Santos", "Oliveira", "Silva", "Souza", "Pereira", "Costa", "Rodrigues",
  "Almeida", "Nascimento", "Lima", "Araújo", "Fernandes", "Carvalho", "Gomes",
  "Martins", "Ribeiro", "Barros", "Cardoso", "Melo", "Castro", "Monteiro",
  "Moreira", "Mendes", "Vieira", "Correia", "Barbosa", "Rocha", "Dias",
  "Freitas", "Borges", "Cunha", "Ramos", "Teixeira", "Pinto", "Nunes",
  "Fonseca", "Campos", "Maia", "Macedo", "Resende", "Duarte", "Coelho",
  "Andrade", "Peixoto", "Brito", "Lopes", "Faria", "Machado", "Guimarães",
  "Sampaio", "Alencar", "Tavares", "Vasconcelos", "Aguiar", "Marques",
  "Nogueira", "Lacerda", "Siqueira", "Moura", "Medeiros", "Azevedo",
  "Batista", "Miranda", "Brandão", "Soares", "Xavier", "Reis", "Bezerra",
  "Cavalcanti", "Barreto", "Sales"
];

const firstNames = [
  "Pedro", "João", "Maria", "José", "Francisco", "Antônio", "Carlos",
  "Paulo", "Manuel", "Luís", "Ana", "Benedito", "Raimundo", "Sebastião",
  "Joaquim", "Alberto", "Henrique", "Fernando", "Geraldo", "Marcos",
  "Alexandre", "Eduardo", "Afonso", "Getúlio", "Juscelino", "Marechal",
  "Dom", "Padre", "Doutor", "Coronel", "General", "Vereador"
];

function generateStreetName() {
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const useFull = Math.random() > 0.4;
  if (useFull) {
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = surnames[Math.floor(Math.random() * surnames.length)];
    return `${prefix} ${first} ${last}`;
  } else {
    const last = surnames[Math.floor(Math.random() * surnames.length)];
    return `${prefix} ${last}`;
  }
}

const data = JSON.parse(fs.readFileSync('./public/pessoas.json', 'utf8'));

// Fix entries where the street is just a single word (like "Padaria", "Escola", etc.)
let fixedCount = 0;
data.forEach(p => {
  const street = p.address.street;
  // If street doesn't contain a space OR is a known bad pattern
  const isBadStreet = !street.includes(' ') || 
    ["Padaria", "Escola", "Farmacia", "Hospital", "Banco", "Supermercado", 
     "Igreja", "Restaurante", "Posto", "Hotel", "Correios", "Policia",
     "Prefeitura", "Museu", "Teatro", "Aeroporto", "Shopping", "Mercado",
     "Oficina", "Bar", "Lanchonete", "Loja", "Academia", "Parque", 
     "Sorveteria", "Dentista"].some(bad => 
      street.toLowerCase().startsWith(bad.toLowerCase()));
  
  if (isBadStreet) {
    p.address.street = generateStreetName();
    p.address.full = `${p.address.street}, ${p.address.number} - ${p.address.city}/${p.address.state}`;
    fixedCount++;
  }
});

fs.writeFileSync('./public/pessoas.json', JSON.stringify(data, null, 2));
console.log(`Fixed ${fixedCount} entries with bad street names.`);
console.log("Sample addresses:");
data.slice(0, 10).forEach(p => console.log("  ", p.address.full));
