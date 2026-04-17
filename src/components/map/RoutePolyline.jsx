"use client";
import { useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import { gridToMapCoords } from "../../utils/transformCoords";

// Helper function to smooth out polyline sharp corners
const getSmoothLine = (points, radius = 60, resolution = 15) => {
  if (points.length < 3) return points;
  const smoothPoints = [points[0]];

  for (let i = 1; i < points.length - 1; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    
    const v1 = [p0[0] - p1[0], p0[1] - p1[1]];
    const v2 = [p2[0] - p1[0], p2[1] - p1[1]];
    
    const len1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
    const len2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);
    
    if (len1 === 0 || len2 === 0) continue;
    
    // The smoothing radius should not exceed half the length of the shortest segment
    const appliedRadius = Math.min(radius, len1 * 0.45, len2 * 0.45);
    
    const cp1 = [p1[0] + (v1[0] / len1) * appliedRadius, p1[1] + (v1[1] / len1) * appliedRadius];
    const cp2 = [p1[0] + (v2[0] / len2) * appliedRadius, p1[1] + (v2[1] / len2) * appliedRadius];
    
    smoothPoints.push(cp1);
    
    for (let t = 1; t <= resolution - 1; t++) {
      const tb = t / resolution;
      const x = Math.pow(1 - tb, 2) * cp1[0] + 2 * (1 - tb) * tb * p1[0] + Math.pow(tb, 2) * cp2[0];
      const y = Math.pow(1 - tb, 2) * cp1[1] + 2 * (1 - tb) * tb * p1[1] + Math.pow(tb, 2) * cp2[1];
      smoothPoints.push([x, y]);
    }
    
    smoothPoints.push(cp2);
  }
  
  smoothPoints.push(points[points.length - 1]);
  return smoothPoints;
};

const RoutePolyline = ({ route = [], currentFloor }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !route || route.length < 1) return;
    const floorRoute = route.filter(n => String(n.coordinates.floor) === String(currentFloor));
    if (floorRoute.length < 2) return;
    
    const rawLatLngs = floorRoute.map(n => {
      const { lat, lng } = gridToMapCoords({ ...n.coordinates, floor: currentFloor });
      return [lat, lng];
    });

    const smoothedLatLngs = getSmoothLine(rawLatLngs);

    const polyline = L.polyline(smoothedLatLngs, { 
      color: "#00ff9f", 
      weight: 6,
      opacity: 0.9,
      smoothFactor: 1.0, 
      lineCap: 'round',
      lineJoin: 'round',
      className: 'neon-glow-line' 
    }).addTo(map);
    return () => {
      map.removeLayer(polyline);
    };
  }, [map, route, currentFloor]);
  return null;
};
export default RoutePolyline;