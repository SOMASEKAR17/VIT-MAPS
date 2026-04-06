"use client";
import React from "react";
import { CircleMarker, Tooltip, useMap } from "react-leaflet";
import { gridToMapCoords } from "../../utils/transformCoords";
const MarkerLayer = ({
  nodes = [],
  userLocation,
  currentFloorId,
  onMarkerClick,
  selectedNodeId,
  highlightedNodeId,
  destinationNodeId, 
}) => {
  const map = useMap();
  const [zoom, setZoom] = React.useState(map.getZoom());

  React.useEffect(() => {
    const handleZoom = () => setZoom(map.getZoom());
    map.on('zoomend', handleZoom);
    return () => map.off('zoomend', handleZoom);
  }, [map]);

  if (!nodes.length && !userLocation && !destinationNodeId) return (
     <CircleMarker center={[0, 0]} radius={50} pathOptions={{ color: 'red' }} />
  );
  const renderCircle = (
    latLng,
    key,
    { color = "#333", radius = 6, tooltip, onClick, visible = true, dashArray, className = "" } = {}
  ) => (
    <CircleMarker
      key={key}
      center={latLng}
      radius={radius}
      interactive={!!onClick}
      pathOptions={{
        color,
        fillColor: color,
        dashArray,
        opacity: visible ? 1 : 0,
        fillOpacity: visible ? 0.8 : 0,
        className: className
      }}
      eventHandlers={onClick ? { click: onClick } : {}}
    >
      {tooltip && visible && (
        <Tooltip direction="top" offset={[0, -8]} sticky={true} opacity={1}>
          {tooltip}
        </Tooltip>
      )}
    </CircleMarker>
  );
  const floorNodes = nodes.filter(
    (n) => String(n.coordinates?.floor || n.floorId).trim().toLowerCase() === String(currentFloorId).trim().toLowerCase()
  );

  return (
    <>
      {nodes.length > 0 && floorNodes.length === 0 && (
         <CircleMarker center={[500, 500]} radius={100} pathOptions={{ color: 'yellow', fillOpacity: 0.5 }} />
      )}
      {floorNodes.map((node) => {
        const { lat, lng } = gridToMapCoords({
          ...node.coordinates,
          floor: currentFloorId,
        });
        const isDestination = node.nodeId === destinationNodeId;
        const isHighlighted = highlightedNodeId === node.nodeId;
        const isRoom = node.type === "room";
        
        let color = "#333333";
        let radius = 6;
        let visible = isRoom; // Force rooms to be visible for testing

        if (isDestination) {
          color = "#00ff9f";
          radius = 12;
          visible = true;
        } else if (isHighlighted) {
          color = "#ffffff";
          radius = 10;
          visible = true;
        } else if (isRoom) {
          color = "#00ff9f88";
          radius = 5;
        }

        const tooltip = (node.name && !node.name.startsWith("Node")) ? node.name : null;

        return renderCircle([lat, lng], node.nodeId, {
          color,
          radius,
          tooltip,
          onClick: () => onMarkerClick?.(node),
          visible,
          dashArray: isDestination ? "5 5" : undefined,
          className: (isDestination || isHighlighted || isRoom) ? 'neon-glow-line' : ''
        });
      })}
      {userLocation &&
        (() => {
          const point = userLocation.coordinates ?? userLocation;
          const { lat, lng } = gridToMapCoords({
            ...point,
            floor: currentFloorId,
          });
          return renderCircle([lat, lng], "user-dot", {
            color: "#00ff9f",
            radius: 8,
            tooltip: "My Location",
            visible: true,
            className: 'neon-glow-line'
          });
        })()}
    </>
  );
};
export default MarkerLayer;