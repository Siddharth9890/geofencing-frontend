import { useState, useEffect, useCallback, useRef } from 'react';
import type { GeofenceZone, Asset, GeofenceAlert, GeofenceCollision, NewGeofenceForm, NewAssetForm } from '../types';
import { apiService } from '@/services/api';
import { isPointInPolygon, generateRandomMovement, forceMapRefresh } from '@/utils';
import { CURRENT_BOUNDS, UPDATE_INTERVALS, DEFAULT_GEOFENCE_FORM, DEFAULT_ASSET_FORM } from '@/constants';

export const useGeofencing = () => {
    const [geofences, setGeofences] = useState<GeofenceZone[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [alerts, setAlerts] = useState<GeofenceAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasRefreshed, setHasRefreshed] = useState(false);

    const loadAllData = useCallback(async () => {
        try {
            setLoading(true);
            const [geofencesData, assetsData, alertsData] = await Promise.allSettled([
                apiService.getGeofences(),
                apiService.getAssets(),
                apiService.getAlerts(),
            ]);

            if (geofencesData.status === 'fulfilled') {
                setGeofences(geofencesData.value || []);
            }
            if (assetsData.status === 'fulfilled') {
                setAssets(assetsData.value || []);
            }
            if (alertsData.status === 'fulfilled') {
                setAlerts((alertsData.value || []).slice(0, 10));
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAllData();
    }, [loadAllData]);

    const createGeofence = useCallback(async (geofenceData: Omit<GeofenceZone, 'id' | 'createdAt'>) => {
        const savedGeofence = await apiService.createGeofence(geofenceData);
        setGeofences(prev => [...prev, savedGeofence]);
        return savedGeofence;
    }, []);

    const updateGeofence = useCallback(async (id: string, updates: Partial<GeofenceZone>) => {
        const updatedGeofence = await apiService.updateGeofence(id, updates);
        setGeofences(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
        return updatedGeofence;
    }, []);

    const deleteGeofence = useCallback(async (id: string) => {
        await apiService.deleteGeofence(id);
        setGeofences(prev => prev.filter(g => g.id !== id));
    }, []);

    const createAsset = useCallback(async (assetData: Omit<Asset, 'id' | 'lastUpdate'>) => {
        const savedAsset = await apiService.createAsset(assetData);
        setAssets(prev => [...prev, savedAsset]);
        return savedAsset;
    }, []);

    const updateAsset = useCallback(async (id: string, updates: Partial<Asset>) => {
        const updatedAsset = await apiService.updateAsset(id, updates);
        setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
        return updatedAsset;
    }, []);

    const deleteAsset = useCallback(async (id: string) => {
        await apiService.deleteAsset(id);
        setAssets(prev => prev.filter(a => a.id !== id));
    }, []);

    const createAlert = useCallback(async (alertData: Omit<GeofenceAlert, 'id' | 'timestamp' | 'acknowledged'>) => {
        const savedAlert = await apiService.createAlert(alertData);
        setAlerts(prev => [savedAlert, ...prev.slice(0, 9)]);
        return savedAlert;
    }, []);

    return {
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
        setAssets,
        setAlerts,
    };
};

export const useMapControls = () => {
    const [selectedGeofence, setSelectedGeofence] = useState<GeofenceZone | null>(null);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingPath, setDrawingPath] = useState<google.maps.LatLngLiteral[]>([]);
    const [isCreatingAsset, setIsCreatingAsset] = useState(false);
    const [isDraggingAsset, setIsDraggingAsset] = useState(false);
    const [draggingAssetId, setDraggingAssetId] = useState<string | null>(null);

    const mapRef = useRef<google.maps.Map>();

    const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
        if (isDrawing && event.latLng) {
            const newPoint = {
                lat: event.latLng.lat(),
                lng: event.latLng.lng(),
            };
            setDrawingPath(prev => [...prev, newPoint]);
        }
    }, [isDrawing]);

    const startDrawing = useCallback(() => {
        setIsDrawing(true);
        setDrawingPath([]);
        setIsCreatingAsset(false);
    }, []);

    const finishDrawing = useCallback(() => {
        setIsDrawing(false);
        return drawingPath;
    }, [drawingPath]);

    const startCreatingAsset = useCallback(() => {
        setIsCreatingAsset(true);
        setIsDrawing(false);
    }, []);

    const handleAssetDragStart = useCallback((assetId: string) => {
        setIsDraggingAsset(true);
        setDraggingAssetId(assetId);
    }, []);

    const handleAssetDragEnd = useCallback((event: google.maps.MapMouseEvent, assetId: string) => {
        if (event.latLng && isDraggingAsset && draggingAssetId === assetId) {
            const newPosition = {
                lat: event.latLng.lat(),
                lng: event.latLng.lng(),
            };
            setIsDraggingAsset(false);
            setDraggingAssetId(null);
            return newPosition;
        }
        return null;
    }, [isDraggingAsset, draggingAssetId]);

    const clearSelections = useCallback(() => {
        setSelectedGeofence(null);
        setSelectedAsset(null);
    }, []);

    const handleMapLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
    }, []);

    const handleForceRefresh = useCallback(() => {
        if (mapRef.current) {
            forceMapRefresh(mapRef.current);
        }
    }, []);

    return {
        selectedGeofence,
        selectedAsset,
        isDrawing,
        drawingPath,
        isCreatingAsset,
        isDraggingAsset,
        draggingAssetId,
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
    };
};

