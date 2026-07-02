import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, GeoJSON, useMapEvents, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const createPersonIcon = (color, size = 12) => {
  return L.divIcon({
    html: `<div style="
      background:${color};
      width:${size}px;height:${size}px;
      border-radius:50%;
      border:2px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2],
  });
};

const CATEGORIES = [
  { acronym: 'MGT', color: '#ef4444', label: 'Management' },
  { acronym: 'TEC', color: '#3b82f6', label: 'Technical' },
  { acronym: 'ADM', color: '#f59e0b', label: 'Administration' },
  { acronym: 'OPS', color: '#10b981', label: 'Operations' },
  { acronym: 'MKT', color: '#8b5cf6', label: 'Marketing' },
];

const CATEGORY_MAP = {};
CATEGORIES.forEach(c => { CATEGORY_MAP[c.acronym] = c; });

const STATE_CENTERS = {
  "Acre": [-8.77, -70.55],
  "Alagoas": [-9.57, -36.78],
  "Amapá": [1.41, -51.77],
  "Amazonas": [-3.47, -65.10],
  "Bahia": [-12.96, -41.68],
  "Ceará": [-5.20, -39.53],
  "Distrito Federal": [-15.83, -47.86],
  "Espírito Santo": [-19.19, -40.34],
  "Goiás": [-15.98, -49.86],
  "Maranhão": [-5.42, -45.44],
  "Mato Grosso": [-12.64, -55.42],
  "Mato Grosso do Sul": [-20.51, -54.54],
  "Minas Gerais": [-18.10, -44.38],
  "Pará": [-3.79, -52.48],
  "Paraíba": [-7.06, -36.72],
  "Paraná": [-24.89, -51.55],
  "Pernambuco": [-8.28, -37.86],
  "Piauí": [-7.72, -42.73],
  "Rio de Janeiro": [-22.25, -42.66],
  "Rio Grande do Norte": [-5.81, -36.59],
  "Rio Grande do Sul": [-29.75, -53.25],
  "Rondônia": [-10.83, -63.34],
  "Roraima": [2.81, -61.75],
  "Santa Catarina": [-27.45, -50.95],
  "São Paulo": [-22.19, -48.79],
  "Sergipe": [-10.57, -37.45],
  "Tocantins": [-10.18, -48.33],
};

const CATEGORY_OFFSETS = {
  'MGT': [0, 0.5],
  'TEC': [0.5, 0],
  'ADM': [0, -0.5],
  'OPS': [-0.5, 0],
  'MKT': [0.35, 0.35],
};

const createCountBadge = (color, count) => {
  const s = count > 99 ? 38 : count > 30 ? 32 : 26;
  const fontSize = count > 99 ? 11 : 12;
  return L.divIcon({
    html: `<div style="
      background:${color};
      width:${s}px;height:${s}px;
      border-radius:50%;
      border:2px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-weight:700;font-size:${fontSize}px;
    ">${count}</div>`,
    className: '',
    iconSize: [s, s],
    iconAnchor: [s/2, s/2],
    popupAnchor: [0, -s/2],
  });
};

function ZoomController({ onZoomChange }) {
  useMapEvents({
    zoomend: (e) => onZoomChange(e.target.getZoom()),
  });
  return null;
}

function ViewController({ selectedPerson, selectedGroup }) {
  const map = useMap();

  useEffect(() => {
    if (selectedPerson && selectedPerson.coordinates) {
      map.flyTo(selectedPerson.coordinates, 11, { duration: 1.5 });
    } else if (selectedGroup) {
      if (selectedGroup.type === 'state') {
        const center = STATE_CENTERS[selectedGroup.state] || [-14.24, -51.93];
        map.flyTo(center, 6, { duration: 1.5 });
      } else if (selectedGroup.type === 'city') {
        map.flyTo(selectedGroup.coordinates, 10, { duration: 1.5 });
      }
    }
  }, [selectedPerson, selectedGroup, map]);

  return null;
}

