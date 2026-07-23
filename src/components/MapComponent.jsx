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

const createCountBadge = (color, count, isDarkMode = false) => {
  const size = count > 99 ? 34 : count > 9 ? 28 : 22;
  const html = `<div style="background:${color};color:#fff;width:${size}px;height:${size}px;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:${size * 0.4}px;font-weight:bold;box-shadow:0 3px 6px rgba(0,0,0,0.25);">${count}</div>`;
  return L.divIcon({
    html,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const createOppIcon = (color = '#8b5cf6', isExact = false) => {
  const html = isExact
    ? `<div style="background:${color};width:20px;height:20px;border-radius:4px;border:2px solid #fff;box-shadow:0 0 12px ${color};display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:bold;">🏢</div>`
    : `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 10px ${color};"></div>`;
  return L.divIcon({
    html,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

function ZoomController({ onZoomChange }) {
  const map = useMapEvents({
    zoomend: () => onZoomChange(map.getZoom())
  });
  return null;
}

function ViewController({ selectedPerson, selectedAccount, selectedGroup, myOpps }) {
  const map = useMap();

  useEffect(() => {
    if (selectedAccount && selectedAccount.coordinates) {
      map.setView(selectedAccount.coordinates, 14, { animate: true });
    }
  }, [selectedAccount, map]);

  useEffect(() => {
    if (selectedPerson) {
      if (myOpps && myOpps.length > 0) {
        const bounds = L.latLngBounds([selectedPerson.coordinates]);
        myOpps.forEach(o => {
          if (o.coordinates) bounds.extend(o.coordinates);
        });
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, animate: true });
      } else if (selectedPerson.coordinates) {
        map.setView(selectedPerson.coordinates, 12, { animate: true });
      }
    }
  }, [selectedPerson, myOpps, map]);

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
            icon={createCountBadge(group.color, group.count, isDarkMode)}
            eventHandlers={{ click: () => onGroupSelect(group) }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
              <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#1e293b' }}>
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

function OpportunitiesLayer({ opps, onAccountSelect }) {
  if (!opps || opps.length === 0) return null;

  return (
    <>
      {opps.map(opp => (
        <Marker
          key={opp.id}
          position={opp.coordinates}
          icon={createOppIcon('#8b5cf6', opp.isExactGeocoded)}
          zIndexOffset={1000}
          eventHandlers={{
            click: () => onAccountSelect && onAccountSelect(opp)
          }}
        >
          <Tooltip direction="top" offset={[0, -10]} opacity={1}>
            <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#1e293b' }}>
              {opp.name}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Segmento: {opp.segment || 'N/A'}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>📍 {[opp.street, opp.city].filter(Boolean).join(', ')}</div>
            {opp.owner && <div style={{ fontSize: '11px', color: '#8b5cf6', fontWeight: 'bold' }}>👤 Responsável: {opp.owner}</div>}
          </Tooltip>
        </Marker>
      ))}
    </>
  );
}

function StateGeoJSONLayer({ geojsonData, clickedState, onStateClick }) {
  const layersRef = useRef({});
  const hoveredRef = useRef(null);

  const defaultStyle = { color: '#00A950', weight: 1, fillOpacity: 0.0 };
  const activeStyle = { color: '#00A950', weight: 3, fillColor: '#00A950', fillOpacity: 0.25 };
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
  onToggleCategoryFilter
}) {
  const [geojsonData, setGeojsonData] = useState(null);
  const [geojsonError, setGeojsonError] = useState(false);
  const [clickedState, setClickedState] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(4);

  const minZoomLevel = 4;
  const maxZoomLevel = 14;
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

  // Item 2 e Item 3: Múltiplas categorias + Visualização global em todo o Brasil
  const stateLayerData = useMemo(() => {
    if (currentZoom > 5 || mapMode !== 'people') return [];
    const groups = {};
    data.forEach(p => {
      if (!p.state) return;
      const uf = p.state;
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
  }, [data, currentZoom, mapMode, STATE_CENTERS]);

  const cityClusters = useMemo(() => {
    if (currentZoom < 6 || mapMode !== 'people') return [];
    const groups = {};
    data.forEach(p => {
      if (!p.city || !p.state || !p.coordinates) return;
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
  }, [data, currentZoom, mapMode]);

  // Contas da pessoa selecionada (Item 8)
  const selectedPersonOpps = useMemo(() => {
    if (!selectedPerson || !oppData) return [];
    return oppData.filter(o => o.ownerNormalized === selectedPerson.nameNormalized && o.coordinates);
  }, [selectedPerson, oppData]);

  // Extrair resumo de categorias para a Legenda (Item 10)
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
        />
        <ClickOutsideHandler onClickOutside={handleClickOutside} />

        {!geojsonError && (
          <StateGeoJSONLayer
            geojsonData={geojsonData}
            clickedState={clickedState}
            onStateClick={handleStateClick}
          />
        )}

        {/* MODO PESSOAS: Pinos e Bolhas Globais de Pessoas */}
        {mapMode === 'people' && currentZoom <= 5 && stateLayerData.length > 0 && (
          <BubbleLayer data={stateLayerData} onGroupSelect={onGroupSelect} isDarkMode={isDarkMode} />
        )}
        {mapMode === 'people' && currentZoom >= 6 && cityClusters.length > 0 && (
          <BubbleLayer data={cityClusters} onGroupSelect={onGroupSelect} isDarkMode={isDarkMode} />
        )}

        {/* MODO CONTAS: Pinos de Contas no Mapa (Item 4 e 5) */}
        {mapMode === 'accounts' && (
          <OpportunitiesLayer opps={oppData} onAccountSelect={onAccountSelect} />
        )}

        {/* Pinos das Contas de um Responsável selecionado (Item 8) */}
        {mapMode === 'people' && selectedPersonOpps.length > 0 && (
          <OpportunitiesLayer opps={selectedPersonOpps} onAccountSelect={onAccountSelect} />
        )}
      </MapContainer>

      {/* Legenda de Categorias no Canto do Mapa (Item 10) */}
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
        <div style={{ position: 'absolute', top: 90, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,169,80,0.92)', color: '#fff', padding: '4px 16px', borderRadius: 20, fontSize: 12, zIndex: 1000, fontWeight: '600', pointerEvents: 'none' }}>
          {STATE_NAMES[clickedState] || clickedState} — clique fora para desmarcar
        </div>
      )}
    </div>
  );
}