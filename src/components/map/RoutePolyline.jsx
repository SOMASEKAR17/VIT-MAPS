"use client";
import { useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import { gridToMapCoords } from "../../utils/transformCoords";
const RoutePolyline = ({ route = [], currentFloor }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !route || route.length < 1) return;
    const floorRoute = route.filter(n => String(n.coordinates.floor) === String(currentFloor));
    if (floorRoute.length < 2) return;
    const latlngs = floorRoute.map(n => {
      const { lat, lng } = gridToMapCoords({ ...n.coordinates, floor: currentFloor });
      return [lat, lng];
    });
    const polyline = L.polyline(latlngs, { 
      color: "#00ff9f", 
      weight: 4,
      opacity: 0.8,
      className: 'neon-glow-line' 
    }).addTo(map);
    return () => {
      map.removeLayer(polyline);
    };
  }, [map, route, currentFloor]);
  return null;
};
export default RoutePolyline;