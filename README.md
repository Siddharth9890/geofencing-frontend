# Geofencing Management System - Frontend

A React-based geofencing application that allows users to create and manage geofences, track assets in real-time, and receive alerts when assets enter or exit defined zones.

## Features

- 🗺️ **Interactive Google Maps** - Draw polygons and place assets
- 🎯 **Real-time Asset Tracking** - Monitor asset movements with live updates
- 🚨 **Geofence Alerts** - Get notified when assets enter/exit zones
- 📁 **GeoJSON Import** - Upload existing geofence data
- 🎨 **Material-UI Design** - Modern, responsive interface
- ⚡ **Collision Detection** - Prevent overlapping geofences

## Tech Stack

- **React 18** with TypeScript
- **Google Maps API** for mapping functionality
- **Material-UI (MUI)** for UI components
- **Custom Hooks** for state management
- **Vite** for fast development and building

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Maps API Key
- Backend API running (see backend README)

## Quick Setup

### 1. Clone and Install
```bash
git clone [repository-url]
cd geofencing-frontend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_API_BASE_URL=your_backend_api_url_here
```

### 3. Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Maps JavaScript API
3. Create credentials (API Key)
4. Add the key to your `.env` file

### 4. Start Development Server
```bash
npm run dev
```

The application will open at `http://localhost:3000`

## Project Structure

```
src/
├── components/          # React components
│   ├── Map/            # Google Maps integration
│   ├── Dialogs/        # Modal dialogs
│   ├── SideDrawer/     # Navigation drawer
│   └── AlertsPanel/    # Alerts display
├── hooks/              # Custom React hooks
│   └── useGeofencing.ts # Main state management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── App.tsx             # Main application component
```

## Key Components

- **MapComponent** - Google Maps integration with drawing tools
- **DialogsContainer** - Asset creation and geofence dialogs
- **SideDrawer** - Asset and geofence management panel
- **AlertsPanel** - Real-time alerts display

## Usage

### Creating Geofences
1. Click "Draw Zone" button
2. Click on map to create polygon points
3. Click "Finish Drawing" when done
4. Fill in geofence details and save

### Adding Assets
1. Click "Add Asset" button
2. Click on map where you want to place the asset
3. Fill in asset details and save
4. Assets will automatically start moving and tracking


## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Configuration

### Google Maps Settings
The map is configured for Pune, India by default. You can change the center and bounds in the constants file.

### API Integration
Update the API base URL in your `.env` file to connect to your backend.

**Demo Link**: [Add your deployed application URL here]