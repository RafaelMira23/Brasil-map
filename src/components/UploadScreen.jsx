import React from 'react';
import * as XLSX from 'xlsx';

// Estados litorâneos: no fallback por UF, evitamos jogar o jitter para
// LESTE (que empurra o ponto pro oceano).
const COASTAL_STATES = new Set(['AL','BA','CE','ES','MA','PA','PB','PE','PI','RJ','RN','RS','SC','SE','SP','AP']);

function toTitleCase(str) {
  if (!str) return str;
  const lowerWords = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);
  return str
    .toLowerCase()
    .split(' ')
    .map((word, i) => (i > 0 && lowerWords.has(word)) ? word : word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function normalize(str) {
  return (str || '')
    .toString()
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Pega o valor da primeira coluna existente dentre uma lista de aliases
// (case-insensitive), pra não depender de nomes exatos de coluna no Excel.
function getField(row, aliases) {
  const keys = Object.keys(row);
  for (const alias of aliases) {
    const found = keys.find(k => normalize(k) === normalize(alias));
    if (found && row[found] !== undefined && row[found] !== null && row[found] !== '') {
      return row[found];
    }
  }
  return '';
}

// Jitter determinístico (não aleatório) baseado no nome da cidade, pra
// distribuir visualmente pessoas de uma mesma cidade não-geocodificada sem
// gerar posições diferentes a cada upload.
function hashJitter(seed, uf) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff;
  }
  const angle = (Math.abs(hash) % 360) * (Math.PI / 180);
  const radius = 0.12;
  let lngOffset = Math.cos(angle) * radius;
  if (COASTAL_STATES.has(uf)) lngOffset = -Math.abs(lngOffset);
  return { latOffset: Math.sin(angle) * radius, lngOffset };
}

export default function UploadScreen({ onDataLoaded, onTriggerMock, CATEGORIES, GEODB, STATE_CENTERS }) {

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);

        let geocodedCount = 0;
        let fallbackCount = 0;
        let droppedCount = 0;

        const parsed = json.map((row, idx) => {
          const name = getField(row, ['Vendedor', 'Person Full Name', 'Nome', 'Nome Completo']) || 'Sem Nome';
          const email = getField(row, ['Person Work Email', 'Email', 'E-mail']);
          const id = getField(row, ['SESA Number', 'Número', 'Numero', 'Matrícula', 'Matricula']) || `ID-${idx}`;
          const manager = getField(row, ['Manager Full Name', 'Gerente', 'Gestor']);
          const phone = getField(row, ['Phone', 'Telefone', 'Celular']);
          const street = getField(row, ['Street', 'Endereço', 'Endereco', 'Address']);
          const rawCity = getField(row, ['City of Work', 'Cidade de Trabalho', 'Cidade']);
          const rawState = getField(row, ['State of Work', 'Estado', 'UF']);

          // 1) Tenta achar a cidade na base sintética do gerador de testes
          //    (só bate se o Excel usar exatamente os nomes fictícios do mock).
          const cleanCityKey = normalize(rawCity);
          let geoMatch = GEODB[cleanCityKey];

          let coordinates = null;
          let resolvedState = rawState ? normalize(rawState).slice(0, 2) : null;
          let geocoded = false;

          if (geoMatch) {
            coordinates = [geoMatch.lat, geoMatch.lng];
            resolvedState = geoMatch.estado;
            geocoded = true;
            geocodedCount++;
          } else if (resolvedState && STATE_CENTERS[resolvedState]) {
            // 2) Fallback: não temos uma base real de municípios brasileiros
            //    embutida no app. Em vez de descartar a pessoa (o que fazia
            //    todo mundo sumir silenciosamente), posicionamos perto do
            //    centro do estado informado, com um leve jitter determinístico
            //    pra não empilhar todo mundo exatamente no mesmo pixel.
            const center = STATE_CENTERS[resolvedState];
            const { latOffset, lngOffset } = hashJitter(rawCity || name, resolvedState);
            coordinates = [center[0] + latOffset, center[1] + lngOffset];
            geocoded = false;
            fallbackCount++;
          } else {
            // 3) Sem cidade reconhecida e sem UF válida: não dá pra plotar.
            droppedCount++;
          }

          // Parsing da coluna Vendedores/Categoria, tolerante a maiúsculas/
          // minúsculas e espaços extras.
          const vendedoresRaw = getField(row, ['Vendedores', 'Categoria', 'Área', 'Area']);
          let categoria = 'Sem Categoria';
          let categoria_foco = null;

          if (vendedoresRaw) {
            const parts = vendedoresRaw.split(' - ');
            categoria = parts[0] ? parts[0].trim() : 'Sem Categoria';
            if (parts[1]) categoria_foco = parts[1].trim();
          }

          const catObj = CATEGORIES.find(c => normalize(c.acronym) === normalize(categoria))
            || { acronym: categoria, color: '#888888' };

          return {
            id,
            nNumber: id,
            name,
            email,
            phone,
            street,
            managerName: manager,
            city: geoMatch ? geoMatch.displayName : (rawCity ? toTitleCase(rawCity) : 'Não Mapeada'),
            state: resolvedState,
            coordinates,
            category: catObj,
            subcategory: categoria_foco,
            geocoded
          };
        }).filter(p => p.coordinates !== null);

        onDataLoaded(parsed);

        if (fallbackCount > 0 || droppedCount > 0) {
          alert(
            `Importação concluída: ${geocodedCount} geocodificados, ` +
            `${fallbackCount} posicionados aproximadamente (centro do estado, ` +
            `cidade não reconhecida) e ${droppedCount} descartados por falta ` +
            `de cidade/UF válida.`
          );
        }
      } catch (err) {
        alert("Erro ao ler o arquivo Excel. Verifique o formato das colunas.");
        console.error(err);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw', background: '#f1f5f9', fontFamily: 'sans-serif', padding: '20px', boxSizing: 'border-box' }}>
      <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
        <h1 style={{ fontSize: '24px', color: '#1e293b', marginBottom: '8px', fontWeight: '700' }}>Brasil Map</h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '30px' }}>Carregue a base de dados para visualização geográfica</p>

        <label style={{ display: 'block', background: '#00A950', color: '#fff', padding: '14px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', marginBottom: '16px', transition: 'background 0.2s' }}>
          Selecionar Arquivo Excel (.xlsx)
          <input type="file" accept=".xlsx" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>

        <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <div style={{ height: '1px', background: '#cbd5e1', flex: 1 }}></div>
          <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>ou</span>
          <div style={{ height: '1px', background: '#cbd5e1', flex: 1 }}></div>
        </div>

        <button onClick={onTriggerMock} style={{ width: '100%', background: '#3b82f6', color: '#fff', padding: '14px 20px', borderRadius: '8px', fontWeight: '600', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}>
          Ativar Gerador de Testes (27 Estados)
        </button>
      </div>
    </div>
  );
}