export const useDialogs = () => {
    const [openDialog, setOpenDialog] = useState(false);
    const [openAssetDialog, setOpenAssetDialog] = useState(false);
    const [openAlertSnackbar, setOpenAlertSnackbar] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [showCollisionWarning, setShowCollisionWarning] = useState(false);

    const [newGeofence, setNewGeofence] = useState<NewGeofenceForm>(DEFAULT_GEOFENCE_FORM);
    const [newAsset, setNewAsset] = useState<NewAssetForm>(DEFAULT_ASSET_FORM);
    const [geofenceCollisions, setGeofenceCollisions] = useState<GeofenceCollision[]>([]);

    const resetForms = useCallback(() => {
        setNewGeofence(DEFAULT_GEOFENCE_FORM);
        setNewAsset(DEFAULT_ASSET_FORM);
    }, []);

    const closeAllDialogs = useCallback(() => {
        setOpenDialog(false);
        setOpenAssetDialog(false);
        setShowCollisionWarning(false);
        setGeofenceCollisions([]);
    }, []);

    return {
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
        closeAllDialogs,
    };
};

export const useAssetTracking = (assets: Asset[], geofences: GeofenceZone[], onCreateAlert: (alert: any) => void, onUpdateAsset: (id: string, updates: Partial<Asset>) => void) => {
    useEffect(() => {
        const interval = setInterval(() => {
            assets.forEach(asset => {
                if (!asset.isActive) return;

                const newPosition = generateRandomMovement(asset.position, CURRENT_BOUNDS);
                const updates: Partial<Asset> = {
                    position: newPosition,
                    status: 'moving',
                };


                if (Math.random() > 0.1) {
                    onUpdateAsset(asset.id, updates);
                }
            });
        }, UPDATE_INTERVALS.ASSET_MOVEMENT);

        return () => clearInterval(interval);
    }, [assets, onUpdateAsset]);

    useEffect(() => {
        const checkViolations = async () => {
            for (const asset of assets) {
                if (!asset.isActive) continue;

                for (const geofence of geofences) {
                    if (!geofence.isActive) continue;

                    const isInside = isPointInPolygon(asset.position, geofence.coordinates);
                    const wasInside = asset.wasInGeofence?.[geofence.id] || false;

                    if (isInside !== wasInside) {
                        const alertType = isInside ? 'entry' : 'exit';
                        const shouldAlert = (isInside && geofence.alertOnEntry) || (!isInside && geofence.alertOnExit);

                        if (shouldAlert) {
                            try {
                                const alertData = {
                                    assetId: asset.id,
                                    assetName: asset.name,
                                    geofenceId: geofence.id,
                                    geofenceName: geofence.name,
                                    alertType,
                                    position: asset.position,
                                    severity: 'medium',
                                };

                                await onCreateAlert(alertData);
                            } catch (error) {
                                console.error('Error creating alert:', error);
                            }
                        }
                    }
                }
            }
        };

        const interval = setInterval(checkViolations, UPDATE_INTERVALS.VIOLATION_CHECK);
        return () => clearInterval(interval);
    }, [assets, geofences, onCreateAlert]);
};