export interface GeofenceZone {
    id: string;
    name: string;
    description: string;
    coordinates: google.maps.LatLngLiteral[];
    isActive: boolean;
    alertOnEntry: boolean;
    alertOnExit: boolean;
    createdAt: string;
}

export interface Asset {
    id: string;
    name: string;
    type?: string;
    position: google.maps.LatLngLiteral;
    lastUpdate: string;
    isActive: boolean;
    speed: number;
    heading: number;
    status?: string;
    wasInGeofence?: Record<string, boolean>;
}

export interface GeofenceAlert {
    id: string;
    assetId: string;
    assetName: string;
    geofenceId: string;
    geofenceName: string;
    alertType: "entry" | "exit";
    timestamp: string;
    position: google.maps.LatLngLiteral;
    severity?: string;
    acknowledged?: boolean;
}

export interface GeofenceCollision {
    id: string;
    geofence1: GeofenceZone;
    geofence2: GeofenceZone;
    overlapArea: number;
    severity: "low" | "medium" | "high";
}

export interface MapBounds {
    north: number;
    south: number;
    east: number;
    west: number;
}

export interface NewGeofenceForm {
    name: string;
    description: string;
    color: string;
    alertOnEntry: boolean;
    alertOnExit: boolean;
}

export interface NewAssetForm {
    name: string;
    type: string;
    position?: google.maps.LatLngLiteral;
}