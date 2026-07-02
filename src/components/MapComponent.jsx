import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { MapContainer, Marker, useMap, GeoJSON, useMapEvents, Tooltip, Polyline, TileLayer } from 'react-leaflet';
import { useDeclutteredBubbles } from '../hooks/useDeclutteredBubbles';
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

const createPersonIcon = (color, size = 10) => {
  return L.divIcon({
    html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;border:1.5px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

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

function ZoomController({ onZoomChange }) {
  const map = useMapEvents({
    zoomend: () => onZoomChange(map.getZoom())
  });
  return null;
}

function ViewController({ selectedPerson, selectedGroup }) {
  const map = useMap();
  useEffect(() => {
    if (selectedPerson && selectedPerson.coordinates) {
      map.setView(selectedPerson.coordinates, 11, { animate: true });
    }
  }, [selectedPerson, map]);

  useEffect(() => {
    if (selectedGroup && selectedGroup.coordinates) {
      const currentZoom = map.getZoom();
      const targetZoom = selectedGroup.type === 'state' ? 6 : 10;
      if (currentZoom < targetZoom) {
        map.setView(selectedGroup.coordinates, targetZoom, { animate: true });
      }
    }
  }, [selectedGroup, map]);
  return null;
}

// ClickOutsideHandler: deselects when clicking on map (outside any state polygon)
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
              color={isDarkMode ? '#64748b' : '#94a3b8'}
              weight={1}
              opacity={0.5}
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
              <div style={{ fontSize: '11px', color: '#64748b' }}>{group.count} pessoa(s)</div>
            </Tooltip>
          </Marker>
        </React.Fragment>
      ))}
    </>
  );
}

// Isolated GeoJSON layer — manages its own hover state to avoid
// re-rendering parent and causing bubble flicker
function StateGeoJSONLayer({ geojsonData, clickedState, onStateClick, onClickOutside }) {
  const layersRef = useRef({});
  const hoveredRef = useRef(null);

  const defaultStyle = {
    color: '#00A950',
    weight: 1,
    fillOpacity: 0.0
  };

  const activeStyle = {
    color: '#00A950',
    weight: 3,
    fillColor: '#00A950',
    fillOpacity: 0.25
  };

  const hoverStyle = {
    color: '#00A950',
    weight: 2,
    fillColor: '#00A950',
    fillOpacity: 0.07
  };

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
  }, [clickedState]); // eslint-disable-line

  // Re-apply styles when clickedState changes
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
  }, []); // eslint-disable-line — we use refs for mutable state inside handlers

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

export default function MapComponent({ data, selectedPerson, selectedGroup, onPersonSelect, onGroupSelect, onStateSelect, onStateDeselect, isDarkMode, STATE_CENTERS }) {
  const [geojsonData, setGeojsonData] = useState(null);
  const [geojsonError, setGeojsonError] = useState(false);
  const [clickedState, setClickedState] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(4);

  const minZoomLevel = 4;
  const maxZoomLevel = 12;
  const brazilBounds = [[-34.5, -74.0], [5.0, -34.0]];
  const brandColor = isDarkMode ? '#00C84B' : '#00A950';

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
        // Deselecting — close sidebar
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

  // Bubbles only depend on clickedState (NOT hoveredState) → no flicker on hover
  const stateLayerData = useMemo(() => {
    if (currentZoom > 5 || !clickedState) return [];
    const groups = {};
    data.forEach(p => {
      if (!p.state || p.state !== clickedState) return;
      const uf = p.state;
      const catAcr = p.category?.acronym || 'Sem Categoria';
      const key = `${uf}-${catAcr}`;

      if (!groups[key]) {
        groups[key] = {
          type: 'state',
          state: uf,
          acronym: catAcr,
          count: 0,
          coordinates: STATE_CENTERS[uf] || [-14.24, -51.93],
          color: p.category?.color || brandColor
        };
      }
      groups[key].count++;
    });
    return Object.values(groups);
  }, [data, clickedState, currentZoom, STATE_CENTERS, brandColor]);

  const cityClusters = useMemo(() => {
    if (currentZoom < 6 || !clickedState) return [];
    const groups = {};
    data.forEach(p => {
      if (!p.city || !p.state || !p.coordinates || p.state !== clickedState) return;
      const catAcr = p.category?.acronym || 'Sem Categoria';
      const key = `${p.city}-${p.state}-${catAcr}`;

      if (!groups[key]) {
        groups[key] = {
          type: 'city',
          city: p.city,
          state: p.state,
          acronym: catAcr,
          count: 0,
          coordinates: p.coordinates,
          color: p.category?.color || brandColor
        };
      }
      groups[key].count++;
    });
    return Object.values(groups);
  }, [data, clickedState, currentZoom, brandColor]);

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
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          opacity={isDarkMode ? 0.6 : 1}
        />
        <ZoomController onZoomChange={setCurrentZoom} />
        <ViewController selectedPerson={selectedPerson} selectedGroup={selectedGroup} />
        <ClickOutsideHandler onClickOutside={handleClickOutside} />

        {!geojsonError && (
          <StateGeoJSONLayer
            geojsonData={geojsonData}
            clickedState={clickedState}
            onStateClick={handleStateClick}
            onClickOutside={handleClickOutside}
          />
        )}

        {/* BUBBLES — only render when a state is selected */}
        {currentZoom <= 5 && stateLayerData.length > 0 && (
          <BubbleLayer data={stateLayerData} onGroupSelect={onGroupSelect} isDarkMode={isDarkMode} />
        )}
        {currentZoom >= 6 && cityClusters.length > 0 && (
          <BubbleLayer data={cityClusters} onGroupSelect={onGroupSelect} isDarkMode={isDarkMode} />
        )}
      </MapContainer>

      {geojsonError && (
        <div style={{ position: 'absolute', top: 90, left: '50%', transform: 'translateX(-50%)', background: '#fee2e2', color: '#991b1b', padding: '8px 14px', borderRadius: 8, fontSize: 12, zIndex: 1000, maxWidth: '90%', textAlign: 'center' }}>
          Não foi possível carregar <code>public/brazil-states.geojson</code>. Sem esse arquivo não há bordas nem "mapa" visível, só o fundo colorido — confira se ele existe nesse caminho no projeto.
        </div>
      )}

      {clickedState && (
        <div
          style={{ position: 'absolute', top: 90, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,169,80,0.92)', color: '#fff', padding: '4px 16px', borderRadius: 20, fontSize: 12, zIndex: 1000, fontWeight: '600', pointerEvents: 'none', whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
        >
          {STATE_NAMES[clickedState] || clickedState} — clique fora para limpar
        </div>
      )}
    </div>
  );
}