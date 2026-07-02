import { useState, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { forceSimulation, forceX, forceY, forceCollide } from 'd3-force';
import L from 'leaflet';

export function useDeclutteredBubbles(data) {
  const map = useMap();
  const [declutteredData, setDeclutteredData] = useState([]);

  useEffect(() => {
    if (!data || data.length === 0) {
      setDeclutteredData([]);
      return;
    }

    const updatePositions = () => {
      // 1. Convert to pixels
      const points = data.map((d, index) => {
        // d.coordinates contains [lat, lng]
        const latLng = L.latLng(d.coordinates[0], d.coordinates[1]);
        const point = map.latLngToLayerPoint(latLng);
        const size = d.count > 99 ? 34 : d.count > 9 ? 28 : 22;
        return {
          ...d,
          originalIndex: index,
          pxOriginal: { x: point.x, y: point.y },
          x: point.x,
          y: point.y,
          raio: size / 2
        };
      });

      // 2. Run d3-force simulation
      const sim = forceSimulation(points)
        .force("x", forceX(d => d.pxOriginal.x).strength(1.2))
        .force("y", forceY(d => d.pxOriginal.y).strength(1.2))
        .force("collide", forceCollide(d => d.raio + 1).iterations(3))
        .stop();

      for (let i = 0; i < 120; i++) sim.tick();

      // 3. Convert back to Lat/Lng
      const newPositions = points.map(p => {
        const newLatLng = map.layerPointToLatLng(L.point(p.x, p.y));
        return {
          ...p,
          originalCoordinates: p.coordinates,
          simulatedCoordinates: [newLatLng.lat, newLatLng.lng],
          needsGuideLine: Math.abs(p.x - p.pxOriginal.x) > 5 || Math.abs(p.y - p.pxOriginal.y) > 5
        };
      });

      setDeclutteredData(newPositions);
    };

    updatePositions();

    // Rerun on moveend and zoomend to project pixels accurately
    map.on('moveend', updatePositions);
    map.on('zoomend', updatePositions);
    
    return () => {
      map.off('moveend', updatePositions);
      map.off('zoomend', updatePositions);
    };
  }, [data, map]);

  return declutteredData;
}
