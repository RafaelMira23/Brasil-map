import React, { useState, useEffect, useMemo } from 'react';
import MapComponent from './components/MapComponent';
import Topbar from './components/Topbar';

function App() {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  
  // Filters
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Apply dark mode class to body for global variables
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    fetch('/pessoas.json')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error("Erro ao carregar dados:", err));
  }, []);

  const statesList = useMemo(() => {
    const states = new Set(data.map(p => p.address?.state).filter(Boolean));
    return Array.from(states).sort();
  }, [data]);

  const citiesList = useMemo(() => {
    let filteredForCities = data;
    if (selectedState) {
        filteredForCities = data.filter(p => p.address?.state === selectedState);
    }
    const cities = new Set(filteredForCities.map(p => p.address?.city).filter(Boolean));
    return Array.from(cities).sort();
  }, [data, selectedState]);

  const filteredData = useMemo(() => {
    return data.filter(person => {
      const matchSearch = person.fullName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchState = selectedState ? person.address.state === selectedState : true;
      const matchCity = selectedCity ? person.address.city === selectedCity : true;
      
      return matchSearch && matchState && matchCity;
    });
  }, [data, searchQuery, selectedState, selectedCity]);

  const handlePersonSelect = (person) => {
    setSelectedPerson(person);
    setSearchQuery(''); // Clear search to hide results overlay after picking
  };

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
        onPersonSelect={handlePersonSelect}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

export default App;
