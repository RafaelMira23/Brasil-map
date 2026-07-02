import React, { useState, useMemo } from 'react';
import MapComponent from './components/MapComponent';
import Topbar from './components/Topbar';
import DetailsPanel from './components/DetailsPanel';
import UploadScreen from './components/UploadScreen';

const CATEGORIES = [
  { acronym: 'MGT', color: '#ef4444' },
  { acronym: 'TEC', color: '#3b82f6' },
  { acronym: 'ADM', color: '#f59e0b' },
  { acronym: 'OPS', color: '#10b981' },
  { acronym: 'MKT', color: '#8b5cf6' },
  { acronym: 'Sem Categoria', color: '#888888' }
];

const STATE_CENTERS = {
  'AC': [-9.02, -70.81], 'AL': [-9.57, -36.78], 'AM': [-3.47, -62.28], 'AP': [1.41, -51.77],
  'BA': [-12.96, -38.51], 'CE': [-5.20, -39.53], 'DF': [-15.78, -47.93], 'ES': [-19.19, -40.34],
  'GO': [-15.83, -47.86], 'MA': [-5.42, -45.44], 'MG': [-18.10, -44.38], 'MS': [-20.77, -54.78],
  'MT': [-12.64, -55.42], 'PA': [-5.53, -52.29], 'PB': [-7.24, -36.78], 'PE': [-8.28, -37.86],
  'PI': [-7.71, -42.71], 'PR': [-24.89, -51.55], 'RJ': [-22.84, -43.15], 'RN': [-5.40, -36.51],
  'RO': [-10.83, -63.34], 'RR': [2.15, -61.38], 'RS': [-30.01, -51.22], 'SC': [-27.27, -50.22],
  'SE': [-10.90, -37.07], 'SP': [-23.55, -46.64], 'TO': [-10.17, -48.33]
};

// Estados majoritariamente litorâneos: para esses, evitamos deslocar a
// longitude para LESTE (positivo), que é a direção que empurra pontos
// para dentro do oceano. O deslocamento é sempre puxado para OESTE (inland).
const COASTAL_STATES = new Set(['AL','BA','CE','ES','MA','PA','PB','PE','PI','RJ','RN','RS','SC','SE','SP','AP']);

// Banco de dados SINTÉTICO usado apenas pelo Gerador de Testes.
// Os nomes aqui (ex: "Capital de SP") são fictícios — não correspondem a
// cidades reais e não devem ser usados para geocodificar uploads de Excel
// reais (ver UploadScreen.jsx, que faz geocodificação separada).
const MOCK_GEODB = {};
const ufs = Object.keys(STATE_CENTERS);
const MOCK_CITIES_BY_STATE = {
  'SP': ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto'],
  'RJ': ['Rio de Janeiro', 'Niterói', 'Petrópolis', 'Cabo Frio'],
  'MG': ['Belo Horizonte', 'Uberlândia', 'Juiz de Fora'],
  'BA': ['Salvador', 'Feira de Santana', 'Ilhéus'],
  'RS': ['Porto Alegre', 'Caxias do Sul', 'Pelotas'],
  'PR': ['Curitiba', 'Londrina', 'Maringá'],
  'SC': ['Florianópolis', 'Joinville', 'Blumenau'],
  'PE': ['Recife', 'Olinda', 'Caruaru'],
  'CE': ['Fortaleza', 'Caucaia', 'Sobral'],
  'PA': ['Belém', 'Ananindeua', 'Santarém'],
  'MA': ['São Luís', 'Imperatriz', 'Caxias'],
  'GO': ['Goiânia', 'Aparecida de Goiânia', 'Anápolis'],
  'AM': ['Manaus', 'Parintins', 'Itacoatiara'],
  'ES': ['Vitória', 'Vila Velha', 'Serra'],
  'PB': ['João Pessoa', 'Campina Grande', 'Santa Rita'],
  'RN': ['Natal', 'Mossoró', 'Parnamirim'],
  'MT': ['Cuiabá', 'Várzea Grande', 'Rondonópolis'],
  'AL': ['Maceió', 'Arapiraca', 'Rio Largo'],
  'PI': ['Teresina', 'Parnaíba', 'Picos'],
  'DF': ['Brasília'],
  'MS': ['Campo Grande', 'Dourados', 'Três Lagoas'],
  'SE': ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto'],
  'RO': ['Porto Velho', 'Ji-Paraná', 'Ariquemes'],
  'TO': ['Palmas', 'Araguaína', 'Gurupi'],
  'AC': ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira'],
  'AP': ['Macapá', 'Santana', 'Laranjal do Jari'],
  'RR': ['Boa Vista', 'Rorainópolis', 'Caracaraí']
};


