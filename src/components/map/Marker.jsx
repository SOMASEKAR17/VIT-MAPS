"use client";
import React from "react";
import { CircleMarker, Tooltip } from "react-leaflet";
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
  if (!nodes.length && !userLocation && !destinationNodeId) return null;
  const renderCircle = (
    latLng,
    key,
    { color = "#333", radius = 6, tooltip, onClick, visible = true, dashArray } = {}
  ) => (
    <CircleMarker
      key={key}
      center={latLng}
      radius={radius}
      pathOptions={{
        color,
        fillColor: color,
        dashArray,
        opacity: visible ? 1 : 0,
        fillOpacity: visible ? 0.9 : 0,
      }}
      eventHandlers={onClick ? { click: onClick } : {}}
    >
      {tooltip && (
        <Tooltip direction="top" offset={[0, -8]} opacity={1}>
          {tooltip}
        </Tooltip>
      )}
    </CircleMarker>
  );
  const floorNodes = nodes.filter(
    (n) => String(n.coordinates.floor) === String(currentFloorId)
  );

  return (
    <>
      {floorNodes.map((node) => {
        const { lat, lng } = gridToMapCoords({
          ...node.coordinates,
          floor: currentFloorId,
        });
        const isDestination = node.nodeId === destinationNodeId;
        const isHighlighted = highlightedNodeId === node.nodeId;
        
        let color = "#333";
        let radius = 5;
        let visible = false;

        if (isDestination) {
          color = "#00ff9f";
          radius = 10;
          visible = true;
        } else if (isHighlighted) {
          color = "#ffffff";
          radius = 7;
          visible = true;
        }

        const tooltip = node.name || node.nodeId;

        return renderCircle([lat, lng], node.nodeId, {
          color,
          radius,
          tooltip,
          onClick: () => onMarkerClick?.(node),
          visible,
          dashArray: isDestination ? "5 5" : undefined,
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
          });
        })()}
    </>
  );
};
export default MarkerLayer;