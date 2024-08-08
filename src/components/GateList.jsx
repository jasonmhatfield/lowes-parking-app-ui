import React from 'react';
import { List, ListItem, ListItemText, Button, Typography } from '@mui/material';

const GateList = ({ gates, onToggle }) => (
  <>
    <Typography variant="h6" gutterBottom>Manage Gates</Typography>
    <List>
      {gates.map(gate => (
        <ListItem key={gate.gateId} divider>
          <ListItemText primary={`${gate.gateName} - ${gate.isOperational ? 'Open' : 'Closed'}`} />
          <Button
            variant="contained"
            color={gate.isOperational ? 'secondary' : 'primary'}
            onClick={() => onToggle(gate.gateId, gate.isOperational)}
          >
            {gate.isOperational ? 'Close' : 'Open'}
          </Button>
        </ListItem>
      ))}
    </List>
  </>
);

export default GateList;