export default function MapComponent({ data, selectedPerson, selectedGroup, onPersonSelect, onGroupSelect, isDarkMode }) {
  const [geojsonData, setGeojsonData] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(4);

  useEffect(() => {
    fetch('/brazil-states.geojson')
      .then(res => res.json())
      .then(json => setGeojsonData(json))
      .catch(err => console.error("Error loading geojson:", err));
  }, []);

  const brazilBounds = [
    [-33.75, -74.0],
    [5.27, -32.5],
  ];

  const minZoomLevel = 4;
  const maxZoomLevel = 12;

  const stateClusters = useMemo(() => {
    if (currentZoom > 5) return [];
    const groups = {};
    data.forEach(p => {
      const key = `${p.state}|${p.category.acronym}`;
      if (!groups[key]) {
        groups[key] = {
          type: 'state',
          state: p.state,
          acronym: p.category.acronym,
          count: 0,
          coordinates: STATE_CENTERS[p.state] || [-14.24, -51.93],
        };
      }
      groups[key].count++;
    });
    return Object.values(groups);
  }, [data, currentZoom]);

  const cityClusters = useMemo(() => {
    if (currentZoom < 6 || currentZoom > 9) return [];
    const groups = {};
    data.forEach(p => {
      if (!p.coordinates) return;
      const key = `${p.city}|${p.state}|${p.category.acronym}`;
      if (!groups[key]) {
        groups[key] = {
          type: 'city',
          city: p.city,
          state: p.state,
          acronym: p.category.acronym,
          count: 0,
          coordinates: [0, 0],
          latSum: 0,
          lngSum: 0,
        };
      }
      groups[key].count++;
      groups[key].latSum += p.coordinates[0];
      groups[key].lngSum += p.coordinates[1];
    });
    return Object.values(groups).map(g => ({
      ...g,
      coordinates: [g.latSum / g.count, g.lngSum / g.count],
    }));
  }, [data, currentZoom]);

  const personMarkers = useMemo(() => {
    if (currentZoom < 10) return [];
    return data.filter(p => p.coordinates);
  }, [data, currentZoom]);

  const borderStyle = {
    color: isDarkMode ? 'rgba(0, 200, 75, 0.5)' : 'rgba(0, 169, 80, 0.4)',
    weight: 1.5,
    fillOpacity: 0,
    dashArray: '',
  };

  return (
    <div className="map-wrapper">
      <MapContainer
        center={[-14.235, -51.925]}
        zoom={minZoomLevel}
        style={{ height: '100%', width: '100%' }}
        maxBounds={brazilBounds}
        maxBoundsViscosity={1.0}
        minZoom={minZoomLevel}
        maxZoom={maxZoomLevel}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url={isDarkMode
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"}
        />
        <ZoomController onZoomChange={setCurrentZoom} />
        <ViewController selectedPerson={selectedPerson} selectedGroup={selectedGroup} />
        {geojsonData && (
          <GeoJSON
            data={geojsonData}
            style={borderStyle}
            interactive={false}
          />
        )}

        {currentZoom <= 5 && stateClusters.map((sc) => {
          const color = CATEGORY_MAP[sc.acronym]?.color || '#666';
          const offset = CATEGORY_OFFSETS[sc.acronym] || [0, 0];
          const position = [sc.coordinates[0] + offset[1], sc.coordinates[1] + offset[0]];
          return (
            <Marker
              key={`state-${sc.state}-${sc.acronym}`}
              position={position}
              icon={createCountBadge(color, sc.count)}
              eventHandlers={{ click: () => onGroupSelect({ type: 'state', state: sc.state, acronym: sc.acronym, count: sc.count, coordinates: sc.coordinates }) }}
            >
              <Tooltip permanent={false} direction="top" offset={[0, -16]} opacity={0.9}>
                <strong>{sc.state}</strong> — {sc.acronym}<br/>{sc.count} pessoas
              </Tooltip>
            </Marker>
          );
        })}

        {currentZoom >= 6 && currentZoom <= 9 && cityClusters.map((cc) => {
          const color = CATEGORY_MAP[cc.acronym]?.color || '#666';
          const offset = CATEGORY_OFFSETS[cc.acronym] || [0, 0];
          const position = [cc.coordinates[0] + offset[1], cc.coordinates[1] + offset[0]];
          return (
            <Marker
              key={`city-${cc.city}-${cc.state}-${cc.acronym}`}
              position={position}
              icon={createCountBadge(color, cc.count)}
              eventHandlers={{ click: () => onGroupSelect({ type: 'city', city: cc.city, state: cc.state, acronym: cc.acronym, count: cc.count, coordinates: cc.coordinates }) }}
            >
              <Tooltip permanent={false} direction="top" offset={[0, -16]} opacity={0.9}>
                <strong>{cc.city}</strong> — {cc.acronym}<br/>{cc.count} pessoas
              </Tooltip>
            </Marker>
          );
        })}

        {currentZoom >= 10 && personMarkers.map((person) => {
          const color = person.category?.color || '#666';
          return (
            <Marker
              key={person.id}
              position={person.coordinates}
              icon={createPersonIcon(color, 12)}
              eventHandlers={{ click: () => onPersonSelect(person) }}
            >
              <Tooltip permanent={false} direction="top" offset={[0, -10]} opacity={0.9}>
                <strong>{person.name}</strong><br/>{person.category?.acronym}<br/>{person.city}
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
