import type { GeofenceZone, GeofenceCollision, MapBounds } from '@/types';
import { CURRENT_BOUNDS } from '@/constants';

export const isPointInPolygon = (
    point: google.maps.LatLngLiteral,
    polygon: google.maps.LatLngLiteral[]
): boolean => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        if (
            polygon[i].lat > point.lat !== polygon[j].lat > point.lat &&
            point.lng <
            ((polygon[j].lng - polygon[i].lng) * (point.lat - polygon[i].lat)) /
            (polygon[j].lat - polygon[i].lat) +
            polygon[i].lng
        ) {
            inside = !inside;
        }
    }
    return inside;
};

export const isWithinBounds = (lat: number, lng: number, bounds: MapBounds = CURRENT_BOUNDS): boolean => {
    return (
        lat >= bounds.south &&
        lat <= bounds.north &&
        lng >= bounds.west &&
        lng <= bounds.east
    );
};

export const calculatePolygonOverlap = (
    poly1: google.maps.LatLngLiteral[],
    poly2: google.maps.LatLngLiteral[]
) => {
    let overlapCount = 0;
    const totalPoints = poly1.length + poly2.length;

    poly1.forEach((point) => {
        if (isPointInPolygon(point, poly2)) {
            overlapCount++;
        }
    });

    poly2.forEach((point) => {
        if (isPointInPolygon(point, poly1)) {
            overlapCount++;
        }
    });

    const overlapPercentage = (overlapCount / totalPoints) * 100;

    return {
        hasOverlap: overlapCount > 0,
        overlapPercentage: Math.round(overlapPercentage),
    };
};

export const detectGeofenceCollisions = (
    newGeofence: Partial<GeofenceZone>,
    existingGeofences: GeofenceZone[]
): GeofenceCollision[] => {
    const collisions: GeofenceCollision[] = [];

    existingGeofences.forEach((existing) => {
        if (!existing.isActive || !newGeofence.coordinates) return;

        const overlap = calculatePolygonOverlap(
            newGeofence.coordinates,
            existing.coordinates
        );

        if (overlap.hasOverlap) {
            const severity =
                overlap.overlapPercentage > 50
                    ? 'high'
                    : overlap.overlapPercentage > 20
                        ? 'medium'
                        : 'low';

            collisions.push({
                id: `collision-${Date.now()}-${existing.id}`,
                geofence1: newGeofence as GeofenceZone,
                geofence2: existing,
                overlapArea: overlap.overlapPercentage,
                severity,
            });
        }
    });

    return collisions;
};

export const generateRandomMovement = (
    currentPosition: google.maps.LatLngLiteral,
    bounds: MapBounds = CURRENT_BOUNDS
): google.maps.LatLngLiteral => {
    const newLat = currentPosition.lat + (Math.random() - 0.5) * 0.0009;
    const newLng = currentPosition.lng + (Math.random() - 0.5) * 0.0009;

    const boundedLat = Math.max(bounds.south, Math.min(bounds.north, newLat));
    const boundedLng = Math.max(bounds.west, Math.min(bounds.east, newLng));

    return { lat: boundedLat, lng: boundedLng };
};

export const createAssetIcon = (isActive: boolean, size: number = 40) => {
    const color = isActive ? '#4CAF50' : '#757575';
    return {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2.67}" fill="${color}" stroke="white" stroke-width="3"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 5}" fill="white"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 10}" fill="${color}"/>
      </svg>
    `)}`,
        scaledSize:
            typeof window !== 'undefined' && window.google?.maps
                ? new window.google.maps.Size(size, size)
                : undefined,
    };
};

export const forceMapRefresh = (map: google.maps.Map) => {
    if (typeof window !== 'undefined' && window.google?.maps?.event) {
        window.google.maps.event.trigger(map, 'resize');
    }

    const currentZoom = map.getZoom() || 14;
    map.setZoom(currentZoom - 0.1);

    setTimeout(() => {
        map.setZoom(currentZoom);
    }, 200);
};