import React, { useState, useEffect, useMemo } from 'react';
import MapComponent from './components/MapComponent';
import Topbar from './components/Topbar';
import DetailsPanel from './components/DetailsPanel';
import * as XLSX from 'xlsx';

const CATEGORIES = [
  { acronym: 'MGT', color: '#ef4444', label: 'Management' },
  { acronym: 'TEC', color: '#3b82f6', label: 'Technical' },
  { acronym: 'ADM', color: '#f59e0b', label: 'Administration' },
  { acronym: 'OPS', color: '#10b981', label: 'Operations' },
  { acronym: 'MKT', color: '#8b5cf6', label: 'Marketing' },
];

function getCategory(name) {
  if (!name) return CATEGORIES[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CATEGORIES[Math.abs(hash) % CATEGORIES.length];
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

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    Promise.all([
      fetch('/pessoas.xlsx').then(res => res.arrayBuffer()),
      fetch('/city-coords.json').then(res => res.json()),
    ]).then(([buffer, cityData]) => {
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

const cityMap = {};
       cityData.forEach(c => {
         const key = `${c.city}|${c.state}`;
         cityMap[key] = { state: c.state, coordinates: [c.lat, c.lng] };
       });

       const normalized = json.map((row, index) => {
         const key = `${row['City']}|${row['State'] || ''}`;
         const cityInfo = cityMap[key];
         const lat = row['Lat'];
         const lng = row['Lng'];
         return {
           id: index,
           name: row['Name'] || '',
           nNumber: row['N Number'] || '',
           email: row['Email'] || '',
           managerName: row['Manager name'] || '',
           city: row['City'] || '',
           state: row['State'] || '',
           coordinates: (lat != null && lng != null) ? [parseFloat(lat), parseFloat(lng)] : (cityInfo?.coordinates || null),
           category: getCategory(row['N Number'] || ''),
         };
       }).filter(p => p.coordinates);

      setData(normalized);
    }).catch(err => console.error("Erro ao carregar dados:", err));
  }, []);

  const statesList = useMemo(() => {
    const states = new Set(data.map(p => p.state).filter(Boolean));
    return Array.from(states).sort();
  }, [data]);

  const citiesList = useMemo(() => {
    let filtered = data;
    if (selectedState) filtered = data.filter(p => p.state === selectedState);
    const cities = new Set(filtered.map(p => p.city).filter(Boolean));
    return Array.from(cities).sort();
  }, [data, selectedState]);

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return data.filter(person => {
      const matchSearch =
        !q ||
        person.name.toLowerCase().includes(q) ||
        person.nNumber.toLowerCase().includes(q) ||
        person.category.acronym.toLowerCase().includes(q) ||
        person.category.label.toLowerCase().includes(q);
      const matchState = selectedState ? person.state === selectedState : true;
      const matchCity = selectedCity ? person.city === selectedCity : true;
      return matchSearch && matchState && matchCity;
    });
  }, [data, searchQuery, selectedState, selectedCity]);

  const handlePersonSelect = (person) => {
    setSelectedPerson(person);
    setSelectedGroup(null);
    setPanelMode('detail');
    setSearchQuery('');
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setSelectedPerson(null);
    setPanelMode('list');
    setSearchQuery('');
  };

  const closePanel = () => {
    setPanelMode('closed');
    setSelectedPerson(null);
    setSelectedGroup(null);
  };

  const groupPeople = useMemo(() => {
    if (!selectedGroup) return [];
    if (selectedGroup.type === 'state') {
      return data.filter(p => p.state === selectedGroup.state && p.category.acronym === selectedGroup.acronym);
    }
    if (selectedGroup.type === 'city') {
      return data.filter(p => p.city === selectedGroup.city && p.state === selectedGroup.state && p.category.acronym === selectedGroup.acronym);
    }
    return [];
  }, [data, selectedGroup]);

  const relatedPeople = useMemo(() => {
    if (!selectedPerson) return [];
    return data
      .filter(p => p.category.acronym === selectedPerson.category.acronym)
      .filter(p => p.city === selectedPerson.city || p.state === selectedPerson.state)
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 20);
  }, [data, selectedPerson]);

  return (
    <div className={`app-container ${isDarkMode ? 'dark' : ''}`}>
      <Topbar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredData={filteredData}
        onPersonSelect={handlePersonSelect}
        statesList={statesList}
        selectedState={selectedState}
        setSelectedState={(val) => { setSelectedState(val); setSelectedCity(''); }}
        citiesList={citiesList}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />
      <MapComponent 
        data={filteredData}
        selectedPerson={selectedPerson}
        selectedGroup={selectedGroup}
        onPersonSelect={handlePersonSelect}
        onGroupSelect={handleGroupSelect}
        isDarkMode={isDarkMode}
      />
      <DetailsPanel 
        mode={panelMode}
        group={selectedGroup}
        groupPeople={groupPeople}
        person={selectedPerson}
        relatedPeople={relatedPeople}
        onClose={closePanel}
        onPersonSelect={handlePersonSelect}
      />
    </div>
  );
}

export default App;
