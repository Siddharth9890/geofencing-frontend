import React, { useCallback, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  LocationOn as LocationOnIcon,
  Menu as MenuIcon,
  Save as SaveIcon,
  Upload as UploadIcon,
  CloudSync as CloudSyncIcon,
} from "@mui/icons-material";
import { LoadScript } from "@react-google-maps/api";

import { MapComponent } from "@/components/Map";
import SideDrawer from "@/components/SideDrawer";
import DialogsContainer from "@/components/Dialogs";
import AlertsPanel from "@/components/AlertsPanel";

import {
  useGeofencing,
  useMapControls,
  useDialogs,
  useAssetTracking,
} from "@/hooks/useGeofencing";
import { detectGeofenceCollisions } from "@/utils";

const GeofencingApp: React.FC = () => {
  const {
    geofences,
    assets,
    alerts,
    loading,
    hasRefreshed,
    setHasRefreshed,
    loadAllData,
    createGeofence,
    updateGeofence,
    deleteGeofence,
    createAsset,
    updateAsset,
    deleteAsset,
    createAlert,
  } = useGeofencing();

  const {
    selectedGeofence,
    selectedAsset,
    isDrawing,
    drawingPath,
    isCreatingAsset,
    mapRef,
    setSelectedGeofence,
    setSelectedAsset,
    setIsCreatingAsset,
    setDrawingPath,
    handleMapClick,
    startDrawing,
    finishDrawing,
    startCreatingAsset,
    handleAssetDragStart,
    handleAssetDragEnd,
    clearSelections,
    handleMapLoad,
    handleForceRefresh,
  } = useMapControls();

  const {
    openDialog,
    openAssetDialog,
    openAlertSnackbar,
    drawerOpen,
    showCollisionWarning,
    newGeofence,
    newAsset,
    geofenceCollisions,
    setOpenDialog,
    setOpenAssetDialog,
    setOpenAlertSnackbar,
    setDrawerOpen,
    setShowCollisionWarning,
    setNewGeofence,
    setNewAsset,
    setGeofenceCollisions,
    resetForms,
  } = useDialogs();

  const handleCloseAssetDialog = useCallback(() => {
    setOpenAssetDialog(false);
  }, [setOpenAssetDialog]);

  const handleMapClickWrapper = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (isCreatingAsset && event.latLng) {
        event.stop?.();
        const newPosition = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        };

        setNewAsset((prev) => {
          const updated = { ...prev, position: newPosition };
          return updated;
        });

        setTimeout(() => {
          setOpenAssetDialog(true);
        }, 100);

        setIsCreatingAsset(false);
        return;
      }

      handleMapClick(event);
    },
    [
      isCreatingAsset,
      isDrawing,
      openAssetDialog,
      handleMapClick,
      setNewAsset,
      setOpenAssetDialog,
      setIsCreatingAsset,
    ]
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  useAssetTracking(assets, geofences, createAlert, updateAsset);

  const handleMapIdle = () => {
    if (
      !hasRefreshed &&
      mapRef.current &&
      (geofences.length > 0 || assets.length > 0) &&
      typeof window !== "undefined" &&
      window.google?.maps
    ) {
      const currentCenter = mapRef.current.getCenter();
      if (currentCenter) {
        mapRef.current.panTo({
          lat: currentCenter.lat() + 0.00001,
          lng: currentCenter.lng() + 0.00001,
        });
        setTimeout(() => {
          if (mapRef.current && currentCenter) {
            mapRef.current.panTo({
              lat: currentCenter.lat(),
              lng: currentCenter.lng(),
            });
            setHasRefreshed(true);
          }
        }, 100);
      }
    }
  };

  const handleFinishDrawing = useCallback(() => {
    const path = finishDrawing();
    if (path.length >= 3) {
      setOpenDialog(true);
    } else {
      alert("Please draw at least 3 points to create a polygon");
    }
  }, [finishDrawing, setOpenDialog]);

  const handleSaveGeofence = useCallback(async () => {
    try {
      const newGeofenceTemp = {
        id: "temp",
        name: newGeofence.name,
        description: newGeofence.description,
        coordinates: drawingPath,
        isActive: true,
        alertOnEntry: newGeofence.alertOnEntry,
        alertOnExit: newGeofence.alertOnExit,
        createdAt: new Date().toISOString(),
      };

      const collisions = detectGeofenceCollisions(newGeofenceTemp, geofences);

      if (collisions.length > 0) {
        setGeofenceCollisions(collisions);
        setShowCollisionWarning(true);
        return;
      }
      await saveGeofenceToBackend();
    } catch (error) {
      console.error("Error saving geofence:", error);
      alert("Failed to save geofence. Please try again.");
    }
  }, [
    newGeofence,
    drawingPath,
    geofences,
    setGeofenceCollisions,
    setShowCollisionWarning,
  ]);

  const saveGeofenceToBackend = useCallback(async () => {
    try {
      const geofenceData = {
        name: newGeofence.name,
        description: newGeofence.description,
        coordinates: drawingPath,
        color: newGeofence.color,
        isActive: true,
        alertOnEntry: newGeofence.alertOnEntry,
        alertOnExit: newGeofence.alertOnExit,
      };

      await createGeofence(geofenceData);
      setOpenDialog(false);
      setDrawingPath([]);
      resetForms();
    } catch (error) {
      console.error("Error saving geofence:", error);
      alert("Failed to save geofence. Please try again.");
    }
  }, [
    newGeofence,
    drawingPath,
    createGeofence,
    setOpenDialog,
    setDrawingPath,
    resetForms,
  ]);

  const handleSaveAsset = useCallback(async () => {
    try {
      const assetPosition = (newAsset as any).position;
      if (!assetPosition) return;

      const assetData = {
        name: newAsset.name,
        type: newAsset.type,
        position: assetPosition,
        isActive: true,
        speed: 0,
        heading: 0,
        status: "online",
      };

      await createAsset(assetData);
      setOpenAssetDialog(false);
      resetForms();
    } catch (error) {
      console.error("Error saving asset:", error);
      alert("Failed to save asset. Please try again.");
    }
  }, [newAsset, createAsset, setOpenAssetDialog, resetForms]);

  const handleAssetDragEndWrapper = useCallback(
    async (event: google.maps.MapMouseEvent, assetId: string) => {
      const newPosition = handleAssetDragEnd(event, assetId);
      if (newPosition) {
        try {
          await updateAsset(assetId, {
            position: newPosition,
            status: "moving",
          });
        } catch (error) {
          console.error("Error updating asset position:", error);
        }
      }
    },
    [handleAssetDragEnd, updateAsset]
  );

  const handleToggleGeofence = useCallback(
    async (id: string) => {
      try {
        const geofence = geofences.find((g) => g.id === id);
        if (!geofence) return;
        await updateGeofence(id, { isActive: !geofence.isActive });
      } catch (error) {
        console.error("Error toggling geofence:", error);
      }
    },
    [geofences, updateGeofence]
  );

  const handleToggleAsset = useCallback(
    async (id: string) => {
      try {
        const asset = assets.find((a) => a.id === id);
        if (!asset) return;
        const newStatus = asset.isActive ? "offline" : "online";
        await updateAsset(id, {
          isActive: !asset.isActive,
          status: newStatus,
        });
      } catch (error) {
        console.error("Error toggling asset:", error);
      }
    },
    [assets, updateAsset]
  );

  const handleGeoJSONUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const geoJSON = JSON.parse(e.target?.result as string);
          if (geoJSON.type === "FeatureCollection") {
            for (let index = 0; index < geoJSON.features.length; index++) {
              const feature = geoJSON.features[index];
              if (feature.geometry.type === "Polygon") {
                const coordinates = feature.geometry.coordinates[0].map(
                  (coord: number[]) => ({
                    lat: coord[1],
                    lng: coord[0],
                  })
                );

                const geofenceData = {
                  name: feature.properties?.name || `GeoJSON Zone ${index + 1}`,
                  description:
                    feature.properties?.description || "Imported from GeoJSON",
                  coordinates,
                  isActive: true,
                  alertOnEntry: true,
                  alertOnExit: true,
                };

                try {
                  await createGeofence(geofenceData);
                } catch (error) {
                  console.error("Error saving imported geofence:", error);
                }
              }
            }
          }
        } catch (error) {
          alert("Invalid GeoJSON file");
        }
      };
      reader.readAsText(file);
    },
    [createGeofence]
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading data from backend...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Geofencing Management System - Central Pune
          </Typography>
          <Chip
            icon={<LocationOnIcon />}
            label={`${assets.filter((a) => a.isActive).length} Active Assets`}
            color="secondary"
            variant="outlined"
            sx={{ color: "white", borderColor: "white", mr: 1 }}
          />
          <IconButton
            color="inherit"
            onClick={loadAllData}
            title="Sync with Backend"
          >
            <CloudSyncIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Paper elevation={3}>
              <Box sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">
                    Interactive Map - Central Pune, India
                  </Typography>
                  <Box>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={startDrawing}
                      disabled={isDrawing || isCreatingAsset}
                      sx={{ mr: 1 }}
                    >
                      Draw Zone
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<LocationOnIcon />}
                      onClick={startCreatingAsset}
                      disabled={isDrawing || isCreatingAsset}
                      sx={{ mr: 1 }}
                    >
                      Add Asset
                    </Button>
                    {isDrawing && (
                      <Button
                        variant="outlined"
                        startIcon={<SaveIcon />}
                        onClick={handleFinishDrawing}
                      >
                        Finish Drawing
                      </Button>
                    )}
                    {isCreatingAsset && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => setIsCreatingAsset(false)}
                      >
                        Cancel Asset
                      </Button>
                    )}
                    <input
                      type="file"
                      accept=".geojson,.json"
                      onChange={handleGeoJSONUpload}
                      ref={fileInputRef}
                      style={{ display: "none" }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<UploadIcon />}
                      onClick={() => fileInputRef.current?.click()}
                      sx={{ ml: 1 }}
                    >
                      Upload GeoJSON
                    </Button>
                  </Box>
                </Box>

                <LoadScript
                  googleMapsApiKey={
                    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
                  }
                >
                  <MapComponent
                    geofences={geofences}
                    assets={assets}
                    selectedGeofence={selectedGeofence}
                    selectedAsset={selectedAsset}
                    drawingPath={drawingPath}
                    isDrawing={isDrawing}
                    loading={loading}
                    hasRefreshed={hasRefreshed}
                    onMapClick={handleMapClickWrapper}
                    onMapLoad={handleMapLoad}
                    onMapIdle={handleMapIdle}
                    onGeofenceClick={setSelectedGeofence}
                    onAssetClick={setSelectedAsset}
                    onAssetDragStart={handleAssetDragStart}
                    onAssetDragEnd={handleAssetDragEndWrapper}
                    onCloseInfoWindow={clearSelections}
                    onForceRefresh={handleForceRefresh}
                  />
                </LoadScript>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <AlertsPanel alerts={alerts} />
          </Grid>
        </Grid>
      </Container>

      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        geofences={geofences}
        assets={assets}
        onToggleGeofence={handleToggleGeofence}
        onDeleteGeofence={deleteGeofence}
        onToggleAsset={handleToggleAsset}
        onDeleteAsset={deleteAsset}
      />

      <DialogsContainer
        openDialog={openDialog}
        openAssetDialog={openAssetDialog}
        openAlertSnackbar={openAlertSnackbar}
        showCollisionWarning={showCollisionWarning}
        newGeofence={newGeofence}
        newAsset={newAsset}
        geofenceCollisions={geofenceCollisions}
        onCloseDialog={() => setOpenDialog(false)}
        onCloseAssetDialog={handleCloseAssetDialog}
        onCloseAlertSnackbar={() => setOpenAlertSnackbar(false)}
        onCloseCollisionWarning={() => setShowCollisionWarning(false)}
        onUpdateGeofence={setNewGeofence}
        onUpdateAsset={setNewAsset}
        onSaveGeofence={handleSaveGeofence}
        onSaveAsset={handleSaveAsset}
      />
    </Box>
  );
};

export default GeofencingApp;
