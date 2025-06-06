import React from "react";
import { GoogleMap, Polygon, Marker, InfoWindow } from "@react-google-maps/api";
import { Box, Typography, Button } from "@mui/material";
import type { GeofenceZone, Asset } from "../../types";
import { MAP_CONTAINER_STYLE, MAP_CENTER, MAP_OPTIONS } from "@/constants";
import { createAssetIcon } from "@/utils";

interface MapComponentProps {
  geofences: GeofenceZone[];
  assets: Asset[];
  selectedGeofence: GeofenceZone | null;
  selectedAsset: Asset | null;
  drawingPath: google.maps.LatLngLiteral[];
  isDrawing: boolean;
  loading: boolean;
  hasRefreshed: boolean;
  onMapClick: (event: google.maps.MapMouseEvent) => void;
  onMapLoad: (map: google.maps.Map) => void;
  onMapIdle: () => void;
  onGeofenceClick: (geofence: GeofenceZone) => void;
  onAssetClick: (asset: Asset) => void;
  onAssetDragStart: (assetId: string) => void;
  onAssetDragEnd: (event: google.maps.MapMouseEvent, assetId: string) => void;
  onCloseInfoWindow: () => void;
  onForceRefresh: () => void;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  geofences,
  assets,
  selectedGeofence,
  selectedAsset,
  drawingPath,
  isDrawing,
  loading,
  hasRefreshed,
  onMapClick,
  onMapLoad,
  onMapIdle,
  onGeofenceClick,
  onAssetClick,
  onAssetDragStart,
  onAssetDragEnd,
  onCloseInfoWindow,
  onForceRefresh,
}) => {
  return (
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER_STYLE}
      center={MAP_CENTER}
      zoom={14}
      options={MAP_OPTIONS}
      onClick={onMapClick}
      onLoad={onMapLoad}
      onIdle={onMapIdle}
    >
      <GeofenceRenderer
        geofences={geofences}
        onGeofenceClick={onGeofenceClick}
      />

      <DrawingPath isDrawing={isDrawing} drawingPath={drawingPath} />

      <AssetRenderer
        assets={assets}
        onAssetClick={onAssetClick}
        onAssetDragStart={onAssetDragStart}
        onAssetDragEnd={onAssetDragEnd}
      />

      <InfoWindows
        selectedGeofence={selectedGeofence}
        selectedAsset={selectedAsset}
        onClose={onCloseInfoWindow}
      />
    </GoogleMap>
  );
};

const GeofenceRenderer: React.FC<{
  geofences: GeofenceZone[];
  onGeofenceClick: (geofence: GeofenceZone) => void;
}> = ({ geofences, onGeofenceClick }) => {
  return (
    <>
      {geofences.map((geofence) => {
        if (
          !geofence.isActive ||
          !geofence.coordinates ||
          geofence.coordinates.length < 3
        ) {
          return null;
        }

        return (
          <Polygon
            key={`${geofence.id}-${Date.now()}`}
            paths={geofence.coordinates}
            options={{
              fillColor: "#FF5722",
              fillOpacity: 0.5,
              strokeColor: "#FF5722",
              strokeOpacity: 1.0,
              strokeWeight: 4,
              clickable: true,
              zIndex: 1000,
            }}
            onClick={() => onGeofenceClick(geofence)}
          />
        );
      })}
    </>
  );
};

const DrawingPath: React.FC<{
  isDrawing: boolean;
  drawingPath: google.maps.LatLngLiteral[];
}> = ({ isDrawing, drawingPath }) => {
  if (!isDrawing || drawingPath.length === 0) return null;

  return (
    <Polygon
      paths={drawingPath}
      options={{
        fillColor: "#FF5722",
        fillOpacity: 0.2,
        strokeColor: "#FF5722",
        strokeOpacity: 1,
        strokeWeight: 2,
        zIndex: 2000,
      }}
    />
  );
};

