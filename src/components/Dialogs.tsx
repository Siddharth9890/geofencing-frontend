import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Alert,
  Snackbar,
} from "@mui/material";
import { Warning as WarningIcon } from "@mui/icons-material";
import type { GeofenceCollision } from "@/types";

interface DialogsContainerProps {
  openDialog: boolean;
  openAssetDialog: boolean;
  openAlertSnackbar: boolean;
  showCollisionWarning: boolean;

  newGeofence: {
    name: string;
    description: string;
    color: string;
    alertOnEntry: boolean;
    alertOnExit: boolean;
  };
  newAsset: {
    name: string;
    type: string;
    position?: google.maps.LatLngLiteral;
  };
  geofenceCollisions: GeofenceCollision[];

  onCloseDialog: () => void;
  onCloseAssetDialog: () => void;
  onCloseAlertSnackbar: () => void;
  onCloseCollisionWarning: () => void;
  onUpdateGeofence: React.Dispatch<
    React.SetStateAction<{
      name: string;
      description: string;
      color: string;
      alertOnEntry: boolean;
      alertOnExit: boolean;
    }>
  >;
  onUpdateAsset: React.Dispatch<
    React.SetStateAction<{
      name: string;
      type: string;
      position?: google.maps.LatLngLiteral;
    }>
  >;
  onSaveGeofence: () => void;
  onSaveAsset: () => void;
}

const DialogsContainer: React.FC<DialogsContainerProps> = ({
  openDialog,
  openAssetDialog,
  openAlertSnackbar,
  showCollisionWarning,
  newGeofence,
  newAsset,
  geofenceCollisions,
  onCloseDialog,
  onCloseAssetDialog,
  onCloseAlertSnackbar,
  onCloseCollisionWarning,
  onUpdateGeofence,
  onUpdateAsset,
  onSaveGeofence,
  onSaveAsset,
}) => {
  const handleCollisionAction = (action: "allow" | "cancel") => {
    switch (action) {
      case "allow":
        onSaveGeofence();
        onCloseCollisionWarning();
        break;
      case "cancel":
        onCloseCollisionWarning();
        break;
    }
  };

  return (
    <>
      {/* New Asset Dialog */}
      <Dialog
        open={openAssetDialog}
        onClose={onCloseAssetDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Asset</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Asset Name"
            fullWidth
            value={newAsset.name}
            onChange={(e) =>
              onUpdateAsset((prev) => ({ ...prev, name: e.target.value }))
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Asset Type"
            select
            fullWidth
            value={newAsset.type}
            onChange={(e) =>
              onUpdateAsset((prev) => ({
                ...prev,
                type: e.target.value,
              }))
            }
            sx={{ mb: 2 }}
            SelectProps={{ native: true }}
          >
            <option value="vehicle">Vehicle</option>
            <option value="person">Person</option>
            <option value="drone">Drone</option>
            <option value="equipment">Equipment</option>
          </TextField>
          {newAsset.position && (
            <Box sx={{ p: 1, bgcolor: "grey.100", borderRadius: 1, mb: 2 }}>
              <Typography variant="caption" color="textSecondary">
                📍 Position: {newAsset.position.lat.toFixed(6)},{" "}
                {newAsset.position.lng.toFixed(6)}
              </Typography>
            </Box>
          )}
          <Typography variant="body2" color="textSecondary">
            Asset will be created at the clicked map location
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseAssetDialog}>Cancel</Button>
          <Button
            onClick={onSaveAsset}
            variant="contained"
            disabled={!newAsset.name}
          >
            Create Asset
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Geofence Dialog */}
      <Dialog open={openDialog} onClose={onCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Geofence</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Zone Name"
            fullWidth
            value={newGeofence.name}
            onChange={(e) =>
              onUpdateGeofence((prev) => ({ ...prev, name: e.target.value }))
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={newGeofence.description}
            onChange={(e) =>
              onUpdateGeofence((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Color"
            type="color"
            value={newGeofence.color}
            onChange={(e) =>
              onUpdateGeofence((prev) => ({ ...prev, color: e.target.value }))
            }
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={newGeofence.alertOnEntry}
                onChange={(e) =>
                  onUpdateGeofence((prev) => ({
                    ...prev,
                    alertOnEntry: e.target.checked,
                  }))
                }
              />
            }
            label="Alert on Entry"
          />
          <FormControlLabel
            control={
              <Switch
                checked={newGeofence.alertOnExit}
                onChange={(e) =>
                  onUpdateGeofence((prev) => ({
                    ...prev,
                    alertOnExit: e.target.checked,
                  }))
                }
              />
            }
            label="Alert on Exit"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseDialog}>Cancel</Button>
          <Button
            onClick={onSaveGeofence}
            variant="contained"
            disabled={!newGeofence.name}
          >
            Create Zone
          </Button>
        </DialogActions>
      </Dialog>

      {/* Geofence Collision Warning Dialog */}
      <Dialog
        open={showCollisionWarning}
        onClose={onCloseCollisionWarning}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <WarningIcon color="warning" sx={{ mr: 1 }} />
            Geofence Collision Detected
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            The new geofence overlaps with existing geofences:
          </Typography>

          {geofenceCollisions.map((collision) => (
            <Alert
              key={collision.id}
              severity={
                collision.severity === "high"
                  ? "error"
                  : collision.severity === "medium"
                  ? "warning"
                  : "info"
              }
              sx={{ mb: 2 }}
            >
              <Typography variant="subtitle2">
                Collision with: <strong>{collision.geofence2.name}</strong>
              </Typography>
              <Typography variant="body2">
                Overlap: {collision.overlapArea}% • Severity:{" "}
                {collision.severity.toUpperCase()}
              </Typography>
            </Alert>
          ))}

          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Choose how to handle this collision:
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{ flexDirection: "column", alignItems: "stretch", p: 3 }}
        >
          <Button
            onClick={() => handleCollisionAction("allow")}
            variant="contained"
            color="primary"
            sx={{ mb: 1 }}
          >
            Allow Overlap - Create Anyway
          </Button>

          <Button
            onClick={() => handleCollisionAction("cancel")}
            variant="outlined"
            color="error"
          >
            Cancel - Don't Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar
        open={openAlertSnackbar}
        autoHideDuration={6000}
        onClose={onCloseAlertSnackbar}
      >
        <Alert onClose={onCloseAlertSnackbar} severity="warning">
          New geofence alert! Check the alerts panel.
        </Alert>
      </Snackbar>
    </>
  );
};

export default DialogsContainer;
