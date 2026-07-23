import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { resolveAccountCoordinates } from '../services/geocoding';

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

function normalizeNameKey(str) {
  const clean = (str || '')
    .toString()
    .replace(',', ' ')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const parts = clean.split(/\s+/).filter(Boolean).sort();
  return parts.join('');
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

// Banco expandido de coordenadas municipais brasileiras (100% de cobertura das cidades do projeto)
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
  'MANAUS': { lat: -3.1190, lng: -60.0217, state: 'AM' },
  'NATAL': { lat: -5.7945, lng: -35.2110, state: 'RN' },
  'PIRACICABA': { lat: -22.7338, lng: -47.6476, state: 'SP' },
  'PINHAIS': { lat: -25.4440, lng: -49.1921, state: 'PR' },
  'BARUERI': { lat: -23.5113, lng: -46.8728, state: 'SP' },
  'CAMPINAS': { lat: -22.9099, lng: -47.0626, state: 'SP' },
  'RIBEIRAO PRETO': { lat: -21.1704, lng: -47.8103, state: 'SP' },
  'JUNDIAI': { lat: -23.1857, lng: -46.8978, state: 'SP' },
  'SOROCABA': { lat: -23.5015, lng: -47.4526, state: 'SP' },
  'SANTOS': { lat: -23.9608, lng: -46.3336, state: 'SP' },
  'JOINVILLE': { lat: -26.3045, lng: -48.8487, state: 'SC' },
  'FLORIANOPOLIS': { lat: -27.5954, lng: -48.5480, state: 'SC' },
  'VITORIA': { lat: -20.2976, lng: -40.2958, state: 'ES' },
  'LONDRINA': { lat: -23.3103, lng: -51.1628, state: 'PR' },
  'MARINGA': { lat: -23.4273, lng: -51.9375, state: 'PR' },
  'UBERLANDIA': { lat: -18.9186, lng: -48.2772, state: 'MG' },
  'JUIZ DE FORA': { lat: -21.7642, lng: -43.3503, state: 'MG' },
  'CONTAGEM': { lat: -19.9321, lng: -44.0539, state: 'MG' },
  'SAO JOSE DOS CAMPOS': { lat: -23.1896, lng: -45.8841, state: 'SP' },
  'GUARULHOS': { lat: -23.4538, lng: -46.5333, state: 'SP' },
  'OSASCO': { lat: -23.5327, lng: -46.7917, state: 'SP' },
  'SANTO ANDRE': { lat: -23.6737, lng: -46.5432, state: 'SP' },
  'SAO BERNARDO DO CAMPO': { lat: -23.6914, lng: -46.5646, state: 'SP' },
  'NITEROI': { lat: -22.8833, lng: -43.1036, state: 'RJ' },
  'SAO GONCALO': { lat: -22.8269, lng: -43.0634, state: 'RJ' },
  'DUQUE DE CAXIAS': { lat: -22.7856, lng: -43.3117, state: 'RJ' },
  'NOVA IGUACU': { lat: -22.7592, lng: -43.4510, state: 'RJ' },
  'MACEIO': { lat: -9.6658, lng: -35.7353, state: 'AL' },
  'JOAO PESSOA': { lat: -7.1195, lng: -34.8450, state: 'PB' },
  'TERESINA': { lat: -5.0892, lng: -42.8019, state: 'PI' },
  'SAO LUIS': { lat: -2.5387, lng: -44.2826, state: 'MA' },
  'ARACAJU': { lat: -10.9111, lng: -37.0717, state: 'SE' },
  'CUIABA': { lat: -15.5989, lng: -56.0949, state: 'MT' },
  'CAMPO GRANDE': { lat: -20.4697, lng: -54.6201, state: 'MS' },
  'PALMAS': { lat: -10.1689, lng: -48.3317, state: 'TO' },
  'PORTO VELHO': { lat: -8.7619, lng: -63.9039, state: 'RO' },
  'BOA VISTA': { lat: 2.8194, lng: -60.6714, state: 'RR' },
  'MACAPA': { lat: 0.0349, lng: -51.0694, state: 'AP' },
  'RIO BRANCO': { lat: -9.9753, lng: -67.8099, state: 'AC' },
  'SANTA BARBARA D OESTE': { lat: -22.7551, lng: -47.4062, state: 'SP' },
  'CANARANA': { lat: -13.0694, lng: -52.2694, state: 'MT' },
  'MOGI DAS CRUZES': { lat: -23.5206, lng: -46.1854, state: 'SP' },
  'BIGUACU': { lat: -27.4939, lng: -48.6569, state: 'SC' },
  'LEME': { lat: -22.1869, lng: -47.3878, state: 'SP' },
  'PARANAIBA': { lat: -19.6744, lng: -51.1914, state: 'MS' },
  'VARZEA GRANDE': { lat: -15.6464, lng: -56.1325, state: 'MT' },
  'SERTAOZINHO': { lat: -21.1342, lng: -47.9908, state: 'SP' },
  'FOZ DO IGUACU': { lat: -25.5469, lng: -54.5882, state: 'PR' },
  'ITARARE': { lat: -24.1147, lng: -49.3325, state: 'SP' },
  'PINDAMONHANGABA': { lat: -22.9244, lng: -45.4617, state: 'SP' },
  'JABOATAO DOS GUARARAPES': { lat: -8.1758, lng: -35.0033, state: 'PE' },
  'SAO CARLOS': { lat: -22.0175, lng: -47.8908, state: 'SP' },
  'ANGRA DOS REIS': { lat: -23.0067, lng: -44.3181, state: 'RJ' },
  'POJUCA': { lat: -12.4314, lng: -38.3347, state: 'BA' },
  'MARABA': { lat: -5.3686, lng: -49.1178, state: 'PA' },
  'DOM INOCENCIO': { lat: -8.9567, lng: -41.9708, state: 'PI' },
  'TANGARA DA SERRA': { lat: -14.6225, lng: -57.4858, state: 'MT' },
  'ATIBAIA': { lat: -23.1172, lng: -46.5564, state: 'SP' },
  'SUMARE': { lat: -22.8219, lng: -47.2669, state: 'SP' },
  'ITAJAI': { lat: -26.9078, lng: -48.6619, state: 'SC' },
  'JARAGUA DO SUL': { lat: -26.4856, lng: -49.0769, state: 'SC' },
  'BETIM': { lat: -19.9678, lng: -44.1983, state: 'MG' },
  'GRAVATAI': { lat: -29.9431, lng: -50.9922, state: 'RS' },
  'CANOAS': { lat: -29.9178, lng: -51.1839, state: 'RS' },
  'MALLET': { lat: -25.8831, lng: -50.8167, state: 'PR' }
};

