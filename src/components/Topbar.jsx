import React, { useState } from 'react';

// SVGs to replace emojis
const SearchIcon = () => (
  <svg className="icon search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const SunIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

export default function Topbar({ 
  searchQuery, 
  setSearchQuery, 
  filteredData, 
  onPersonSelect,
  statesList,
  selectedState,
  setSelectedState,
  citiesList,
  selectedCity,
  setSelectedCity,
  isDarkMode,
  toggleDarkMode
}) {
  const [isFocused, setIsFocused] = useState(false);

  const showResults = isFocused && searchQuery.length > 0;

  return (
    <div className="topbar">
      <div className="topbar-main">
        <div className="search-input-wrapper">
          <SearchIcon />
          <input 
            type="text" 
            placeholder="Pesquisar por nome, número ou categoria..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setTimeout(() => setIsFocused(false), 200);
            }}
          />
        </div>

        <div className="divider" />

        <div className="filters-container">
          <select 
            className="filter-select" 
            value={selectedState} 
            onChange={(e) => setSelectedState(e.target.value)}
          >
            <option value="">Qualquer Estado</option>
            {statesList.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>

          <select 
            className="filter-select" 
            value={selectedCity} 
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <option value="">Qualquer Cidade</option>
            {citiesList.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          <button 
            className="theme-toggle" 
            onClick={toggleDarkMode}
            title="Alternar Tema"
          >
            {isDarkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>

      {showResults && (
        <div className="search-results">
          {filteredData.length === 0 ? (
            <div className="search-result-item" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              Nenhum resultado encontrado
            </div>
          ) : (
            filteredData.slice(0, 15).map(person => (
              <div 
                key={person.id} 
                className="search-result-item"
                onMouseDown={() => onPersonSelect(person)}
              >
                <div className="result-name">{person.name}</div>
                <div className="result-location">
                  {person.nNumber} · {person.city}
                </div>
                <div className="result-meta">
                  <span className="result-cat" style={{ color: person.category?.color }}>{person.category?.acronym}</span>
                  {person.state}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
