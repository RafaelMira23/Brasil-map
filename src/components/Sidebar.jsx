import React from 'react';

export default function Sidebar({ person, isOpen, showDetail, onToggleDetail, onClose, isDarkMode }) {
  if (!isOpen || !person) return null;

  return (
    <div className={`sidebar ${isOpen ? 'sidebar-open' : ''} ${isDarkMode ? 'dark' : ''}`}>
      <button className="sidebar-close" onClick={onClose} title="Fechar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="sidebar-header">
        <div className="sidebar-avatar" style={{ background: person.category?.color || '#666' }}>
          {person.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <h2 className="sidebar-name">{person.name}</h2>
        <span className="sidebar-category" style={{ color: person.category?.color || '#666' }}>
          {person.category?.acronym || 'N/A'}
        </span>
      </div>

      <div className="sidebar-content">
        <div className="sidebar-section">
          <h3>Informações Básicas</h3>
          <div className="sidebar-field">
            <span className="sidebar-label">Número</span>
            <span className="sidebar-value">{person.nNumber || 'N/A'}</span>
          </div>
          <div className="sidebar-field">
            <span className="sidebar-label">Email</span>
            <span className="sidebar-value">{person.email || 'N/A'}</span>
          </div>
          <div className="sidebar-field">
            <span className="sidebar-label">Cidade</span>
            <span className="sidebar-value">{person.city || 'N/A'}</span>
          </div>
        </div>

        <button className="sidebar-toggle-btn" onClick={onToggleDetail}>
          {showDetail ? 'Ocultar Detalhes' : 'Ver Detalhes'}
          <svg className={`chevron ${showDetail ? 'chevron-up' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDetail && (
          <div className="sidebar-details">
            <div className="sidebar-section">
              <h3>Detalhes Completos</h3>
              <div className="sidebar-field">
                <span className="sidebar-label">Nome Completo</span>
                <span className="sidebar-value">{person.name || 'N/A'}</span>
              </div>
              <div className="sidebar-field">
                <span className="sidebar-label">Gerente</span>
                <span className="sidebar-value">{person.managerName || 'N/A'}</span>
              </div>
              <div className="sidebar-field">
                <span className="sidebar-label">Cidade de Trabalho</span>
                <span className="sidebar-value">{person.city || 'N/A'}</span>
              </div>
              <div className="sidebar-field">
                <span className="sidebar-label">Estado</span>
                <span className="sidebar-value">{person.state || 'N/A'}</span>
              </div>
              <div className="sidebar-field">
                <span className="sidebar-label">Endereço</span>
                <span className="sidebar-value">{person.street || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
