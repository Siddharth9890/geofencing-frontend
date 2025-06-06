import type { GeofenceZone, Asset, GeofenceAlert } from '@/types';
import { API_BASE_URL } from '../constants';

class ApiService {
    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }
        return response.json();
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });
        return this.handleResponse<T>(response);
    }

    // Geofences
    async getGeofences(): Promise<GeofenceZone[]> {
        try {
            const data = await this.request<any>('/geofences');
            return Array.isArray(data) ? data : data.items || data.geofences || [];
        } catch (error) {
            console.error('Failed to fetch geofences:', error);
            return [];
        }
    }

    async createGeofence(
        geofence: Omit<GeofenceZone, 'id' | 'createdAt'>
    ): Promise<GeofenceZone> {
        return this.request<GeofenceZone>('/geofences', {
            method: 'POST',
            body: JSON.stringify(geofence),
        });
    }

    async updateGeofence(
        id: string,
        updates: Partial<GeofenceZone>
    ): Promise<GeofenceZone> {
        return this.request<GeofenceZone>(`/geofences/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    }

    async deleteGeofence(id: string): Promise<void> {
        await this.request(`/geofences/${id}`, {
            method: 'DELETE',
        });
    }

    // Assets
    async getAssets(): Promise<Asset[]> {
        try {
            const data = await this.request<any>('/assets');
            return Array.isArray(data) ? data : data.items || data.assets || [];
        } catch (error) {
            console.error('Failed to fetch assets:', error);
            return [];
        }
    }

    async createAsset(asset: Omit<Asset, 'id' | 'lastUpdate'>): Promise<Asset> {
        return this.request<Asset>('/assets', {
            method: 'POST',
            body: JSON.stringify(asset),
        });
    }

    async updateAsset(id: string, updates: Partial<Asset>): Promise<Asset> {
        return this.request<Asset>(`/assets/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    }

    async deleteAsset(id: string): Promise<void> {
        await this.request(`/assets/${id}`, {
            method: 'DELETE',
        });
    }

    // Alerts
    async getAlerts(): Promise<GeofenceAlert[]> {
        try {
            const data = await this.request<any>('/alerts');
            return Array.isArray(data) ? data : data.items || data.alerts || [];
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
            return [];
        }
    }

    async createAlert(
        alert: Omit<GeofenceAlert, 'id' | 'timestamp' | 'acknowledged'>
    ): Promise<GeofenceAlert> {
        return this.request<GeofenceAlert>('/alerts', {
            method: 'POST',
            body: JSON.stringify(alert),
        });
    }
}

export const apiService = new ApiService();