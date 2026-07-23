import React, { useState } from 'react';

function categoryColor(str) {
  let hash = 0;
  const s = str || '';
  for (let i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 50%)`;
}

export default function MapLegend({ categories, selectedCategories, onToggleCategory, isDarkMode }) {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!categories || categories.length === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '24px',
        left: '24px',
        zIndex: 1000,
        background: isDarkMode ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(8px)',
        border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
        borderRadius: '10px',
        padding: isMinimized ? '8px 14px' : '12px 14px',
        boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.1)',
        maxWidth: '260px',
        maxHeight: isMinimized ? 'auto' : '240px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        fontFamily: 'Inter, system-ui, sans-serif',
        transition: 'all 0.2s ease'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          cursor: 'pointer',
          userSelect: 'none'
        }}
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: '600',
            color: isDarkMode ? '#f8fafc' : '#0f172a',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00A950' }}></span>
          Legenda de Categorias ({categories.length})
        </span>
        <button
          style={{
            background: 'transparent',
            border: 'none',
            color: isDarkMode ? '#94a3b8' : '#64748b',
            cursor: 'pointer',
            fontSize: '11px',
            padding: '2px 4px'
          }}
        >
          {isMinimized ? '+' : '−'}
        </button>
      </div>

      {!isMinimized && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            overflowY: 'auto',
            paddingRight: '2px',
            marginTop: '4px'
          }}
        >
          {categories.map(({ name, count }) => {
            const color = categoryColor(name);
            const isSelected = selectedCategories.length === 0 || selectedCategories.includes(name);

            return (
              <div
                key={name}
                onClick={() => onToggleCategory && onToggleCategory(name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  padding: '4px 6px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  opacity: isSelected ? 1 : 0.45,
                  background: isSelected
                    ? (isDarkMode ? 'rgba(51, 65, 85, 0.4)' : 'rgba(241, 245, 249, 0.8)')
                    : 'transparent',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: color,
                      flexShrink: 0
                    }}
                  />
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: isSelected ? '500' : '400',
                      color: isDarkMode ? '#e2e8f0' : '#1e293b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    title={name}
                  >
                    {name}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: isDarkMode ? '#94a3b8' : '#64748b',
                    marginLeft: '8px'
                  }}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