const AssetRenderer: React.FC<{
  assets: Asset[];
  onAssetClick: (asset: Asset) => void;
  onAssetDragStart: (assetId: string) => void;
  onAssetDragEnd: (event: google.maps.MapMouseEvent, assetId: string) => void;
}> = ({ assets, onAssetClick, onAssetDragStart, onAssetDragEnd }) => {
  return (
    <>
      {assets.map((asset) => {
        if (
          !asset.position ||
          typeof asset.position.lat !== "number" ||
          typeof asset.position.lng !== "number"
        ) {
          return null;
        }

        return (
          <Marker
            key={`${asset.id}-${Date.now()}`}
            position={asset.position}
            draggable={true}
            onDragStart={() => onAssetDragStart(asset.id)}
            onDragEnd={(event) => onAssetDragEnd(event, asset.id)}
            icon={createAssetIcon(asset.isActive)}
            onClick={(e) => {
              e.stop();
              onAssetClick(asset);
            }}
            title=""
            zIndex={1001}
          />
        );
      })}
    </>
  );
};

const InfoWindows: React.FC<{
  selectedGeofence: GeofenceZone | null;
  selectedAsset: Asset | null;
  onClose: () => void;
}> = ({ selectedGeofence, selectedAsset, onClose }) => {
  return (
    <>
      {selectedGeofence &&
        selectedGeofence.coordinates &&
        selectedGeofence.coordinates.length > 0 && (
          <InfoWindow
            position={selectedGeofence.coordinates[0]}
            onCloseClick={onClose}
            options={{ maxWidth: 300, disableAutoPan: false }}
          >
            <div
              style={{
                padding: "12px",
                minWidth: "200px",
                fontFamily: "Arial, sans-serif",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                {selectedGeofence.name}
              </h3>
              <p
                style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#666" }}
              >
                {selectedGeofence.description}
              </p>
              <p
                style={{
                  margin: "0",
                  fontSize: "12px",
                  color: selectedGeofence.isActive ? "#4CAF50" : "#757575",
                  fontWeight: "bold",
                }}
              >
                Status: {selectedGeofence.isActive ? "Active" : "Inactive"}
              </p>
              <div
                style={{ marginTop: "8px", fontSize: "12px", color: "#888" }}
              >
                Points: {selectedGeofence.coordinates.length}
              </div>
            </div>
          </InfoWindow>
        )}

      {selectedAsset && selectedAsset.position && (
        <InfoWindow
          position={selectedAsset.position}
          onCloseClick={onClose}
          options={{ maxWidth: 250, disableAutoPan: false }}
        >
          <div
            style={{
              padding: "12px",
              minWidth: "180px",
              fontFamily: "Arial, sans-serif",
            }}
          >
            <h3
              style={{
                margin: "0 0 8px 0",
                fontSize: "16px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              {selectedAsset.name}
            </h3>
            <div style={{ fontSize: "14px", lineHeight: "1.4" }}>
              <div style={{ marginBottom: "4px" }}>
                <strong>Type:</strong> {selectedAsset.type || "Vehicle"}
              </div>
              <div style={{ marginBottom: "4px" }}>
                <strong>Speed:</strong> {selectedAsset.speed.toFixed(1)} km/h
              </div>
              <div style={{ marginBottom: "4px" }}>
                <strong>Heading:</strong> {selectedAsset.heading.toFixed(0)}°
              </div>
              <div
                style={{ fontSize: "12px", color: "#888", marginTop: "8px" }}
              >
                Last Update:{" "}
                {new Date(selectedAsset.lastUpdate).toLocaleTimeString()}
              </div>
              <div
                style={{
                  marginTop: "8px",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  backgroundColor: selectedAsset.isActive
                    ? "#E8F5E8"
                    : "#F5F5F5",
                  color: selectedAsset.isActive ? "#4CAF50" : "#757575",
                  fontSize: "12px",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                {selectedAsset.isActive ? "🟢 ONLINE" : "🔴 OFFLINE"}
              </div>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};
