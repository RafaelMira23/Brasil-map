import React, { useState, useMemo } from 'react';
import MapComponent from './components/MapComponent';
import Topbar from './components/Topbar';
import DetailsPanel from './components/DetailsPanel';
import UploadScreen from './components/UploadScreen';
import FilterPanel from './components/FilterPanel';

const STATE_CENTERS = {
  'AC': [-9.02, -70.81], 'AL': [-9.57, -36.78], 'AM': [-3.47, -62.28], 'AP': [1.41, -51.77],
  'BA': [-12.96, -38.51], 'CE': [-5.20, -39.53], 'DF': [-15.78, -47.93], 'ES': [-19.19, -40.34],
  'GO': [-15.83, -47.86], 'MA': [-5.42, -45.44], 'MG': [-18.10, -44.38], 'MS': [-20.77, -54.78],
  'MT': [-12.64, -55.42], 'PA': [-5.53, -52.29], 'PB': [-7.24, -36.78], 'PE': [-8.28, -37.86],
  'PI': [-7.71, -42.71], 'PR': [-24.89, -51.55], 'RJ': [-22.84, -43.15], 'RN': [-5.40, -36.51],
  'RO': [-10.83, -63.34], 'RR': [2.15, -61.38], 'RS': [-30.01, -51.22], 'SC': [-27.27, -50.22],
  'SE': [-10.90, -37.07], 'SP': [-23.55, -46.64], 'TO': [-10.17, -48.33]
};

function App() {
  const [peopleData, setPeopleData] = useState([]);
  const [oppData, setOppData] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [panelMode, setPanelMode] = useState('closed');

  const [isDarkMode, setIsDarkMode] = useState(true);

  // Filters state
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  
  const [selectedSegments, setSelectedSegments] = useState([]);
  const [selectedSubSegments, setSelectedSubSegments] = useState([]);
  const [selectedClass1, setSelectedClass1] = useState([]);
  const [selectedClass2, setSelectedClass2] = useState([]);

  // Extract options for filters
  const statesList = useMemo(() => [...new Set(peopleData.map(p => p.state).filter(Boolean))].sort(), [peopleData]);
  const citiesList = useMemo(() => [...new Set(peopleData.map(p => p.city).filter(Boolean))].sort(), [peopleData]);
  const categoriesList = useMemo(() => {
    const cats = new Set();
    peopleData.forEach(p => p.allCategories?.forEach(c => cats.add(c)));
    return [...cats].sort();
  }, [peopleData]);

  const segmentsList = useMemo(() => [...new Set(oppData.map(o => o.segment).filter(Boolean))].sort(), [oppData]);
  const subSegmentsList = useMemo(() => [...new Set(oppData.map(o => o.subSegment).filter(Boolean))].sort(), [oppData]);
  const class1List = useMemo(() => [...new Set(oppData.map(o => o.class1).filter(Boolean))].sort(), [oppData]);
  const class2List = useMemo(() => [...new Set(oppData.map(o => o.class2).filter(Boolean))].sort(), [oppData]);

  const filteredData = useMemo(() => {
    return peopleData.filter(person => {
      const nameMatch = person.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const numMatch = person.id?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSearch = nameMatch || numMatch;

      const matchesState = selectedStates.length === 0 || selectedStates.includes(person.state);
      const matchesCity = selectedCities.length === 0 || selectedCities.includes(person.city);
      const matchesCat = selectedCategories.length === 0 || 
                         selectedCategories.some(cat => person.allCategories?.includes(cat));

      return matchesSearch && matchesState && matchesCity && matchesCat;
    });
  }, [peopleData, searchQuery, selectedStates, selectedCities, selectedCategories]);

  const groupPeople = useMemo(() => {
    if (!selectedGroup) return [];
    if (selectedGroup.type === 'full-state') {
      return filteredData.filter(p => p.state === selectedGroup.state);
    } else if (selectedGroup.type === 'state') {
      return filteredData
        .filter(p => p.state === selectedGroup.state)
        .filter(p => selectedGroup.acronym === 'GERAL' ? true : p.category?.acronym === selectedGroup.acronym);
    } else if (selectedGroup.type === 'city') {
      return filteredData
        .filter(p => p.city === selectedGroup.city && p.state === selectedGroup.state)
        .filter(p => selectedGroup.acronym ? p.category?.acronym === selectedGroup.acronym : true);
    }
    return [];
  }, [filteredData, selectedGroup]);

  const filteredOppData = useMemo(() => {
    return oppData.filter(opp => {
      const matchSeg = selectedSegments.length === 0 || selectedSegments.includes(opp.segment);
      const matchSubSeg = selectedSubSegments.length === 0 || selectedSubSegments.includes(opp.subSegment);
      const matchC1 = selectedClass1.length === 0 || selectedClass1.includes(opp.class1);
      const matchC2 = selectedClass2.length === 0 || selectedClass2.includes(opp.class2);
      
      return matchSeg && matchSubSeg && matchC1 && matchC2;
    });
  }, [oppData, selectedSegments, selectedSubSegments, selectedClass1, selectedClass2]);


  if (peopleData.length === 0) {
    return (
      <UploadScreen
        STATE_CENTERS={STATE_CENTERS}
        onDataLoaded={({ people, opportunities }) => {
          setPeopleData(people);
          setOppData(opportunities);
        }}
      />
    );
  }

  const activeFiltersCount = selectedStates.length + selectedCities.length + selectedCategories.length + selectedSegments.length + selectedSubSegments.length + selectedClass1.length + selectedClass2.length;

  return (
    <div className={`app-container ${isDarkMode ? 'dark' : ''}`}>
      <Topbar
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        filteredData={filteredData} onPersonSelect={(p) => { setSelectedPerson(p); setPanelMode('detail'); }}
        isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenFilters={() => setIsFilterPanelOpen(true)}
        activeFiltersCount={activeFiltersCount}
      />

      <FilterPanel 
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        isDarkMode={isDarkMode}
        statesList={statesList}
        selectedStates={selectedStates} setSelectedStates={setSelectedStates}
        citiesList={citiesList}
        selectedCities={selectedCities} setSelectedCities={setSelectedCities}
        categoriesList={categoriesList}
        selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories}
        segmentsList={segmentsList}
        selectedSegments={selectedSegments} setSelectedSegments={setSelectedSegments}
        subSegmentsList={subSegmentsList}
        selectedSubSegments={selectedSubSegments} setSelectedSubSegments={setSelectedSubSegments}
        class1List={class1List}
        selectedClass1={selectedClass1} setSelectedClass1={setSelectedClass1}
        class2List={class2List}
        selectedClass2={selectedClass2} setSelectedClass2={setSelectedClass2}
      />

      <MapComponent
        data={filteredData}
        oppData={filteredOppData}
        selectedPerson={selectedPerson} 
        selectedGroup={selectedGroup}
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
        personOpportunities={oppData.filter(o => o.owner === selectedPerson?.name)}
        onClose={() => { setPanelMode('closed'); setSelectedPerson(null); setSelectedGroup(null); }}
        onPersonSelect={(p) => { setSelectedPerson(p); setPanelMode('detail'); }}
      />

      <button onClick={() => { setPeopleData([]); setOppData([]); setPanelMode('closed'); }} style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 999, padding: '10px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        Resetar Base (Upload)
      </button>
    </div>
  );
}

export default App;