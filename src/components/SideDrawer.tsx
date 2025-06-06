import React from "react";
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  IconButton,
  Divider,
  Chip,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import type { Asset, GeofenceZone } from "@/types";

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
  geofences: GeofenceZone[];
  assets: Asset[];
  onToggleGeofence: (id: string) => void;
  onDeleteGeofence: (id: string) => void;
  onToggleAsset: (id: string) => void;
  onDeleteAsset: (id: string) => void;
}

const SideDrawer: React.FC<SideDrawerProps> = ({
  open,
  onClose,
  geofences,
  assets,
  onToggleGeofence,
  onDeleteGeofence,
  onToggleAsset,
  onDeleteAsset,
}) => {
  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 350, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Geofences
        </Typography>
        <List>
          {geofences.map((geofence) => (
            <React.Fragment key={geofence.id}>
              <ListItem>
                <Box sx={{ width: "100%" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="subtitle1">{geofence.name}</Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => onToggleGeofence(geofence.id)}
                      >
                        {geofence.isActive ? (
                          <VisibilityIcon />
                        ) : (
                          <VisibilityOffIcon />
                        )}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onDeleteGeofence(geofence.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {geofence.description}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      size="small"
                      label={geofence.isActive ? "Active" : "Inactive"}
                      color={geofence.isActive ? "success" : "default"}
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      size="small"
                      label={`${geofence.coordinates.length} points`}
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Assets
        </Typography>
        <List>
          {assets.map((asset) => (
            <React.Fragment key={asset.id}>
              <ListItem>
                <Box sx={{ width: "100%" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="subtitle1">{asset.name}</Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => onToggleAsset(asset.id)}
                      >
                        {asset.isActive ? (
                          <VisibilityIcon />
                        ) : (
                          <VisibilityOffIcon />
                        )}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onDeleteAsset(asset.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Type: {asset.type || "vehicle"} | Speed:{" "}
                    {asset.speed?.toFixed(1)} km/h
                  </Typography>
                  <Typography variant="caption">
                    Last seen: {new Date(asset.lastUpdate).toLocaleTimeString()}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      size="small"
                      label={asset.isActive ? "Online" : "Offline"}
                      color={asset.isActive ? "success" : "error"}
                    />
                  </Box>
                </Box>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default SideDrawer;