const STATE_MAP = {
  'Acre': 'AC', 'Alagoas': 'AL', 'Amazonas': 'AM', 'Amapá': 'AP', 'Bahia': 'BA', 'Ceará': 'CE',
  'Distrito Federal': 'DF', 'Espírito Santo': 'ES', 'Goiás': 'GO', 'Maranhão': 'MA',
  'Minas Gerais': 'MG', 'Mato Grosso do Sul': 'MS', 'Mato Grosso': 'MT', 'Pará': 'PA',
  'Paraíba': 'PB', 'Pernambuco': 'PE', 'Piauí': 'PI', 'Paraná': 'PR', 'Rio de Janeiro': 'RJ',
  'Rio Grande do Norte': 'RN', 'Rondônia': 'RO', 'Roraima': 'RR', 'Rio Grande do Sul': 'RS',
  'Santa Catarina': 'SC', 'Sergipe': 'SE', 'São Paulo': 'SP', 'Tocantins': 'TO'
};

async function loadRealMockData() {
  try {
    const res = await fetch('/pessoas.json');
    if (!res.ok) return [];
    const pdata = await res.json();
    return pdata.map(p => {
      const randCat = CATEGORIES[Math.floor(Math.random() * (CATEGORIES.length - 1))]; // Avoid 'Sem Categoria' if possible, or include it
      return {
        id: p.id,
        nNumber: p.id,
        name: p.fullName,
        email: p.email || `${p.firstName.toLowerCase()}@empresa.com`,
        phone: '',
        street: p.address?.street || '',
        managerName: 'Gerente Teste',
        city: p.address?.city,
        state: STATE_MAP[p.address?.state] || p.address?.state,
        coordinates: p.coordinates,
        category: randCat,
        subcategory: null,
        geocoded: true
      };
    });
  } catch(e) {
    console.error(e);
    return [];
  }
}

function App() {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [panelMode, setPanelMode] = useState('closed');

  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const statesList = useMemo(() => [...new Set(data.map(p => p.state).filter(Boolean))].sort(), [data]);
  const citiesList = useMemo(() => {
    if (!selectedState) return [];
    return [...new Set(data.filter(p => p.state === selectedState).map(p => p.city).filter(Boolean))].sort();
  }, [data, selectedState]);

  const filteredData = useMemo(() => {
    return data.filter(person => {
      const nameMatch = person.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const numMatch = person.id?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSearch = nameMatch || numMatch;
      const matchesState = selectedState ? person.state === selectedState : true;
      const matchesCity = selectedCity ? person.city === selectedCity : true;
      return matchesSearch && matchesState && matchesCity;
    });
  }, [data, searchQuery, selectedState, selectedCity]);

  const groupPeople = useMemo(() => {
    if (!selectedGroup) return [];
    if (selectedGroup.type === 'full-state') {
      // Entire state clicked on the map — show all people from that state
      return data.filter(p => p.state === selectedGroup.state);
    } else if (selectedGroup.type === 'state') {
      return data
        .filter(p => p.state === selectedGroup.state)
        .filter(p => selectedGroup.acronym === 'GERAL' ? true : p.category?.acronym === selectedGroup.acronym);
    } else if (selectedGroup.type === 'city') {
      return data
        .filter(p => p.city === selectedGroup.city && p.state === selectedGroup.state)
        .filter(p => selectedGroup.acronym ? p.category?.acronym === selectedGroup.acronym : true);
    }
    return [];
  }, [data, selectedGroup]);

  if (data.length === 0) {
    return (
      <UploadScreen
        CATEGORIES={CATEGORIES}
        GEODB={{}}
        STATE_CENTERS={STATE_CENTERS}
        onDataLoaded={(parsed) => setData(parsed)}
        onTriggerMock={async () => {
          const mockData = await loadRealMockData();
          setData(mockData);
        }}
      />
    );
  }

  return (
    <div className={`app-container ${isDarkMode ? 'dark' : ''}`}>
      <Topbar
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        filteredData={filteredData} onPersonSelect={(p) => { setSelectedPerson(p); setPanelMode('detail'); }}
        statesList={statesList} selectedState={selectedState} setSelectedState={(val) => { setSelectedState(val); setSelectedCity(''); }}
        citiesList={citiesList} selectedCity={selectedCity} setSelectedCity={setSelectedCity}
        isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      <MapComponent
        data={filteredData}
        selectedPerson={selectedPerson} selectedGroup={selectedGroup}
        onPersonSelect={(p) => { setSelectedPerson(p); setPanelMode('detail'); }}
        onGroupSelect={(g) => { setSelectedGroup(g); setPanelMode('list'); }}
        onStateSelect={(sigla, name) => {
          setSelectedGroup({ type: 'full-state', state: sigla, name, acronym: 'GERAL' });
          setPanelMode('list');
        }}
        onStateDeselect={() => {
          setPanelMode('closed');
          setSelectedGroup(null);
        }}
        isDarkMode={isDarkMode}
        STATE_CENTERS={STATE_CENTERS}
      />

      <DetailsPanel
        mode={panelMode}
        group={selectedGroup}
        groupPeople={groupPeople}
        person={selectedPerson}
        onClose={() => { setPanelMode('closed'); setSelectedPerson(null); setSelectedGroup(null); }}
        onPersonSelect={(p) => { setSelectedPerson(p); setPanelMode('detail'); }}
      />

      <button onClick={() => { setData([]); setPanelMode('closed'); }} style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 999, padding: '10px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        Resetar Base (Upload)
      </button>
    </div>
  );
}

export default App;