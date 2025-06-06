import React from "react";
import { Paper, Box, Typography, Alert } from "@mui/material";
import type { GeofenceAlert } from "@/types";

interface AlertsPanelProps {
  alerts: GeofenceAlert[];
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts }) => {
  return (
    <Paper elevation={3} sx={{ height: "600px", overflow: "auto" }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Recent Alerts
        </Typography>
        {alerts.length === 0 ? (
          <Typography variant="body2" color="textSecondary">
            No alerts yet
          </Typography>
        ) : (
          alerts.map((alert) => (
            <Alert
              key={alert.id}
              severity={alert.alertType === "entry" ? "info" : "warning"}
              sx={{ mb: 1 }}
            >
              <Typography variant="body2">
                <strong>{alert.assetName}</strong>{" "}
                {alert.alertType === "entry" ? "entered" : "exited"}{" "}
                <strong>{alert.geofenceName}</strong>
              </Typography>
              <Typography variant="caption">
                {new Date(alert.timestamp).toLocaleString()}
              </Typography>
            </Alert>
          ))
        )}
      </Box>
    </Paper>
  );
};

export default AlertsPanel;
