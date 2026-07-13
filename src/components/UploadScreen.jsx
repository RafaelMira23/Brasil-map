import React, { useState } from 'react';
import * as XLSX from 'xlsx';

// Utilitários de texto
function toTitleCase(str) {
  if (!str) return str;
  const lowerWords = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);
  return str.toLowerCase().split(' ').map((word, i) =>
    i > 0 && lowerWords.has(word) ? word : word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function normalize(str) {
  return (str || '').toString().trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

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

// Cidades centrais para fallback rápido
const BRAZIL_CITIES = {
  'SAO PAULO': { lat: -23.5505, lng: -46.6333, state: 'SP' },
  'RIO DE JANEIRO': { lat: -22.9068, lng: -43.1729, state: 'RJ' },
  'CURITIBA': { lat: -25.4284, lng: -49.2733, state: 'PR' },
  'BLUMENAU': { lat: -26.9194, lng: -49.0661, state: 'SC' },
  'BELO HORIZONTE': { lat: -19.9167, lng: -43.9345, state: 'MG' },
  'PORTO ALEGRE': { lat: -30.0346, lng: -51.2177, state: 'RS' },
  'GOIANIA': { lat: -16.6869, lng: -49.2648, state: 'GO' },
  'SALVADOR': { lat: -12.9714, lng: -38.5014, state: 'BA' },
  'FORTALEZA': { lat: -3.7319, lng: -38.5267, state: 'CE' },
  'BRASILIA': { lat: -15.7939, lng: -47.8828, state: 'DF' },
  'RECIFE': { lat: -8.0476, lng: -34.8770, state: 'PE' },
  'BELEM': { lat: -1.4558, lng: -48.4902, state: 'PA' },
  'MANAUS': { lat: -3.119, lng: -60.0217, state: 'AM' },
  'NATAL': { lat: -5.7945, lng: -35.211, state: 'RN' },
  'PIRACICABA': { lat: -22.7338, lng: -47.6476, state: 'SP' },
  'PINHAIS': { lat: -25.444, lng: -49.1921, state: 'PR' },
  'BARUERI': { lat: -23.5113, lng: -46.8728, state: 'SP' },
  'CAMPINAS': { lat: -22.9099, lng: -47.0626, state: 'SP' },
  'RIBEIRAO PRETO': { lat: -21.1704, lng: -47.8103, state: 'SP' },
};

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 50%)`;
}

function applyJitter([lat, lng]) {
  // Dispersão aleatória de até ~1-2km para que pinos na mesma cidade não se sobreponham
  const jLat = (Math.random() - 0.5) * 0.03;
  const jLng = (Math.random() - 0.5) * 0.03;
  return [lat + jLat, lng + jLng];
}

export default function UploadScreen({ onDataLoaded, STATE_CENTERS }) {
  const [peopleData, setPeopleData] = useState([]);
  const [oppData, setOppData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  const parseExcel = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          // Opções mínimas para evitar "Bad uncompressed size" e pular erros de formatação complexa do Excel
          const workbook = XLSX.read(data, { type: 'array', cellDates: false, cellStyles: false, cellNF: false, cellText: false });
          const sheetName = workbook.SheetNames[0];
          const json = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' }); // defval garante que a linha não quebre
          resolve(json);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  const handlePeopleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setLoadingText('Processando Pessoas...');
    try {
      const json = await parseExcel(file);
      const parsed = [];

      json.forEach((row, idx) => {
        const name = getField(row, ['Person Full Name']) || 'Sem Nome';
        const email = getField(row, ['Person Work Email']);
        const id = getField(row, ['SESA Number']) || `ID-${idx}`;
        const manager = getField(row, ['Manager Full Name']);
        const rawCity = getField(row, ['City of Work']);
        const catSec = getField(row, ['Categoria']) || 'Sem Categoria';
        
        // Pega De quê com ou sem interrogação
        const deQue = getField(row, ['De quê?', 'De que?', 'De quê', 'De que']);

        const cityKey = normalize(rawCity);
        const cityMatch = BRAZIL_CITIES[cityKey];

        let state = null;
        let coordinates = null;

        if (cityMatch) {
          state = cityMatch.state;
          coordinates = [cityMatch.lat, cityMatch.lng];
        } else {
          return; // Pula se não achou cidade
        }

        // Separa por hífen com espaços " - " ou apenas "-"
        const primaryCategories = deQue ? String(deQue).split(/-/).map(s => s.trim()).filter(Boolean) : [];
        if (primaryCategories.length === 0) primaryCategories.push('Sem Categoria');

        const mainCatStr = primaryCategories[0];
        const categoryObj = {
          acronym: mainCatStr,
          color: stringToColor(mainCatStr)
        };

        parsed.push({
          id, nNumber: id, name, nameNormalized: normalize(name), email, managerName: manager,
          city: rawCity ? toTitleCase(rawCity) : 'Não Mapeada',
          state, coordinates,
          category: categoryObj,
          allCategories: primaryCategories,
          subcategory: catSec,
          geocoded: true
        });
      });

      setPeopleData(parsed);
      alert(`${parsed.length} Pessoas importadas com sucesso!`);
    } catch (err) {
      console.warn("Erro no XLSX:", err);
      alert('Erro ao carregar pessoas. Tente salvar a planilha como .xlsx novamente sem formatações complexas.');
    } finally {
      setLoading(false);
    }
  };

  const handleOppUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setLoadingText('Mapeando Contas...');
    try {
      const json = await parseExcel(file);
      const parsed = [];

      for (let i = 0; i < json.length; i++) {
        const row = json[i];
        
        const accountName = getField(row, ['Account Name']);
        const accountId = getField(row, ['Account ID - 18 characters', 'Account ID']);
        const segment = getField(row, ['Market Segment']);
        const subSegment = getField(row, ['Market Sub-Segment']);
        const owner = getField(row, ['Account Owner']);
        const country = getField(row, ['Country']);
        const state = getField(row, ['State/Province']);
        const city = getField(row, ['City']);
        const street = getField(row, ['Street']);
        const zip = getField(row, ['Zip/Postal Code', 'Zip Code']);
        const profile = getField(row, ['Account Master Profile']);
        const platform = getField(row, ['Platforming zones']);
        const class1 = getField(row, ['Classification Level 1']);
        const class2 = getField(row, ['Classification Level 2']);
        const addInfo = getField(row, ['Local Address Additional Information']);

        if (!accountName) continue;
        
        // Se level 1 é End User, não mostra e não carrega
        if (class1 && normalize(class1).includes('END USER')) {
          continue;
        }

        let coordinates = null;

        // Fallback rápido usando cidade para evitar CORS e limitação da API
        const cKey = normalize(city);
        if (BRAZIL_CITIES[cKey]) {
            coordinates = [BRAZIL_CITIES[cKey].lat, BRAZIL_CITIES[cKey].lng];
        } else if (state && STATE_CENTERS[state.toUpperCase()]) {
            coordinates = STATE_CENTERS[state.toUpperCase()];
        } else {
            // Se cair no fallback padrão do centro do Brasil
            coordinates = [-14.235, -51.925];
        }

        // Adicionar dispersão para que não fiquem todas agrupadas numa pilha perfeita
        const jitteredCoords = applyJitter(coordinates);

        parsed.push({
          id: accountId || `ACC-${i}`,
          name: accountName,
          segment, subSegment, owner, ownerNormalized: normalize(owner),
          country, state, city: city || '', street, zip,
          profile, platform, class1, class2, addInfo,
          coordinates: jitteredCoords,
          geocoded: false
        });
      }

      setOppData(parsed);
      alert(`${parsed.length} Contas importadas com sucesso!`);
    } catch (err) {
      console.warn("Erro no XLSX:", err);
      alert('Erro ao carregar contas. Tente salvar a planilha como .xlsx novamente sem formatações complexas.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    onDataLoaded({
      people: peopleData,
      opportunities: oppData
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '600px', width: '100%' }}>
        <h1 style={{ fontSize: '28px', color: '#0f172a', marginBottom: '8px', fontWeight: '800' }}>Brasil Map</h1>
        <p style={{ fontSize: '15px', color: '#64748b', marginBottom: '40px' }}>Carregue as bases de dados para visualização geográfica</p>

        {loading ? (
          <div style={{ padding: '40px 0' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
            <p style={{ color: '#475569', fontSize: '14px', fontWeight: '500' }}>{loadingText}</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ background: '#f1f5f9', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>1. Base de Pessoas</h3>
                <span style={{ background: peopleData.length > 0 ? '#10b981' : '#cbd5e1', color: peopleData.length > 0 ? '#fff' : '#64748b', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                  {peopleData.length} registros
                </span>
              </div>
              <label style={{ display: 'block', background: '#3b82f6', color: '#fff', padding: '14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}>
                Selecionar Planilha de Pessoas
                <input type="file" accept=".xlsx" onChange={handlePeopleUpload} style={{ display: 'none' }} />
              </label>
            </div>

            <div style={{ background: '#f1f5f9', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>2. Base de Contas</h3>
                <span style={{ background: oppData.length > 0 ? '#10b981' : '#cbd5e1', color: oppData.length > 0 ? '#fff' : '#64748b', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                  {oppData.length} registros
                </span>
              </div>
              <label style={{ display: 'block', background: '#8b5cf6', color: '#fff', padding: '14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}>
                Selecionar Planilha de Contas
                <input type="file" accept=".xlsx" onChange={handleOppUpload} style={{ display: 'none' }} />
              </label>
            </div>

            <button
              onClick={handleFinish}
              disabled={peopleData.length === 0}
              style={{
                marginTop: '20px',
                width: '100%',
                background: peopleData.length > 0 ? '#10b981' : '#94a3b8',
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '16px',
                border: 'none',
                cursor: peopleData.length > 0 ? 'pointer' : 'not-allowed',
                transition: 'background 0.3s'
              }}
            >
              Acessar Mapa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
