import React, { useState, useMemo } from 'react';

export default function DetailsPanel({ mode, group, groupPeople, person, relatedPeople, onClose, onPersonSelect }) {
  const [listSearch, setListSearch] = useState('');
  const isList = mode === 'list';
  const panelClass = isList ? 'panel-list' : 'panel-detail';

  let title = '';
  let basePeople = [];
  if (isList && group) {
    if (group.type === 'state') title = `${group.state} — ${group.acronym}`;
    else if (group.type === 'city') title = `${group.city} / ${group.state} — ${group.acronym}`;
    basePeople = groupPeople || [];
  } else if (!isList && person) {
    title = person.name;
    basePeople = relatedPeople || [];
  }

  const people = useMemo(() => {
    const q = listSearch.toLowerCase();
    if (!q) return basePeople;
    return basePeople.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.nNumber.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.category?.acronym.toLowerCase().includes(q)
    );
  }, [basePeople, listSearch]);

  if (mode === 'closed') return null;

  return (
    <div className={`details-panel ${panelClass}`}>
      <div className="panel-inner">
        <button className="panel-close" onClick={onClose} title="Fechar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="panel-header">
          <h2 className="panel-title">{title}</h2>
          {!isList && person && (
            <span className="panel-badge" style={{ background: person.category?.color || '#666' }}>
              {person.category?.acronym}
            </span>
          )}
        </div>

        {isList ? (
          <div className="panel-list-view">
            <div className="panel-search-wrapper">
              <input
                type="text"
                className="panel-search"
                placeholder="Filtrar na lista..."
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
              />
            </div>
            <div className="people-list">
              {people.map(p => (
                <div key={p.id} className="person-card" onClick={() => onPersonSelect(p)}>
                  <div className="person-avatar" style={{ background: p.category?.color || '#666' }}>
                    {p.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="person-info">
                    <div className="person-row-name">{p.name}</div>
                    <div className="person-row-meta">
                      {p.nNumber} · {p.city}
                    </div>
                  </div>
                </div>
              ))}
              {people.length === 0 && (
                <div className="panel-empty">Nenhuma pessoa encontrada</div>
              )}
            </div>
          </div>
        ) : (
          <div className="panel-detail-layout">
            <div className="panel-sidebar">
              <h3 className="panel-subtitle">Pessoas relacionadas</h3>
              <div className="panel-search-wrapper">
                <input
                  type="text"
                  className="panel-search"
                  placeholder="Filtrar relacionados..."
                  value={listSearch}
                  onChange={(e) => setListSearch(e.target.value)}
                />
              </div>
              <div className="people-list">
                {people.map(p => (
                  <div
                    key={p.id}
                    className={`person-card ${p.id === person?.id ? 'active' : ''}`}
                    onClick={() => onPersonSelect(p)}
                  >
                    <div className="person-avatar" style={{ background: p.category?.color || '#666' }}>
                      {p.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="person-info">
                      <div className="person-row-name">{p.name}</div>
                      <div className="person-row-meta">
                        {p.nNumber} · {p.city}
                      </div>
                    </div>
                  </div>
                ))}
                {people.length === 0 && (
                  <div className="panel-empty">Nenhuma pessoa relacionada</div>
                )}
              </div>
            </div>
            <div className="panel-main">
              <div className="person-detail-card">
                <DetailFields person={person} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailFields({ person }) {
  if (!person) return null;
  return (
    <div className="detail-fields">
      <div className="detail-field">
        <span className="detail-label">Nome</span>
        <span className="detail-value">{person.name}</span>
      </div>
      <div className="detail-field">
        <span className="detail-label">Número</span>
        <span className="detail-value">{person.nNumber}</span>
      </div>
      <div className="detail-field">
        <span className="detail-label">Email</span>
        <span className="detail-value">{person.email}</span>
      </div>
      <div className="detail-field">
        <span className="detail-label">Cidade</span>
        <span className="detail-value">{person.city}</span>
      </div>
      <div className="detail-field">
        <span className="detail-label">Estado</span>
        <span className="detail-value">{person.state}</span>
      </div>
      <div className="detail-field">
        <span className="detail-label">Gerente</span>
        <span className="detail-value">{person.managerName}</span>
      </div>
      <div className="detail-field">
        <span className="detail-label">Categoria</span>
        <span className="detail-value" style={{ color: person.category?.color }}>
          {person.category?.acronym}
        </span>
      </div>
    </div>
  );
}