export default function UploadScreen({ onDataLoaded, STATE_CENTERS }) {
  const [peopleData, setPeopleData] = useState([]);
  const [oppData, setOppData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  function withSuppressedXlsxWarnings(fn) {
    const methods = ['log', 'warn', 'error'];
    const originals = {};
    methods.forEach(m => {
      originals[m] = console[m];
      console[m] = (...args) => {
        const text = args.map(a => (typeof a === 'string' ? a : '')).join(' ');
        if (/uncompressed|bad crc|corrupt/i.test(text)) return;
        originals[m].apply(console, args);
      };
    });
    try {
      return fn();
    } finally {
      methods.forEach(m => { console[m] = originals[m]; });
    }
  }

  const parseExcel = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        withSuppressedXlsxWarnings(() => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            let allRows = [];
            workbook.SheetNames.forEach(sheetName => {
              const sheetJson = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });
              allRows = allRows.concat(sheetJson);
            });
            resolve(allRows);
          } catch (err) {
            reject(err);
          }
        });
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };
  
  const handlePeopleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setLoadingText('Processando base de Pessoas...');
    try {
      const json = await parseExcel(file);
      const parsed = [];

      json.forEach((row, idx) => {
        const name = getField(row, ['Person Full Name']) || 'Sem Nome';
        const email = getField(row, ['Person Work Email']);
        const id = getField(row, ['SESA Number']) || `ID-${idx}`;
        const manager = getField(row, ['Manager Full Name']);
        const rawCity = getField(row, ['City of Work']);
        const catSec = getField(row, ['Categoria']) || '';
        const specCode = getField(row, ['Specialization Code', 'Specialization', 'Job Code', 'JobCode']) || '';
        const deQue = getField(row, ['De quê?', 'De que?', 'De quê', 'De que', 'De Quê?', 'De Que?']);

        const cityKey = normalize(rawCity);
        const cityMatch = BRAZIL_CITIES[cityKey];

        let state = null;
        let coordinates = null;

        if (cityMatch) {
          state = cityMatch.state;
          coordinates = [cityMatch.lat, cityMatch.lng];
        } else if (rawCity) {
          state = 'XX';
          coordinates = [-14.235, -51.925];
        } else {
          return;
        }

        const categoriesList = deQue 
          ? String(deQue).split(/\s*-\s*/).map(s => s.trim()).filter(Boolean) 
          : [];
        if (categoriesList.length === 0) categoriesList.push('Sem Categoria');

        const specStr = String(specCode).trim().toUpperCase();
        const hasJobCodeS = specStr.startsWith('S');

        parsed.push({
          id, nNumber: id, name, 
          nameNormalized: normalizeNameKey(name), 
          email, managerName: manager,
          city: rawCity ? toTitleCase(rawCity) : 'Não Mapeada',
          state, coordinates,
          allCategories: categoriesList,
          subcategory: catSec,
          specializationCode: specCode,
          hasJobCodeS,
          geocoded: true
        });
      });

      setPeopleData(parsed);
      alert(`${parsed.length} Pessoas importadas com sucesso!`);
    } catch (err) {
      alert('Erro ao carregar pessoas. Verifique se o arquivo é um .xlsx válido.');
    } finally {
      setLoading(false);
    }
  };

  const handleOppUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setLoadingText('Processando base de Contas...');
    try {
      const json = await parseExcel(file);
      const parsed = [];

      for (let i = 0; i < json.length; i++) {
        const row = json[i];
        
        const accountName = getField(row, ['Account Name']);
        const accountId = getField(row, ['Account ID - 18 characters', 'Account ID']);
        const segment = getField(row, ['Market Segment']);
        const subSegment = getField(row, ['Market Sub-Segment']);
        const owner = getField(row, ['Account Owner', 'Responsavel']);
        const country = getField(row, ['Country']);
        const state = getField(row, ['State/Province', 'State']);
        const city = getField(row, ['City']);
        const street = getField(row, ['Street']);
        const zip = getField(row, ['Zip/Postal Code', 'Zip Code', 'Zip']);
        const profile = getField(row, ['Account Master Profile']);
        const platform = getField(row, ['Platforming zones']);
        const class1 = getField(row, ['Classification Level 1']);
        const class2 = getField(row, ['Classification Level 2']);
        const addInfo = getField(row, ['Local Address Additional Information']);
        const pam = getField(row, ['Total PAM (converted)', 'Total PAM']);
        const sales = getField(row, ['Total Sales']);
        const lifecycle = getField(row, ['Account Lifecycle']);

        // Se uma conta não tem responsável, ignora a conta
        if (!accountName || !owner || !String(owner).trim()) continue;
        
        const isEndUser = class1 && normalize(class1).includes('END USER');
        
        let baseLat = -14.235;
        let baseLng = -51.925;

        const cKey = normalize(city);
        if (BRAZIL_CITIES[cKey]) {
          baseLat = BRAZIL_CITIES[cKey].lat;
          baseLng = BRAZIL_CITIES[cKey].lng;
        } else if (state && STATE_CENTERS[state.toUpperCase()]) {
          [baseLat, baseLng] = STATE_CENTERS[state.toUpperCase()];
        }

        // Resolução de coordenadas exatas por rua e CEP
        const coordinates = resolveAccountCoordinates(street, city, state, zip, baseLat, baseLng);

        parsed.push({
          id: accountId || `ACC-${i}`,
          name: accountName,
          segment, subSegment, 
          owner, ownerNormalized: normalizeNameKey(owner),
          country, state: state || '', city: city || '', street: street || '', zip: zip || '',
          profile, platform, class1, class2, addInfo, pam, sales, lifecycle,
          coordinates,
          isEndUser,
          geocoded: true
        });
      }

      setOppData(parsed);
      alert(`${parsed.length} Contas ativas importadas com sucesso!`);
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar contas. Verifique se o arquivo é um .xlsx válido.');
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc', padding: '20px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ background: '#ffffff', padding: '36px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '540px', width: '100%' }}>
        <h1 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '6px', fontWeight: '700', letterSpacing: '-0.02em' }}>Brasil Map</h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>Carregue as planilhas para análise e visualização geográfica</p>

        {loading ? (
          <div style={{ padding: '30px 0' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#00A950', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }}></div>
            <p style={{ color: '#475569', fontSize: '13px', fontWeight: '500' }}>{loadingText}</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: '600' }}>1. Base de Pessoas</span>
                <span style={{ background: peopleData.length > 0 ? '#00A950' : '#e2e8f0', color: peopleData.length > 0 ? '#fff' : '#64748b', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>
                  {peopleData.length} registros
                </span>
              </div>
              <label style={{ display: 'block', background: '#3b82f6', color: '#fff', padding: '12px', borderRadius: '8px', fontWeight: '600', fontSize: '13px', textAlign: 'center', cursor: 'pointer', transition: 'background 0.2s' }}>
                Selecionar Planilha de Pessoas
                <input type="file" accept=".xlsx,.xls" onChange={handlePeopleUpload} style={{ display: 'none' }} />
              </label>
            </div>

            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: '600' }}>2. Base de Contas</span>
                <span style={{ background: oppData.length > 0 ? '#00A950' : '#e2e8f0', color: oppData.length > 0 ? '#fff' : '#64748b', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>
                  {oppData.length} registros
                </span>
              </div>
              <label style={{ display: 'block', background: '#8b5cf6', color: '#fff', padding: '12px', borderRadius: '8px', fontWeight: '600', fontSize: '13px', textAlign: 'center', cursor: 'pointer', transition: 'background 0.2s' }}>
                Selecionar Planilha de Contas
                <input type="file" accept=".xlsx,.xls" onChange={handleOppUpload} style={{ display: 'none' }} />
              </label>
            </div>

            <button
              onClick={handleFinish}
              disabled={peopleData.length === 0}
              style={{
                marginTop: '12px', width: '100%',
                background: peopleData.length > 0 ? '#00A950' : '#cbd5e1',
                color: '#fff', padding: '14px', borderRadius: '8px',
                fontWeight: '600', fontSize: '14px', border: 'none',
                cursor: peopleData.length > 0 ? 'pointer' : 'not-allowed',
                transition: 'background 0.2s'
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