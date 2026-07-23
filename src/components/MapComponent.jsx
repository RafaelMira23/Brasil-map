import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { MapContainer, Marker, useMap, GeoJSON, useMapEvents, Tooltip, Polyline, TileLayer } from 'react-leaflet';
import { useDeclutteredBubbles } from '../hooks/useDeclutteredBubbles';
import MapLegend from './MapLegend';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const STATE_NAMES = {
  AC: 'Acre', AL: 'Alagoas', AM: 'Amazonas', AP: 'Amapá', BA: 'Bahia', CE: 'Ceará',
  DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão',
  MG: 'Minas Gerais', MS: 'Mato Grosso do Sul', MT: 'Mato Grosso', PA: 'Pará',
  PB: 'Paraíba', PE: 'Pernambuco', PI: 'Piauí', PR: 'Paraná', RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte', RO: 'Rondônia', RR: 'Roraima', RS: 'Rio Grande do Sul',
  SC: 'Santa Catarina', SE: 'Sergipe', SP: 'São Paulo', TO: 'Tocantins'
};

function categoryColor(str) {
  let hash = 0;
  const s = str || '';
  for (let i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 50%)`;
}

function isValidCoord(coords) {
  if (!coords || !Array.isArray(coords) || coords.length < 2) return false;
  const [lat, lng] = coords;
  return typeof lat === 'number' && typeof lng === 'number' &&
    !isNaN(lat) && !isNaN(lng) &&
    lat >= -35 && lat <= 6 &&   // limites do Brasil
    lng >= -75 && lng <= -34;
}

const createCountBadge = (color, count) => {
  const size = count > 99 ? 32 : count > 9 ? 26 : 22;
  const html = `<div style="background:${color};color:#fff;width:${size}px;height:${size}px;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:${size * 0.42}px;font-weight:600;box-shadow:0 2px 6px rgba(0,0,0,0.2);">${count}</div>`;
  return L.divIcon({
    html,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Ícone de conta — building pin roxo, consistente para todas as contas
const ACCOUNT_ICON = L.divIcon({
  html: `<div style="background:#7c3aed;width:28px;height:28px;border-radius:6px;border:2px solid #fff;box-shadow:0 3px 8px rgba(124,58,237,0.45);display:flex;align-items:center;justify-content:center;">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1"/>
    </svg>
  </div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Ícone de responsável destacado (quando conta está selecionada)
const createOwnerHighlightIcon = (initial) => {
  return L.divIcon({
    html: `<div style="background:#00A950;width:36px;height:36px;border-radius:50%;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,169,80,0.6);display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:700;">
      ${initial || '?'}
    </div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

function ZoomController({ onZoomChange }) {
  const map = useMapEvents({
    zoomend: () => onZoomChange(map.getZoom())
  });
  return null;
}

function ViewController({ selectedPerson, selectedAccount, selectedGroup, myOpps, accountOwnerPerson }) {
  const map = useMap();

  useEffect(() => {
    if (selectedAccount && isValidCoord(selectedAccount.coordinates)) {
      map.setView(selectedAccount.coordinates, 14, { animate: true });
    }
  }, [selectedAccount, map]);

  useEffect(() => {
    if (selectedPerson && !selectedAccount) {
      if (myOpps && myOpps.length > 0) {
        const bounds = L.latLngBounds([selectedPerson.coordinates]);
        myOpps.forEach(o => {
          if (isValidCoord(o.coordinates)) bounds.extend(o.coordinates);
        });
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, animate: true });
      } else if (isValidCoord(selectedPerson.coordinates)) {
        map.setView(selectedPerson.coordinates, 12, { animate: true });
      }
    }
  }, [selectedPerson, myOpps, map, selectedAccount]);

  useEffect(() => {
    if (selectedGroup && selectedGroup.coordinates && !selectedPerson && !selectedAccount) {
      const currentZoom = map.getZoom();
      const targetZoom = selectedGroup.type === 'state' ? 6 : 10;
      if (currentZoom < targetZoom) {
        map.setView(selectedGroup.coordinates, targetZoom, { animate: true });
      }
    }
  }, [selectedGroup, selectedPerson, selectedAccount, map]);

  return null;
}

function ClickOutsideHandler({ onClickOutside }) {
  useMapEvents({
    click: () => onClickOutside()
  });
  return null;
}

function BubbleLayer({ data, onGroupSelect, isDarkMode }) {
  const declutteredData = useDeclutteredBubbles(data);

  return (
    <>
      {declutteredData.map(group => (
        <React.Fragment key={`bubble-${group.type}-${group.state}-${group.city || ''}-${group.acronym}`}>
          {group.needsGuideLine && (
            <Polyline
              positions={[group.originalCoordinates, group.simulatedCoordinates]}
              color={isDarkMode ? '#38bdf8' : '#94a3b8'}
              weight={isDarkMode ? 1.5 : 1}
              opacity={isDarkMode ? 0.8 : 0.5}
              dashArray="2, 4"
            />
          )}
          <Marker
            position={group.simulatedCoordinates}
            icon={createCountBadge(group.color, group.count)}
            eventHandlers={{ click: () => onGroupSelect(group) }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
              <div style={{ fontWeight: '600', fontSize: '12px', color: '#0f172a' }}>
                {group.type === 'state'
                  ? `${group.state} — ${group.acronym}`
                  : `${group.city} / ${group.state} — ${group.acronym}`
                }
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{group.count} responsável(is)</div>
            </Tooltip>
          </Marker>
        </React.Fragment>
      ))}
    </>
  );
}

function OpportunitiesLayer({ opps, onAccountSelect, selectedAccountId }) {
  // Filtra apenas contas com coordenadas válidas dentro do Brasil
  const validOpps = useMemo(() => {
    return (opps || []).filter(opp => isValidCoord(opp.coordinates));
  }, [opps]);

  if (validOpps.length === 0) return null;

  return (
    <>
      {validOpps.map(opp => (
        <Marker
          key={opp.id}
          position={opp.coordinates}
          icon={ACCOUNT_ICON}
          zIndexOffset={opp.id === selectedAccountId ? 2000 : 1000}
          eventHandlers={{
            click: () => onAccountSelect && onAccountSelect(opp)
          }}
        >
          <Tooltip direction="top" offset={[0, -14]} opacity={0.95}>
            <div style={{ fontWeight: '600', fontSize: '12px', color: '#0f172a' }}>
              {opp.name}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Segmento: {opp.segment || 'N/A'}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{[opp.street, opp.city].filter(Boolean).join(', ')}</div>
            {opp.owner && <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '600', marginTop: '2px' }}>Responsável: {opp.owner}</div>}
          </Tooltip>
        </Marker>
      ))}
    </>
  );
}

// Marcador do responsável quando uma conta está selecionada
function AccountOwnerLayer({ account, owner }) {
  if (!account || !owner || !isValidCoord(owner.coordinates) || !isValidCoord(account.coordinates)) return null;

  const initial = owner.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <>
      {/* Linha conectando conta → responsável */}
      <Polyline
        positions={[account.coordinates, owner.coordinates]}
        color="#00A950"
        weight={2}
        opacity={0.6}
        dashArray="5, 6"
      />
      {/* Marcador do responsável */}
      <Marker
        position={owner.coordinates}
        icon={createOwnerHighlightIcon(initial)}
        zIndexOffset={3000}
      >
        <Tooltip direction="top" offset={[0, -18]} opacity={0.97} permanent={false}>
          <div style={{ fontWeight: '600', fontSize: '12px', color: '#0f172a' }}>{owner.name}</div>
          <div style={{ fontSize: '11px', color: '#00A950', fontWeight: '500' }}>Responsável pela conta</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>{owner.city}/{owner.state}</div>
        </Tooltip>
      </Marker>
    </>
  );
}

function StateGeoJSONLayer({ geojsonData, clickedState, onStateClick }) {
  const layersRef = useRef({});
  const hoveredRef = useRef(null);

  const defaultStyle = { color: '#00A950', weight: 1, fillOpacity: 0.0 };
  const activeStyle = { color: '#00A950', weight: 2.5, fillColor: '#00A950', fillOpacity: 0.2 };
  const hoverStyle = { color: '#00A950', weight: 2, fillColor: '#00A950', fillOpacity: 0.07 };

  const applyStyle = useCallback((sigla) => {
    const layer = layersRef.current[sigla];
    if (!layer) return;
    if (sigla === clickedState) {
      layer.setStyle(activeStyle);
    } else if (sigla === hoveredRef.current) {
      layer.setStyle(hoverStyle);
    } else {
      layer.setStyle(defaultStyle);
    }
  }, [clickedState]);

  useEffect(() => {
    Object.keys(layersRef.current).forEach(sigla => applyStyle(sigla));
  }, [clickedState, applyStyle]);

  const onEachFeature = useCallback((feature, layer) => {
    const sigla = feature.properties.sigla;
    layersRef.current[sigla] = layer;

    layer.on({
      mouseover: () => {
        hoveredRef.current = sigla;
        if (sigla !== clickedState) layer.setStyle(hoverStyle);
      },
      mouseout: () => {
        hoveredRef.current = null;
        if (sigla !== clickedState) layer.setStyle(defaultStyle);
      },
      click: (e) => {
        L.DomEvent.stopPropagation(e);
        onStateClick(sigla, feature.properties.name || sigla);
      }
    });
  }, [clickedState, onStateClick]);

  if (!geojsonData) return null;

  return (
    <GeoJSON
      key="brazil-states-static"
      data={geojsonData}
      style={() => defaultStyle}
      onEachFeature={onEachFeature}
    />
  );
}

export default function MapComponent({
  data,
  oppData,
  selectedPerson,
  selectedAccount,
  accountOwnerPerson,
  selectedGroup,
  onPersonSelect,
  onAccountSelect,
  onGroupSelect,
  onStateSelect,
  onStateDeselect,
  isDarkMode,
  STATE_CENTERS,
  mapMode = 'people',
  selectedCategories = [],
  onToggleCategoryFilter,
  hasActiveFilters = false
}) {
  const [geojsonData, setGeojsonData] = useState(null);
  const [geojsonError, setGeojsonError] = useState(false);
  const [clickedState, setClickedState] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(4);

  const minZoomLevel = 4;
  const maxZoomLevel = 18;
  const brazilBounds = [[-34.5, -74.0], [5.0, -34.0]];

  useEffect(() => {
    fetch('/brazil-states.geojson')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => setGeojsonData(json))
      .catch(err => {
        console.error("Erro ao carregar /brazil-states.geojson:", err);
        setGeojsonError(true);
      });
  }, []);

  const handleStateClick = useCallback((sigla, name) => {
    setClickedState(prev => {
      const next = prev === sigla ? null : sigla;
      if (next === null) {
        if (onStateDeselect) onStateDeselect();
      } else {
        if (onStateSelect) onStateSelect(next, name);
      }
      return next;
    });
  }, [onStateSelect, onStateDeselect]);

  const handleClickOutside = useCallback(() => {
    if (clickedState) {
      setClickedState(null);
      if (onStateDeselect) onStateDeselect();
    }
  }, [clickedState, onStateDeselect]);

  // -----------------------------------------------------------------------
  // Lógica de visibilidade das bolhas (mapa de pessoas):
  //   - Sem filtro + sem estado clicado  → mapa limpo
  //   - Sem filtro + estado clicado      → bolhas só do estado clicado
  //   - Qualquer filtro ativo            → bolhas de todo o Brasil
  // -----------------------------------------------------------------------

  const stateLayerData = useMemo(() => {
    if (currentZoom > 5 || mapMode !== 'people') return [];
    // Sem filtro e sem estado clicado → não mostra nada
    if (!hasActiveFilters && !clickedState) return [];

    const groups = {};
    data.forEach(p => {
      if (!p.state) return;
      const uf = p.state;
      // Sem filtro → mostra apenas o estado clicado
      if (!hasActiveFilters && uf !== clickedState) return;

      const cats = p.allCategories && p.allCategories.length > 0 ? p.allCategories : ['Sem Categoria'];
      cats.forEach(catAcr => {
        const key = `${uf}-${catAcr}`;
        if (!groups[key]) {
          groups[key] = {
            type: 'state',
            state: uf,
            acronym: catAcr,
            count: 0,
            coordinates: STATE_CENTERS[uf] || [-14.24, -51.93],
            color: categoryColor(catAcr)
          };
        }
        groups[key].count++;
      });
    });
    return Object.values(groups);
  }, [data, currentZoom, mapMode, STATE_CENTERS, hasActiveFilters, clickedState]);

  const cityClusters = useMemo(() => {
    if (currentZoom < 6 || mapMode !== 'people') return [];
    // Sem filtro e sem estado clicado → não mostra nada
    if (!hasActiveFilters && !clickedState) return [];

    const groups = {};
    data.forEach(p => {
      if (!p.city || !p.state || !isValidCoord(p.coordinates)) return;
      // Sem filtro → mostra apenas cidades do estado clicado
      if (!hasActiveFilters && p.state !== clickedState) return;

      const cats = p.allCategories && p.allCategories.length > 0 ? p.allCategories : ['Sem Categoria'];
      cats.forEach(catAcr => {
        const key = `${p.city}-${p.state}-${catAcr}`;
        if (!groups[key]) {
          groups[key] = {
            type: 'city',
            city: p.city,
            state: p.state,
            acronym: catAcr,
            count: 0,
            coordinates: p.coordinates,
            color: categoryColor(catAcr)
          };
        }
        groups[key].count++;
      });
    });
    return Object.values(groups);
  }, [data, currentZoom, mapMode, hasActiveFilters, clickedState]);

  // Contas do responsável selecionado (modo pessoas)
  const selectedPersonOpps = useMemo(() => {
    if (!selectedPerson || !oppData) return [];
    return oppData.filter(o => o.ownerNormalized === selectedPerson.nameNormalized && isValidCoord(o.coordinates));
  }, [selectedPerson, oppData]);

  // Resumo de categorias para a Legenda
  const legendCategories = useMemo(() => {
    const counts = {};
    data.forEach(p => {
      p.allCategories?.forEach(cat => {
        counts[cat] = (counts[cat] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  return (
    <div className="map-wrapper" style={{ background: isDarkMode ? '#0f172a' : '#cbd5e1', height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer
        center={[-14.235, -51.925]}
        zoom={minZoomLevel}
        style={{ height: '100%', width: '100%', background: 'transparent' }}
        maxBounds={brazilBounds}
        maxBoundsViscosity={0.8}
        minZoom={minZoomLevel}
        maxZoom={maxZoomLevel}
        zoomControl={false}
      >
        <TileLayer
          url={isDarkMode 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
          attribution='&copy; OpenStreetMap contributors'
          opacity={1}
        />
        <ZoomController onZoomChange={setCurrentZoom} />
        <ViewController
          selectedPerson={selectedPerson}
          selectedAccount={selectedAccount}
          selectedGroup={selectedGroup}
          myOpps={selectedPersonOpps}
          accountOwnerPerson={accountOwnerPerson}
        />
        <ClickOutsideHandler onClickOutside={handleClickOutside} />

        {!geojsonError && (
          <StateGeoJSONLayer
            geojsonData={geojsonData}
            clickedState={clickedState}
            onStateClick={handleStateClick}
          />
        )}

        {/* MODO PESSOAS: Bolhas e clusters */}
        {mapMode === 'people' && currentZoom <= 5 && stateLayerData.length > 0 && (
          <BubbleLayer data={stateLayerData} onGroupSelect={onGroupSelect} isDarkMode={isDarkMode} />
        )}
        {mapMode === 'people' && currentZoom >= 6 && cityClusters.length > 0 && (
          <BubbleLayer data={cityClusters} onGroupSelect={onGroupSelect} isDarkMode={isDarkMode} />
        )}

        {/* MODO CONTAS: Pinos de todas as contas */}
        {mapMode === 'accounts' && (
          <OpportunitiesLayer
            opps={oppData}
            onAccountSelect={onAccountSelect}
            selectedAccountId={selectedAccount?.id}
          />
        )}

        {/* Pinos das contas do responsável selecionado (modo pessoas) */}
        {mapMode === 'people' && selectedPersonOpps.length > 0 && (
          <OpportunitiesLayer
            opps={selectedPersonOpps}
            onAccountSelect={onAccountSelect}
            selectedAccountId={selectedAccount?.id}
          />
        )}

        {/* Responsável destacado quando uma conta está selecionada */}
        {selectedAccount && accountOwnerPerson && (
          <AccountOwnerLayer
            account={selectedAccount}
            owner={accountOwnerPerson}
          />
        )}
      </MapContainer>

      <MapLegend
        categories={legendCategories}
        selectedCategories={selectedCategories}
        onToggleCategory={onToggleCategoryFilter}
        isDarkMode={isDarkMode}
      />

      {geojsonError && (
        <div style={{ position: 'absolute', top: 90, left: '50%', transform: 'translateX(-50%)', background: '#fee2e2', color: '#991b1b', padding: '8px 14px', borderRadius: 8, fontSize: 12, zIndex: 1000, maxWidth: '90%', textAlign: 'center' }}>
          Não foi possível carregar o arquivo GeoJSON dos estados.
        </div>
      )}

      {clickedState && (
        <div style={{ position: 'absolute', top: 90, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,169,80,0.92)', color: '#fff', padding: '4px 16px', borderRadius: 20, fontSize: 12, zIndex: 1000, fontWeight: '500' }}>
          {STATE_NAMES[clickedState] || clickedState} — clique fora para desmarcar
        </div>
      )}
    </div>
  );
}