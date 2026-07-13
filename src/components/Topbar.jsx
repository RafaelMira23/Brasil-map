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

const FilterIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: '18px', height: '18px' }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

export default function Topbar({ 
  searchQuery, 
  setSearchQuery, 
  filteredData, 
  onPersonSelect,
  isDarkMode,
  toggleDarkMode,
  onOpenFilters,
  activeFiltersCount
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
            placeholder="Pesquisar por nome ou número da pessoa..." 
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
          <button
            onClick={onOpenFilters}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: activeFiltersCount > 0 ? 'var(--accent-color)' : 'transparent',
              color: activeFiltersCount > 0 ? '#fff' : 'var(--text-main)',
              border: `1px solid ${activeFiltersCount > 0 ? 'var(--accent-color)' : 'var(--border-color)'}`,
              padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
              fontWeight: '600', fontSize: '13px', transition: 'all 0.2s'
            }}
          >
            <FilterIcon />
            Filtros Avançados
            {activeFiltersCount > 0 && (
              <span style={{ background: '#fff', color: 'var(--accent-color)', padding: '2px 6px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
                {activeFiltersCount}
              </span>
            )}
          </button>

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
