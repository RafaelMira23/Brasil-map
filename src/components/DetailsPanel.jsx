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

  // Filtrar pessoas do grupo por busca
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

  // Item 6b: Agrupar pessoas por Categoria
  // Se uma pessoa possui múltiplas categorias (ex: IA e SERVICES), ela aparece na seção de CADA uma das categorias.
  const groupedByCategory = useMemo(() => {
    const map = {};
    filteredPeople.forEach(p => {
      const cats = p.allCategories && p.allCategories.length > 0 ? p.allCategories : ['Sem Categoria'];
      cats.forEach(cat => {
        // Se houver filtro de categoria ativo no grupo, respeita a categoria do grupo se houver
        if (group?.acronym && group.acronym !== 'GERAL' && cat !== group.acronym) {
          return;
        }
        if (!map[cat]) map[cat] = [];
        map[cat].push(p);
      });
    });
    return map;
  }, [filteredPeople, group]);

  if (mode === 'closed') return null;

  // MODO: DETALHES DA CONTA
  if (mode === 'accountDetail' && selectedAccount) {
    const acc = selectedAccount;
    return (
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '440px',
        background: 'var(--bg-main)', borderLeft: '1px solid var(--border-color)',
        zIndex: 10000, display: 'flex', flexDirection: 'column',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', fontFamily: 'Inter, system-ui, sans-serif',
        animation: 'slideInRight 0.25s ease-out'
      }}>
        <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        
        {/* Cabeçalho da Conta */}
        <div style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)', padding: '24px 20px', position: 'relative', flexShrink: 0 }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.2)', border: 'none', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>
              Conta Comercial
            </span>
            {acc.isEndUser && (
              <span style={{ background: '#ef4444', color: '#fff', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>
                End User
              </span>
            )}
          </div>

          <h3 style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: '600', lineHeight: 1.3 }}>{acc.name}</h3>
          <p style={{ margin: '6px 0 0 0', color: 'rgba(255,255,255,0.85)', fontSize: '12px' }}>
            {[acc.city, acc.state].filter(Boolean).join(' - ')}
          </p>
        </div>

        {/* Corpo com Scroll */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Resumo da Conta */}
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
              Resumo da Conta
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '3px' }}>Endereço Completo</label>
                <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>
                  {[acc.street, acc.city, acc.state, acc.zip].filter(Boolean).join(', ') || 'Não Informado'}
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '3px' }}>Segmento</label>
                <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>{acc.segment || 'Não Informado'}</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '3px' }}>Sub-Segmento</label>
                <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>{acc.subSegment || 'Não Informado'}</span>
              </div>

              {acc.class1 && (
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '3px' }}>Classificação Nível 1</label>
                  <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>{acc.class1}</span>
                </div>
              )}

              {acc.class2 && (
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '3px' }}>Classificação Nível 2</label>
                  <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>{acc.class2}</span>
                </div>
              )}

              {acc.pam && (
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '3px' }}>Total PAM</label>
                  <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>{acc.pam}</span>
                </div>
              )}

              {acc.sales && (
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '3px' }}>Total Sales</label>
                  <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>{acc.sales}</span>
                </div>
              )}
            </div>
          </div>

          {/* Responsável pela Conta */}
          <div style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                  borderRadius: '8px',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#00A950', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '16px', flexShrink: 0 }}>
                  {accountOwner.name?.charAt(0)?.toUpperCase()}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {accountOwner.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {accountOwner.id} · {accountOwner.city}/{accountOwner.state}
                  </div>
                  {accountOwner.allCategories && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                      {accountOwner.allCategories.map((c, idx) => (
                        <span key={idx} style={{ fontSize: '10px', background: `${categoryColor(c)}15`, color: categoryColor(c), padding: '2px 6px', borderRadius: '8px', fontWeight: '600' }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '13px', marginBottom: '2px' }}>
                  {acc.owner || 'Não informado'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Pessoa não encontrada na base de Responsáveis.
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // MODO: DETALHES DA PESSOA
  if (mode === 'detail' && person) {
    return (
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '440px',
        background: 'var(--bg-main)', borderLeft: '1px solid var(--border-color)',
        zIndex: 10000, display: 'flex', flexDirection: 'column',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', fontFamily: 'Inter, system-ui, sans-serif',
        animation: 'slideInRight 0.25s ease-out'
      }}>
        <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        
        {/* Cabeçalho do Perfil */}
        <div style={{ background: '#00A950', padding: '24px 20px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.2)', border: 'none', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '600', color: '#00A950', marginBottom: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            {person.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: '600', textAlign: 'center' }}>{person.name}</h3>
          <p style={{ margin: '4px 0 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '12px' }}>{person.email || 'Email não informado'}</p>
        </div>

        {/* Corpo com Scroll */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Informações Pessoais */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {person.nNumber && !String(person.nNumber).startsWith('ID-') && (
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '3px' }}>SESA Number</label>
                <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>{person.nNumber}</span>
              </div>
            )}
            
            {person.specializationCode && (
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '3px' }}>Specialization Code</label>
                <span style={{ fontSize: '12px', background: '#3b82f615', color: '#3b82f6', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>{person.specializationCode}</span>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '3px' }}>Gestor Direto</label>
              <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>{person.managerName || 'Não Informado'}</span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '3px' }}>Cidade de Trabalho</label>
              <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>{person.city || 'N/A'} - {person.state || 'UF'}</span>
            </div>
            
            {/* Exibir TODAS as categorias como iguais (excluindo 'Sem Categoria' se houver outras) */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '6px' }}>Categorias</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {(person.allCategories?.filter(c => c !== 'Sem Categoria').length > 0
                  ? person.allCategories.filter(c => c !== 'Sem Categoria')
                  : person.allCategories
                )?.map((cat, i) => {
                  const color = categoryColor(cat);
                  return (
                    <span key={i} style={{ fontSize: '12px', background: `${color}15`, color, border: `1px solid ${color}40`, padding: '4px 10px', borderRadius: '14px', fontWeight: '500' }}>
                      {cat}
                    </span>
                  );
                })}
              </div>
            </div>

            {person.subcategory && (
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '3px' }}>Detalhamento da Categoria</label>
                <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>{person.subcategory}</span>
              </div>
            )}
          </div>

          {/* Seção de Contas Responsáveis */}
          <div style={{ marginTop: '6px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '14px', fontWeight: '600' }}>
                Contas Responsáveis ({personOpportunities?.length || 0})
              </h4>
              {personOpportunities && personOpportunities.length > 0 && (
                <button onClick={() => setShowOpps(!showOpps)} style={{ background: 'var(--bg-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: '500', cursor: 'pointer' }}>
                  {showOpps ? 'Ocultar' : 'Expandir'}
                </button>
              )}
            </div>

            {(!personOpportunities || personOpportunities.length === 0) && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--bg-hover)', borderRadius: '8px', padding: '12px', lineHeight: 1.4 }}>
                Nenhuma conta vinculada a este responsável.
              </div>
            )}
            
            {showOpps && personOpportunities && personOpportunities.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {personOpportunities.map(opp => (
                  <div
                    key={opp.id}
                    onClick={() => onAccountSelect && onAccountSelect(opp)}
                    style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', cursor: 'pointer', transition: 'all 0.15s' }}
                  >
                    <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '13px', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{opp.name}</span>
                      <span style={{ fontSize: '11px', color: '#8b5cf6', fontWeight: '600' }}>Ver Conta</span>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {[opp.street, opp.city, opp.state].filter(Boolean).join(', ')}
                      </div>
                      {opp.segment && (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Segmento: {opp.segment}
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
    <div className="details-panel panel-list" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="panel-inner">
        <button className="panel-close" onClick={onClose} title="Fechar">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
        <div className="panel-header">
          <h2 className="panel-title" style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: 'var(--text-main)' }}>
            {title} ({filteredPeople.length} pessoas)
          </h2>
        </div>

        <div className="panel-list-view" style={{ overflowY: 'auto', marginTop: '12px' }}>
          <input
            type="text"
            className="panel-search"
            placeholder="Pesquisar pessoa..."
            value={listSearch}
            onChange={(e) => setListSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', boxSizing: 'border-box', marginBottom: '12px', fontSize: '12px' }}
          />

          {/* Item 6b: Exibir agrupado por Categoria */}
          {Object.entries(groupedByCategory).sort().map(([catName, catPeople]) => (
            <div key={catName} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px', padding: '4px 8px', background: 'var(--bg-hover)', borderRadius: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: categoryColor(catName) }}></span>
                {catName} ({catPeople.length})
              </div>

              <div className="people-list">
                {catPeople.map(p => (
                  <div
                    key={`${p.id}-${catName}`}
                    className="person-card"
                    onClick={() => onPersonSelect && onPersonSelect(p)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 4px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}
                  >
                    <div className="person-avatar" style={{ background: '#00A950', width: '26px', height: '26px', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600' }}>
                      {p.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="person-info" style={{ flex: 1 }}>
                      <div className="person-row-name" style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-main)' }}>{p.name}</div>
                      <div className="person-row-meta" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {p.allCategories?.join(' · ')} · {p.id}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}