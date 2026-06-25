import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./public/pessoas.json', 'utf-8'));

data.forEach(p => {
    // Generate simple deterministic "random" properties based on name length to avoid external deps
    const rand = p.fullName.length;
    p.age = 18 + (rand * 7) % 60; 
    p.status = rand % 2 === 0 ? "Ativo" : "Inativo";
    p.gender = rand % 3 === 0 ? "Masculino" : "Feminino";
});

fs.writeFileSync('./public/pessoas.json', JSON.stringify(data, null, 2));
console.log("Updated pessoas.json locally with new fields!");
