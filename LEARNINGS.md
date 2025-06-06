# Technical Learnings - Geofencing Project

## 1. 🗺️ Google Maps API Integration

**What I Learned:**
- Integrated Google Maps JavaScript API with React using `@react-google-maps/api`
- Managed map instances and click events to capture coordinates
- Used `LoadScript` component to properly initialize maps without re-renders

**Key Implementation:**
```typescript
const mapOptions = {
  center: { lat: 18.5204, lng: 73.8567 }, // Pune, India
  zoom: 12
};
```

## 2. 📍 Mapping Points and Polygon Creation

**What I Learned:**
- Handled map click events to capture lat/lng coordinates
- Built interactive polygon drawing by storing sequential clicks
- Implemented point-in-polygon detection using ray casting algorithm
- Created real-time polygon rendering during drawing process

**Core Challenge:** Converting map clicks into drawable polygons and detecting when assets enter/exit these zones.

## 3. 🗄️ DynamoDB Usage and Design

**What I Learned:**
- Designed DynamoDB tables with simple partition keys (id)
- Used Global Secondary Index for timestamp-based alert queries
- Handled nested objects (coordinates, positions) in NoSQL structure
- Implemented AWS SDK v3 for CRUD operations

**Table Structure:**
- **Geofences**: id (PK), coordinates array, alert settings
- **Assets**: id (PK), position object, real-time status
- **Alerts**: id (PK), timestamp (GSI) for time-based queries

## 4. 🔄 Updating Asset Positions in Real-time

**What I Learned:**
- Used `setInterval` to simulate asset movement every 2 seconds
- Managed state updates without infinite re-renders using proper dependencies
- Implemented cleanup in `useEffect` to prevent memory leaks
- Built efficient position update patterns with custom hooks

**Key Pattern:**
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    assets.forEach(asset => updateAssetPosition(asset.id));
  }, 2000);
  return () => clearInterval(interval);
}, [assets]);
```

## 5. ⚡ SST (Serverless Stack) Framework

**What I Learned:**
- Built serverless APIs using SST instead of traditional Serverless Framework
- Leveraged Live Lambda Development for instant local testing


**Architecture:**
```typescript
const api = new Api(stack, "Api", {
  routes: {
    "GET /assets": "packages/functions/src/assets.list",
    "POST /assets": "packages/functions/src/assets.create"
  }
});
```

## 6. 🏗️ React State Management Without External Libraries

**What I Learned:**
- Built complex state management using only React hooks
- Created custom hooks (`useGeofencing`, `useMapControls`) for separation of concerns
- Managed real-time updates without Redux or external state libraries
- Handled multiple concurrent operations (drawing, asset movement, alerts)

**Custom Hook Pattern:**
```typescript
const useGeofencing = () => {
  const [geofences, setGeofences] = useState([]);
  const [assets, setAssets] = useState([]);
  // All business logic encapsulated in custom hooks
};
```

## 🚀 Key Achievements

- **Real-time Performance**: Assets move smoothly every 2 seconds with live geofence detection
- **Serverless Architecture**: Auto-scaling backend with DynamoDB and Lambda
- **Interactive Maps**: Click-to-draw polygons with collision detection
- **Production Ready**: Comprehensive error handling and loading states