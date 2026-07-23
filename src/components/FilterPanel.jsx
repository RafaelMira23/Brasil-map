import React, { useState } from 'react';

export default function FilterPanel({
  isOpen, onClose, isDarkMode,
  statesList, selectedStates, setSelectedStates,
  citiesList, selectedCities, setSelectedCities,
  categoriesList, selectedCategories, setSelectedCategories,
  segmentsList, selectedSegments, setSelectedSegments,
  subSegmentsList, selectedSubSegments, setSelectedSubSegments,
  class1List, selectedClass1, setSelectedClass1,
  class2List, selectedClass2, setSelectedClass2,
  onlyWithAccounts, setOnlyWithAccounts,
  onlyWithCategory, setOnlyWithCategory,
  includeNonSJobCodes, setIncludeNonSJobCodes
}) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const toggleArrayItem = (arr, item, setArr) => {
    if (arr.includes(item)) {
      setArr(arr.filter(i => i !== item));
    } else {
      setArr([...arr, item]);
    }
  };

  const MultiSelectBlock = ({ title, options, selectedItems, setSelection }) => {
    if (!options || options.length === 0) return null;

    const filteredOptions = options.filter(opt => 
      opt.toLowerCase().includes(searchTerm.toLowerCase()) || selectedItems.includes(opt)
    );

    if (filteredOptions.length === 0) return null;

    return (
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px', letterSpacing: '0.05em' }}>{title}</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {filteredOptions.map(opt => {
            const isSelected = selectedItems.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => toggleArrayItem(selectedItems, opt, setSelection)}
                style={{
                  background: isSelected ? 'var(--accent-color)' : 'var(--bg-main)',
                  color: isSelected ? '#fff' : 'var(--text-main)',
                  border: `1px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: isSelected ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const ToggleSwitch = ({ label, description, checked, onChange }) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        padding: '12px',
        borderRadius: '10px',
        background: 'var(--bg-hover)',
        border: '1px solid var(--border-color)',
        marginBottom: '12px',
        cursor: 'pointer'
      }}
      onClick={() => onChange(!checked)}
    >
      <div>
        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>{label}</div>
        {description && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{description}</div>}
      </div>
      <div
        style={{
          width: '40px',
          height: '22px',
          borderRadius: '12px',
          background: checked ? 'var(--accent-color)' : '#cbd5e1',
          position: 'relative',
          transition: 'background 0.2s flex-shrink-0'
        }}
      >
        <div
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: '#fff',
            position: 'absolute',
            top: '2px',
            left: checked ? '20px' : '2px',
            transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
          }}
        />
      </div>
    </div>
  );

  const clearAll = () => {
    setSelectedStates([]);
    setSelectedCities([]);
    setSelectedCategories([]);
    setSelectedSegments([]);
    setSelectedSubSegments([]);
    setSelectedClass1([]);
    setSelectedClass2([]);
    setOnlyWithAccounts(false);
    setOnlyWithCategory(false);
    setIncludeNonSJobCodes(false);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: '420px',
      background: 'var(--bg-main)', borderLeft: '1px solid var(--border-color)',
      zIndex: 10000, display: 'flex', flexDirection: 'column',
      boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', fontFamily: 'sans-serif'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>Filtros de Busca</h2>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
      </div>

      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-hover)' }}>
        <input 
          type="text"
          placeholder="Pesquisar opções de filtro..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%', padding: '10px 14px', borderRadius: '8px', 
            border: '1px solid var(--border-color)', background: 'var(--bg-main)',
            color: 'var(--text-main)', outline: 'none', boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>Regras & Toggles Especializados</h3>
        
        {/* Item 7 e Item 9: Filtros solicitados pelo usuário */}
        <ToggleSwitch 
          label="Apenas pessoas com contas" 
          description="Mostra apenas responsáveis que possuem pelo menos 1 conta vinculada"
          checked={onlyWithAccounts}
          onChange={setOnlyWithAccounts}
        />

        <ToggleSwitch 
          label="Apenas pessoas com categoria" 
          description="Oculta pessoas sem nenhuma categoria vinculada"
          checked={onlyWithCategory}
          onChange={setOnlyWithCategory}
        />

        <ToggleSwitch 
          label="Incluir pessoas sem Job Code 'S'" 
          description="Por padrão é mostrado apenas Job Codes iniciando em S (SUEP, SSSP, SCOP...)"
          checked={includeNonSJobCodes}
          onChange={setIncludeNonSJobCodes}
        />

        <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)', marginTop: '24px' }}>Filtros de Pessoas</h3>
        <MultiSelectBlock title="Categoria / De quê" options={categoriesList} selectedItems={selectedCategories} setSelection={setSelectedCategories} />
        <MultiSelectBlock title="Estado" options={statesList} selectedItems={selectedStates} setSelection={setSelectedStates} />
        <MultiSelectBlock title="Cidade" options={citiesList} selectedItems={selectedCities} setSelection={setSelectedCities} />

        <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)', marginTop: '24px' }}>Filtros de Contas</h3>
        <MultiSelectBlock title="Segmento" options={segmentsList} selectedItems={selectedSegments} setSelection={setSelectedSegments} />
        <MultiSelectBlock title="Sub-Segmento" options={subSegmentsList} selectedItems={selectedSubSegments} setSelection={setSelectedSubSegments} />
        <MultiSelectBlock title="Classificação Nível 1" options={class1List} selectedItems={selectedClass1} setSelection={setSelectedClass1} />
        <MultiSelectBlock title="Classificação Nível 2" options={class2List} selectedItems={selectedClass2} setSelection={setSelectedClass2} />
      </div>

      <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px' }}>
        <button onClick={clearAll} style={{ flex: 1, padding: '12px', background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
          Limpar Tudo
        </button>
        <button onClick={onClose} style={{ flex: 1, padding: '12px', background: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
}
