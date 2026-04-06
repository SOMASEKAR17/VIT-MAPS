"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  ImageOverlay,
  useMap,
  useMapEvents,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MarkerLayer from "./Marker";
import RoutePolyline from "./RoutePolyline";
import { floorDimensions } from "../../utils/mapConfig";
import { mapToGridCoords, clampGridPoint } from "../../utils/transformCoords";
import academicGround from "../../assets/final maps/PRP/main.svg";
const floorImages = {
  "586f40cd-8306-4040-88c9-e3f61b8e098d": academicGround, 
};
const AutoFitImage = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !bounds) return;
    map.fitBounds(bounds, { padding: [10, 10], animate: false });
  }, [map, bounds]);
  return null;
};
const MapClickHandler = ({ onSelectLocation, currentFloorId }) => {
  const lastTapRef = useRef({ time: 0, latlng: null });
  const DOUBLE_TAP_DELAY = 300;
  useMapEvents({
    click: (e) => {
      const now = Date.now();
      const latlng = e.latlng;
      if (
        lastTapRef.current.latlng &&
        now - lastTapRef.current.time < DOUBLE_TAP_DELAY &&
        Math.abs(latlng.lat - lastTapRef.current.latlng.lat) < 0.0001 &&
        Math.abs(latlng.lng - lastTapRef.current.latlng.lng) < 0.0001
      ) {
        const gridPt = mapToGridCoords({
          lng: latlng.lng,
          lat: latlng.lat,
          floor: currentFloorId,
        });
        onSelectLocation?.(clampGridPoint(gridPt, currentFloorId));
        lastTapRef.current = { time: 0, latlng: null };
      } else {
        lastTapRef.current = { time: now, latlng };
      }
    },
    dblclick: (e) => {
      const gridPt = mapToGridCoords({
        lng: e.latlng.lng,
        lat: e.latlng.lat,
        floor: currentFloorId,
      });
      onSelectLocation?.(clampGridPoint(gridPt, currentFloorId));
    },
  });
  return null;
};
const Map = ({
  userLocation,
  Endnode,
  nodes = [],
  route = [],
  currentFloor,
  onSelectLocation,
  onMarkerClick,
  selectedNodeId,
  highlightedNodeId,
  forceVisibleMarkers = false,
}) => {
  const containerRef = useRef(null);
  const [renderSize, setRenderSize] = useState({
    width: 0,
    height: 0,
    offsetX: 0,
    offsetY: 0,
  });
  const image = floorImages[currentFloor?.id] || academicGround;
  const { width, height } =
    floorDimensions[currentFloor?.id] || { width: 2000, height: 3000 };
  const bounds = useMemo(
    () => [
      [0, 0],
      [height, width], 
    ],
    [width, height]
  );
  useEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setRenderSize({
      width: rect.width,
      height: rect.height,
      offsetX: 0,
      offsetY: 0,
    });
  }, [currentFloor, route]);
  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full bg-gray-100">
      <MapContainer
        crs={L.CRS.Simple}
        bounds={bounds}
        center={[height / 2, width / 2]}
        zoom={-1}
        minZoom={-4}
        maxZoom={5}
        zoomControl={false}
        doubleClickZoom={false}
        style={{
          width: "100%",
          height: "100%",
          background: "white", 
        }}
      >
        <ImageOverlay
          url={image.src || image}
          bounds={bounds}
          preserveAspectRatio="xMidYMid meet" 
        />
        <AutoFitImage bounds={bounds} />
        <ZoomControl position="bottomright" />
        <MapClickHandler
          onSelectLocation={onSelectLocation}
          currentFloorId={currentFloor?.id}
        />
        <MarkerLayer
          nodes={nodes}
          userLocation={userLocation}
          currentFloorId={currentFloor?.id}
          onMarkerClick={onMarkerClick}
          selectedNodeId={selectedNodeId}
          highlightedNodeId={highlightedNodeId}
          forceVisibleMarkers={forceVisibleMarkers}
          destinationNodeId={Endnode}
        />
        {renderSize.width > 0 && renderSize.height > 0 && (
          <RoutePolyline
            route={route}
            currentFloor={currentFloor?.id}
            userLocation={userLocation}
            renderSize={renderSize}
          />
        )}
      </MapContainer>
    </div>
  );
};
export default Map;