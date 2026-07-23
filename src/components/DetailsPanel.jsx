import React, { useState, useMemo } from 'react';

function categoryColor(str) {
  let hash = 0;
  const s = str || '';
  for (let i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 50%)`;
}

export default function DetailsPanel({
  mode,
  group,
  groupPeople,
  person,
  personOpportunities,
  selectedAccount,
  accountOwner,
  onClose,
  onPersonSelect,
  onAccountSelect
}) {
  const [listSearch, setListSearch] = useState('');
  const [showOpps, setShowOpps] = useState(true);

  // Filtrar pessoas do grupo
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

  // Agrupar pessoas por cidade/seção
  const groupedBySection = useMemo(() => {
    return filteredPeople.reduce((acc, p) => {
      let sectionName;
      if (group?.type === 'full-state') {
        sectionName = p.city || 'Sem Cidade';
      } else if (group?.type === 'city') {
        sectionName = '__flat__';
      } else {
        sectionName = p.city || 'Sem Cidade';
      }
      if (!acc[sectionName]) acc[sectionName] = [];
      acc[sectionName].push(p);
      return acc;
    }, {});
  }, [filteredPeople, group]);

  if (mode === 'closed') return null;

  // MODO: DETALHES DA CONTA (Item 4)
  if (mode === 'accountDetail' && selectedAccount) {
    const acc = selectedAccount;
    return (
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '440px',
        background: 'var(--bg-main)', borderLeft: '1px solid var(--border-color)',
        zIndex: 10000, display: 'flex', flexDirection: 'column',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.15)', fontFamily: 'sans-serif',
        animation: 'slideInRight 0.3s ease-out'
      }}>
        <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        
        {/* Cabeçalho da Conta */}
        <div style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)', padding: '28px 20px', position: 'relative', flexShrink: 0 }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.2)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>✕</button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
              Conta Comercial
            </span>
            {acc.isEndUser && (
              <span style={{ background: '#ef4444', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                End User
              </span>
            )}
          </div>

          <h3 style={{ margin: 0, color: '#fff', fontSize: '20px', fontWeight: '800', lineHeight: 1.2 }}>{acc.name}</h3>
          <p style={{ margin: '8px 0 0 0', color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>
            {[acc.city, acc.state].filter(Boolean).join(' - ')}
          </p>
        </div>

        {/* Corpo com Scroll */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Seção 1: Resumo da Conta */}
          <div>
            <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              Resumo da Conta
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Endereço Completo</label>
                <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '600' }}>
                  {[acc.street, acc.city, acc.state, acc.zip].filter(Boolean).join(', ') || 'Não Informado'}
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Segmento</label>
                <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '600' }}>{acc.segment || 'Não Informado'}</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Sub-Segmento</label>
                <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '600' }}>{acc.subSegment || 'Não Informado'}</span>
              </div>

              {acc.class1 && (
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Classificação Nível 1</label>
                  <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '600' }}>{acc.class1}</span>
                </div>
              )}

              {acc.class2 && (
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Classificação Nível 2</label>
                  <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '600' }}>{acc.class2}</span>
                </div>
              )}

              {acc.pam && (
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Total PAM</label>
                  <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '600' }}>{acc.pam}</span>
                </div>
              )}

              {acc.sales && (
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Total Sales</label>
                  <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '600' }}>{acc.sales}</span>
                </div>
              )}
            </div>
          </div>

          {/* Seção 2: Responsável pela Conta (Item 4) */}
          <div style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
              Responsável pela Conta
            </h4>

            {accountOwner ? (
              <div
                onClick={() => onPersonSelect && onPersonSelect(accountOwner)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  padding: '10px',
                  borderRadius: '10px',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #00A950 0%, #007635 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', flexShrink: 0 }}>
                  {accountOwner.name?.charAt(0)?.toUpperCase()}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {accountOwner.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {accountOwner.id} · {accountOwner.city}/{accountOwner.state}
                  </div>
                  {accountOwner.allCategories && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                      {accountOwner.allCategories.map((c, idx) => (
                        <span key={idx} style={{ fontSize: '10px', background: `${categoryColor(c)}20`, color: categoryColor(c), padding: '2px 6px', borderRadius: '10px', fontWeight: '700' }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span style={{ color: 'var(--accent-color)', fontWeight: 'bold', fontSize: '18px' }}>›</span>
              </div>
            ) : (
              <div>
                <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '14px', marginBottom: '4px' }}>
                  {acc.owner || 'Não informado'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Pessoa não encontrada na base de Responsáveis importada.
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // MODO: DETALHES DA PESSOA (Item 2)
  if (mode === 'detail' && person) {
    return (
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '440px',
        background: 'var(--bg-main)', borderLeft: '1px solid var(--border-color)',
        zIndex: 10000, display: 'flex', flexDirection: 'column',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', fontFamily: 'sans-serif',
        animation: 'slideInRight 0.3s ease-out'
      }}>
        <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        
        {/* Cabeçalho do Perfil com gradiente neutro/elegante */}
        <div style={{ background: 'linear-gradient(135deg, #00A950 0%, #006633 100%)', padding: '30px 20px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.2)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>✕</button>
          
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', color: '#00A950', marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            {person.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '20px', fontWeight: '800', textAlign: 'center' }}>{person.name}</h3>
          <p style={{ margin: '6px 0 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: '500' }}>{person.email || 'Email não informado'}</p>
        </div>

        {/* Corpo com Scroll */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Informações Pessoais */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {person.nNumber && !String(person.nNumber).startsWith('ID-') && (
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>SESA Number</label>
                <span style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '600' }}>{person.nNumber}</span>
              </div>
            )}
            
            {person.specializationCode && (
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Specialization Code</label>
                <span style={{ fontSize: '13px', background: '#3b82f620', color: '#3b82f6', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>{person.specializationCode}</span>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Gestor Direto</label>
              <span style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '600' }}>{person.managerName || 'Não Informado'}</span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Cidade de Trabalho</label>
              <span style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '600' }}>{person.city || 'N/A'} - {person.state || 'UF'}</span>
            </div>
            
            {/* Item 2: Exibir TODAS as categorias como iguais, sem categoria principal */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '8px' }}>Categorias</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {person.allCategories?.map((cat, i) => {
                  const color = categoryColor(cat);
                  return (
                    <span key={i} style={{ fontSize: '13px', background: `${color}18`, color, border: `1.5px solid ${color}50`, padding: '6px 14px', borderRadius: '20px', fontWeight: '700' }}>
                      {cat}
                    </span>
                  );
                })}
              </div>
            </div>

            {person.subcategory && (
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Detalhamento da Categoria</label>
                <span style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '600' }}>{person.subcategory}</span>
              </div>
            )}
          </div>

          {/* Seção de Contas Responsáveis */}
          <div style={{ marginTop: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '16px', fontWeight: '700' }}>
                Contas Responsáveis ({personOpportunities?.length || 0})
              </h4>
              {personOpportunities && personOpportunities.length > 0 && (
                <button onClick={() => setShowOpps(!showOpps)} style={{ background: 'var(--bg-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                  {showOpps ? 'Ocultar' : 'Expandir'}
                </button>
              )}
            </div>

            {(!personOpportunities || personOpportunities.length === 0) && (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', background: 'var(--bg-hover)', borderRadius: '10px', padding: '14px 16px', lineHeight: 1.5 }}>
                Nenhuma conta vinculada a este responsável.
              </div>
            )}
            
            {showOpps && personOpportunities && personOpportunities.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {personOpportunities.map(opp => (
                  <div
                    key={opp.id}
                    onClick={() => onAccountSelect && onAccountSelect(opp)}
                    style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px', cursor: 'pointer', transition: 'transform 0.2s' }}
                  >
                    <div style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '14px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{opp.name}</span>
                      <span style={{ fontSize: '11px', color: '#8b5cf6', fontWeight: '700' }}>Ver Conta ›</span>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        📍 {[opp.street, opp.city, opp.state].filter(Boolean).join(', ')}
                      </div>
                      {opp.segment && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          🏢 Segmento: {opp.segment}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // MODO: LISTA DO GRUPO (ESTADO / CIDADE)
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
            const isFlatSection = sectionName === '__flat__';

            return (
              <div key={sectionName} style={{ marginBottom: '18px' }}>
                {!isFlatSection && (
                  <h3 style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', padding: '4px 8px', background: 'var(--bg-hover)', borderRadius: '4px', fontWeight: '600' }}>
                    {sectionName} ({sectionPeople.length})
                  </h3>
                )}

                <div className="people-list">
                  {sectionPeople.map(p => (
                    <div
                      key={p.id}
                      className="person-card"
                      onClick={() => onPersonSelect && onPersonSelect(p)}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 4px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}
                    >
                      <div className="person-avatar" style={{ background: 'linear-gradient(135deg, #00A950 0%, #007635 100%)', width: '28px', height: '28px', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>
                        {p.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="person-info" style={{ flex: 1 }}>
                        <div className="person-row-name" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>{p.name}</div>
                        <div className="person-row-meta" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {p.allCategories?.join(' · ')} · {p.id}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}