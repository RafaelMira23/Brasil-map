import React, { useState, useMemo } from 'react';

export default function DetailsPanel({ mode, group, groupPeople, person, personOpportunities, onClose, onPersonSelect }) {
  const [listSearch, setListSearch] = useState('');
  const [showOpps, setShowOpps] = useState(true);

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
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '420px',
        background: 'var(--bg-main)', borderLeft: '1px solid var(--border-color)',
        zIndex: 10000, display: 'flex', flexDirection: 'column',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', fontFamily: 'sans-serif',
        animation: 'slideInRight 0.3s ease-out'
      }}>
        <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        
        {/* Cabeçalho do Perfil */}
        <div style={{ background: person.category?.color || '#888888', padding: '30px 20px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.2)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: 'background 0.2s' }}>✕</button>
          
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', color: person.category?.color || '#888888', marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            {person.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '20px', fontWeight: '800', textAlign: 'center', letterSpacing: '-0.02em' }}>{person.name}</h3>
          <p style={{ margin: '6px 0 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: '500' }}>{person.email || 'Email não informado'}</p>
        </div>

        {/* Corpo com Scroll */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Informações Pessoais */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {person.nNumber && !String(person.nNumber).startsWith('ID-') && (
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '4px' }}>Identificador</label>
                <span style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '600' }}>{person.nNumber}</span>
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '4px' }}>Gestor Direto</label>
              <span style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '600' }}>{person.managerName || 'Não Informado'}</span>
            </div>
            
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '8px' }}>Categorias</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {person.allCategories?.map((cat, i) => (
                   <span key={i} style={{ fontSize: '12px', background: `${person.category?.color || '#888'}15`, color: person.category?.color || '#888', border: `1px solid ${person.category?.color || '#888'}40`, padding: '4px 10px', borderRadius: '20px', fontWeight: '700' }}>{cat}</span>
                ))}
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '4px' }}>Localidade de Trabalho</label>
              <span style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                📍 {person.city || 'N/A'} — {person.state || 'UF'}
              </span>
            </div>
          </div>

          {/* Seção de Contas (Oportunidades) */}
          {personOpportunities && personOpportunities.length > 0 && (
            <div style={{ marginTop: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '16px', fontWeight: '700' }}>Contas Responsáveis ({personOpportunities.length})</h4>
                <button onClick={() => setShowOpps(!showOpps)} style={{ background: 'var(--bg-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}>
                  {showOpps ? 'Ocultar' : 'Expandir'}
                </button>
              </div>
              
              {showOpps && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {personOpportunities.map(opp => (
                    <div key={opp.id} style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px', transition: 'transform 0.2s', cursor: 'default' }}>
                      <div style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '14px', marginBottom: '8px' }}>{opp.name}</div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '6px' }}>
                          <span style={{ filter: 'grayscale(1)' }}>📍</span> {opp.street ? `${opp.street}, ${opp.city}` : opp.city}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '6px' }}>
                          <span style={{ filter: 'grayscale(1)' }}>🏷️</span> {opp.segment} {opp.subSegment ? `/ ${opp.subSegment}` : ''}
                        </div>
                        {(opp.class1 || opp.class2) && (
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '6px' }}>
                            <span style={{ filter: 'grayscale(1)' }}>📊</span> {opp.class1} {opp.class2 ? `/ ${opp.class2}` : ''}
                          </div>
                        )}
                        {opp.addInfo && (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', fontStyle: 'italic', paddingLeft: '22px' }}>
                            Info: {opp.addInfo}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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