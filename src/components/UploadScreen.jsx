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

// Cidades centrais para fallback rápido (Pessoas)
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

// Gerador de cores dinâmicas para categorias
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 50%)`;
}

// Geocodificador de Oportunidades (Nominatim) com cache
const geocodeCache = {};
async function geocodeAddress(addressStr) {
  if (geocodeCache[addressStr]) return geocodeCache[addressStr];
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressStr)}&limit=1`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('API Error');
    const data = await response.json();
    if (data && data.length > 0) {
      const result = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      geocodeCache[addressStr] = result;
      return result;
    }
  } catch (err) {
    console.error(`Geocode failed for: ${addressStr}`, err);
  }
  return null;
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
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const json = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
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
      let droppedCount = 0;

      json.forEach((row, idx) => {
        const name = getField(row, ['Person Full Name']) || 'Sem Nome';
        const email = getField(row, ['Person Work Email']);
        const id = getField(row, ['SESA Number']) || `ID-${idx}`;
        const manager = getField(row, ['Manager Full Name']);
        const rawCity = getField(row, ['City of Work']);
        const catSec = getField(row, ['Categoria']) || 'Sem Categoria';
        const deQue = getField(row, ['De quê']);

        const cityKey = normalize(rawCity);
        const cityMatch = BRAZIL_CITIES[cityKey];

        let state = null;
        let coordinates = null;

        if (cityMatch) {
          state = cityMatch.state;
          coordinates = [cityMatch.lat, cityMatch.lng];
        } else {
          // Se não tem cidade exata, tenta achar pelo menos o estado nas colunas e joga no centro
          droppedCount++;
          return;
        }

        // De quê pode ser: "Vendas - Marketing - Produto"
        const primaryCategories = deQue ? String(deQue).split(' - ').map(s => s.trim()) : ['Sem Categoria'];
        
        // Categoria Principal será a primeira para fins visuais
        const mainCatStr = primaryCategories[0];
        const categoryObj = {
          acronym: mainCatStr,
          color: stringToColor(mainCatStr)
        };

        parsed.push({
          id, nNumber: id, name, email, managerName: manager,
          city: rawCity ? toTitleCase(rawCity) : 'Não Mapeada',
          state, coordinates,
          category: categoryObj,
          allCategories: primaryCategories,
          subcategory: catSec,
          geocoded: true
        });
      });

      setPeopleData(parsed);
      alert(`Importadas ${parsed.length} pessoas. (${droppedCount} descartadas sem cidade mapeada)`);
    } catch (err) {
      alert('Erro ao carregar pessoas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  const handleOppUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setLoadingText('Lendo Oportunidades...');
    try {
      const json = await parseExcel(file);
      const parsed = [];
      
      let totalToGeocode = 0;
      let geocodedSuccess = 0;

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

        // Construir endereço completo para buscar. Ex: "Rua X, Cidade Y, Estado Z, Brasil"
        let addressQuery = '';
        if (street) addressQuery += `${street}, `;
        if (city) addressQuery += `${city}, `;
        if (state) addressQuery += `${state}, `;
        if (country) addressQuery += `${country}`;
        else addressQuery += 'Brasil';

        // Tentar buscar nas cidades pré-definidas se a rua não estiver presente
        let coordinates = null;
        let geocoded = false;

        if (addressQuery && street) {
          setLoadingText(`Geocodificando: ${city || '...'} (${i + 1}/${json.length})`);
          totalToGeocode++;
          const coords = await geocodeAddress(addressQuery);
          if (coords) {
            coordinates = [coords.lat, coords.lng];
            geocoded = true;
            geocodedSuccess++;
          }
          await delay(1000); // 1 requisição por segundo para respeitar o limite do Nominatim
        }

        // Fallback para cidade ou centro do estado
        if (!coordinates) {
          const cKey = normalize(city);
          if (BRAZIL_CITIES[cKey]) {
             coordinates = [BRAZIL_CITIES[cKey].lat, BRAZIL_CITIES[cKey].lng];
          } else if (state && STATE_CENTERS[state.toUpperCase()]) {
             coordinates = STATE_CENTERS[state.toUpperCase()];
          } else {
             coordinates = [-14.235, -51.925]; // Centro Brasil
          }
        }

        parsed.push({
          id: accountId || `OPP-${i}`,
          name: accountName,
          segment, subSegment, owner,
          country, state, city: city || '', street, zip,
          profile, platform, class1, class2, addInfo,
          coordinates,
          geocoded
        });
      }

      setOppData(parsed);
      alert(`Importadas ${parsed.length} oportunidades. (Geocodificadas exatas: ${geocodedSuccess}/${totalToGeocode})`);
    } catch (err) {
      alert('Erro ao carregar oportunidades: ' + err.message);
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f172a', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#1e293b', padding: '40px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', textAlign: 'center', maxWidth: '600px', width: '100%' }}>
        <h1 style={{ fontSize: '28px', color: '#f8fafc', marginBottom: '8px', fontWeight: '800' }}>Brasil Map 2.0</h1>
        <p style={{ fontSize: '15px', color: '#94a3b8', marginBottom: '40px' }}>Carregue as bases de dados para visualização geográfica avançada</p>

        {loading ? (
          <div style={{ padding: '40px 0' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #334155', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
            <p style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>{loadingText}</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Bloco de Pessoas */}
            <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '16px' }}>1. Base de Pessoas</h3>
                <span style={{ background: peopleData.length > 0 ? '#059669' : '#475569', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                  {peopleData.length} registros
                </span>
              </div>
              <label style={{ display: 'block', background: '#3b82f6', color: '#fff', padding: '14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}>
                Selecionar Planilha de Pessoas
                <input type="file" accept=".xlsx" onChange={handlePeopleUpload} style={{ display: 'none' }} />
              </label>
            </div>

            {/* Bloco de Oportunidades */}
            <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '16px' }}>2. Base de Oportunidades (Opcional)</h3>
                <span style={{ background: oppData.length > 0 ? '#059669' : '#475569', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                  {oppData.length} registros
                </span>
              </div>
              <label style={{ display: 'block', background: '#8b5cf6', color: '#fff', padding: '14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}>
                Selecionar Planilha de Oportunidades
                <input type="file" accept=".xlsx" onChange={handleOppUpload} style={{ display: 'none' }} />
              </label>
            </div>

            <button
              onClick={handleFinish}
              disabled={peopleData.length === 0}
              style={{
                marginTop: '20px',
                width: '100%',
                background: peopleData.length > 0 ? '#10b981' : '#334155',
                color: peopleData.length > 0 ? '#fff' : '#94a3b8',
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
