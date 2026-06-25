import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Fixed geographic center for each Brazilian state (hand-tuned so NE states don't overlap)
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

// Custom Cluster Icon creator
const createClusterIcon = (count, size) => {
  const s = size || 44;
  return L.divIcon({
    html: `<span>${count}</span>`,
    className: 'marker-cluster-custom',
    iconSize: L.point(s, s, true),
  });
};

// Larger state-level icon
const createStateIcon = (count) => {
  const s = count > 99 ? 54 : count > 30 ? 48 : 42;
  return L.divIcon({
    html: `<span>${count}</span>`,
    className: 'state-marker',
    iconSize: L.point(s, s, true),
  });
};

function ZoomListener({ onZoomChange }) {
  useMapEvents({
    zoomend: (e) => {
      onZoomChange(e.target.getZoom());
    }
  });
  return null;
}

function MapController({ selectedPerson }) {
  const map = useMap();

  useEffect(() => {
    if (selectedPerson) {
      map.flyTo(selectedPerson.coordinates, 16, {
        duration: 1.5
      });
    }
  }, [selectedPerson, map]);

  return null;
}

export default function MapComponent({ data, selectedPerson, onPersonSelect, isDarkMode }) {
  const [geojsonData, setGeojsonData] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(4);

  useEffect(() => {
    fetch('/brazil-states.geojson')
      .then(res => res.json())
      .then(json => setGeojsonData(json))
      .catch(err => console.error("Error loading geojson:", err));
  }, []);

  const brazilBounds = [
    [-33.75, -73.99],
    [5.27, -34.79]
  ];

  // State-level clusters using FIXED center positions
  const stateClusters = useMemo(() => {
    if (currentZoom > 5) return [];

    const groups = {};
    data.forEach(p => {
      const st = p.address.state || "Brasil";
      if (!groups[st]) {
        groups[st] = 0;
      }
      groups[st] += 1;
    });

    return Object.keys(groups).map(st => ({
      state: st,
      count: groups[st],
      coordinates: STATE_CENTERS[st] || [-14.24, -51.93] // fallback to center of Brazil
    }));
  }, [data, currentZoom]);

  // Border style for state boundaries
  const borderStyle = {
    color: isDarkMode ? 'rgba(0, 200, 75, 0.5)' : 'rgba(0, 169, 80, 0.4)',
    weight: 1.5,
    fillOpacity: 0,
    dashArray: ''
  };

  return (
    <div className="map-wrapper">
      <MapContainer 
        center={[-14.235, -51.925]} 
        zoom={4} 
        style={{ height: '100%', width: '100%' }}
        maxBounds={brazilBounds}
        maxBoundsViscosity={1.0}
        minZoom={4}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url={isDarkMode 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"}
        />

        <ZoomListener onZoomChange={setCurrentZoom} />
        <MapController selectedPerson={selectedPerson} />

        {/* State Borders */}
        {geojsonData && (
          <GeoJSON 
            data={geojsonData} 
            style={borderStyle}
            interactive={false}
          />
        )}

        {/* LOW ZOOM: Fixed state-center markers */}
        {currentZoom <= 5 ? (
          stateClusters.map(sc => (
            <Marker 
              key={sc.state} 
              position={sc.coordinates}
              icon={createStateIcon(sc.count)}
              interactive={false}
            />
          ))
        ) : (
          /* HIGH ZOOM: Normal clustering */
          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={(cluster) => createClusterIcon(cluster.getChildCount())}
            maxClusterRadius={60}
            showCoverageOnHover={false}
            spiderfyOnMaxZoom={true}
            zoomToBoundsOnClick={true}
          >
            {data.map((person) => (
              <Marker 
                key={person.id} 
                position={person.coordinates}
                eventHandlers={{
                  click: () => onPersonSelect(person),
                }}
              >
                <Popup>
                  <div className="popup-content">
                    <h3>{person.fullName}</h3>
                    <p>
                      <svg style={{width:'14px', height:'14px', verticalAlign:'middle', marginRight:'4px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {person.address.full}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        )}
      </MapContainer>
    </div>
  );
}
