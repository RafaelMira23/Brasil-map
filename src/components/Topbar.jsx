import React, { useState } from 'react';

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

const BuildingIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1" />
  </svg>
);

const PeopleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

export default function Topbar({ 
  searchQuery, 
  setSearchQuery, 
  filteredData, 
  searchedAccounts = [],
  onPersonSelect,
  onAccountSelect,
  isDarkMode,
  toggleDarkMode,
  onOpenFilters,
  activeFiltersCount,
  mapMode,
  setMapMode
}) {
  const [isFocused, setIsFocused] = useState(false);

  const showResults = isFocused && searchQuery.length > 0;
  const peopleResults = filteredData.slice(0, 15);
  const accountResults = searchedAccounts.slice(0, 10);
  const hasAnyResult = peopleResults.length > 0 || accountResults.length > 0;

  return (
    <div className="topbar">
      <div className="topbar-main">
        
        {/* Item 4: Mudar modo de visão do mapa (Pessoas vs Contas) */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-hover)',
            padding: '3px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            gap: '2px'
          }}
        >
          <button
            onClick={() => setMapMode('people')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              background: mapMode === 'people' ? 'var(--accent-color)' : 'transparent',
              color: mapMode === 'people' ? '#fff' : 'var(--text-main)',
              fontWeight: '700',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <PeopleIcon /> Pessoas
          </button>
          <button
            onClick={() => setMapMode('accounts')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              background: mapMode === 'accounts' ? '#8b5cf6' : 'transparent',
              color: mapMode === 'accounts' ? '#fff' : 'var(--text-main)',
              fontWeight: '700',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <BuildingIcon /> Contas
          </button>
        </div>

        <div className="search-input-wrapper">
          <SearchIcon />
          <input 
            type="text" 
            placeholder="Pesquisar por nome, número da pessoa ou conta..." 
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
            Filtros
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
          {!hasAnyResult ? (
            <div className="search-result-item" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              Nenhum resultado encontrado
            </div>
          ) : (
            <>
              {peopleResults.map(person => (
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
                    <span className="result-cat">{person.allCategories?.join(' · ')}</span>
                    {person.state}
                  </div>
                </div>
              ))}

              {accountResults.length > 0 && (
                <>
                  <div
                    className="search-result-item"
                    style={{ cursor: 'default', paddingTop: '10px', paddingBottom: '6px', background: 'var(--bg-hover)' }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <BuildingIcon /> Contas
                    </div>
                  </div>
                  {accountResults.map(account => (
                    <div
                      key={account.id}
                      className="search-result-item"
                      onMouseDown={() => onAccountSelect && onAccountSelect(account)}
                    >
                      <div className="result-name">{account.name}</div>
                      <div className="result-location">
                        {[account.city, account.state].filter(Boolean).join(' · ') || 'Localização não informada'}
                      </div>
                      <div className="result-meta">
                        {account.segment || 'Sem segmento'}
                        {account.owner ? ` · Responsável: ${account.owner}` : ''}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}