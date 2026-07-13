import React, { useState, useMemo } from 'react';

export default function DetailsPanel({ mode, group, groupPeople, person, personOpportunities, onClose, onPersonSelect }) {
  const [listSearch, setListSearch] = useState('');
  const [showOpps, setShowOpps] = useState(false);

  const filteredPeople = useMemo(() => {
    const q = listSearch.toLowerCase();
    const base = groupPeople || [];
    if (!q) return base;
    return base.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.id?.toLowerCase().includes(q) ||
      p.city?.toLowerCase().includes(q)
    );
  }, [groupPeople, listSearch]);

  const groupedBySection = useMemo(() => {
    return filteredPeople.reduce((acc, p) => {
      let sectionName;
      if (group?.type === 'full-state') {
        sectionName = p.city || 'Sem Cidade';
      } else if (group?.type === 'city') {
        sectionName = p.category?.acronym || 'Sem Categoria';
      } else {
        sectionName = p.city || 'Sem Cidade';
      }
      if (!acc[sectionName]) acc[sectionName] = [];
      acc[sectionName].push(p);
      return acc;
    }, {});
  }, [filteredPeople, group]);

  if (mode === 'closed') return null;

  if (mode === 'detail' && person) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
        <div style={{ background: '#fff', width: '100%', maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontFamily: 'sans-serif', animation: 'scaleUp 0.2s ease-out' }}>

          <div style={{ background: person.category?.color || '#888888', padding: '24px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(25,25,25,0.2)', border: 'none', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: person.category?.color || '#888888', marginBottom: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              {person.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: '700', textAlign: 'center' }}>{person.name}</h3>
            <p style={{ margin: '4px 0 0 0', color: 'rgba(255,255,255,0.85)', fontSize: '12px' }}>{person.email || 'Email não informado'}</p>
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', background: '#fff' }}>
            {person.nNumber && !String(person.nNumber).startsWith('ID-') && (
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Identificador</label>
                <span style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>{person.nNumber}</span>
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Gestor Direto</label>
              <span style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>{person.managerName || 'Não Informado'}</span>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Categorias</label>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                  {person.allCategories?.map((cat, i) => (
                     <span key={i} style={{ fontSize: '12px', background: `${person.category?.color || '#888'}20`, color: person.category?.color || '#888', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>{cat}</span>
                  ))}
                </div>
              </div>
              {person.subcategory && person.subcategory !== 'Sem Categoria' && (
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Subfoco</label>
                  <span style={{ fontSize: '14px', color: '#334155', fontWeight: '500', display: 'inline-block', marginTop: '2px' }}>{person.subcategory}</span>
                </div>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Localidade de Trabalho</label>
              <span style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>{person.city || 'N/A'} — {person.state || 'UF'}</span>
            </div>

            {/* Secão de Oportunidades */}
            {personOpportunities && personOpportunities.length > 0 && (
              <div style={{ marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, color: '#1e293b', fontSize: '15px' }}>Oportunidades ({personOpportunities.length})</h4>
                  <button onClick={() => setShowOpps(!showOpps)} style={{ background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {showOpps ? 'Ocultar' : 'Ver Todas'}
                  </button>
                </div>
                
                {showOpps && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {personOpportunities.map(opp => (
                      <div key={opp.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '13px', marginBottom: '4px' }}>{opp.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>📍 {opp.street || opp.city}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>🏷️ Seg: {opp.segment} / {opp.subSegment}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>📊 Níveis: {opp.class1} / {opp.class2}</div>
                        {opp.addInfo && (
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', fontStyle: 'italic' }}>Info: {opp.addInfo}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    );
  }

  if (mode !== 'list' || !group) return null;

  let title;
  if (group.type === 'full-state') {
    title = `${group.name || group.state} — Visão Geral do Estado`;
  } else if (group.type === 'state') {
    title = `${group.state} — ${group.acronym !== 'GERAL' ? group.acronym : 'Geral'}`;
  } else {
    title = `${group.city} / ${group.state}${group.acronym ? ` — ${group.acronym}` : ''}`;
  }

  return (
    <div className="details-panel panel-list" style={{ fontFamily: 'sans-serif' }}>
      <div className="panel-inner">
        <button className="panel-close" onClick={onClose} title="Fechar">✕</button>
        <div className="panel-header">
          <h2 className="panel-title" style={{ fontSize: '15px', fontWeight: 'bold', margin: 0, color: 'var(--text-main)' }}>
            {title} ({filteredPeople.length} pessoas)
          </h2>
        </div>

        <div className="panel-list-view" style={{ overflowY: 'auto', marginTop: '15px' }}>
          <input
            type="text"
            className="panel-search"
            placeholder="Pesquisar pessoa na lista..."
            value={listSearch}
            onChange={(e) => setListSearch(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', boxSizing: 'border-box', marginBottom: '15px' }}
          />

          {Object.entries(groupedBySection).sort().map(([sectionName, sectionPeople]) => {
            const subGroups = group.type === 'full-state'
              ? sectionPeople.reduce((acc, p) => {
                  const cat = p.category?.acronym || 'Sem Categoria';
                  if (!acc[cat]) acc[cat] = [];
                  acc[cat].push(p);
                  return acc;
                }, {})
              : null;

            return (
              <div key={sectionName} style={{ marginBottom: '18px' }}>
                <h3 style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', padding: '4px 8px', background: 'var(--bg-hover)', borderRadius: '4px', fontWeight: '600', cursor: 'default' }}>
                  {sectionName} ({sectionPeople.length})
                </h3>

                {subGroups ? (
                  Object.entries(subGroups).sort().map(([catName, catPeople]) => (
                    <div key={catName} style={{ marginLeft: '8px', marginBottom: '10px' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px', padding: '2px 6px', borderLeft: `3px solid ${catPeople[0]?.category?.color || '#888'}` }}>
                        {catName} ({catPeople.length})
                      </div>
                      <div className="people-list">
                        {catPeople.map(p => (
                          <div
                            key={p.id}
                            className="person-card"
                            onClick={() => onPersonSelect && onPersonSelect(p)}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 4px', borderBottom: '1px solid var(--border-color)', cursor: onPersonSelect ? 'pointer' : 'default' }}
                          >
                            <div className="person-avatar" style={{ background: p.category?.color || '#888888', width: '24px', height: '24px', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', flexShrink: 0 }}>
                              {p.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div className="person-info">
                              <div className="person-row-name" style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-main)' }}>{p.name}</div>
                              <div className="person-row-meta" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{p.id}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="people-list">
                    {sectionPeople.map(p => (
                      <div
                        key={p.id}
                        className="person-card"
                        onClick={() => onPersonSelect && onPersonSelect(p)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 4px', borderBottom: '1px solid var(--border-color)', cursor: onPersonSelect ? 'pointer' : 'default' }}
                      >
                        <div className="person-avatar" style={{ background: p.category?.color || '#888888', width: '28px', height: '28px', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>
                          {p.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="person-info">
                          <div className="person-row-name" style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-main)' }}>{p.name}</div>
                          <div className="person-row-meta" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {p.category?.acronym} · {p.id}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}