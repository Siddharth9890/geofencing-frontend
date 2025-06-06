import type { MapBounds } from '@/types';

export const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export const MAP_BOUNDS: Record<string, MapBounds> = {
    pune_city: {
        north: 18.5704,
        south: 18.4574,
        east: 73.937,
        west: 73.7874,
    },
    pune_central: {
        north: 18.543,
        south: 18.503,
        east: 73.873,
        west: 73.843,
    },
    pune_expanded: {
        north: 18.5800,
        south: 18.4800,
        east: 73.9000,
        west: 73.8000,
    },
};

export const CURRENT_BOUNDS = MAP_BOUNDS.pune_expanded;

export const MAP_CENTER = {
    lat: (CURRENT_BOUNDS.north + CURRENT_BOUNDS.south) / 2,
    lng: (CURRENT_BOUNDS.east + CURRENT_BOUNDS.west) / 2,
};

export const MAP_OPTIONS = {
    restriction: {
        latLngBounds: {
            north: CURRENT_BOUNDS.north,
            south: CURRENT_BOUNDS.south,
            east: CURRENT_BOUNDS.east,
            west: CURRENT_BOUNDS.west,
        },
        strictBounds: false,
    },
    minZoom: 10,
    maxZoom: 20,
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
};

export const MAP_CONTAINER_STYLE = {
    width: "100%",
    height: "600px",
};

export const ASSET_TYPES = [
    { value: "vehicle", label: "Vehicle" },
];

export const UPDATE_INTERVALS = {
    ASSET_MOVEMENT: 5000,
    VIOLATION_CHECK: 2000,
};

export const DEFAULT_GEOFENCE_FORM = {
    name: "",
    description: "",
    color: "#FF5722",
    alertOnEntry: true,
    alertOnExit: true,
};

export const DEFAULT_ASSET_FORM = {
    name: "",
    type: "vehicle",
    position: undefined,
};