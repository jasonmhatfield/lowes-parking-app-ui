import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Button, Snackbar, Box, Paper } from '@mui/material';

const UserDashboard = ({ currentUser, onLogout }) => {
  const [gates, setGates] = useState([]);
  const [parkingSpots, setParkingSpots] = useState([]);
  const [notification, setNotification] = useState('');
  const [parkedLocation, setParkedLocation] = useState(null);

  useEffect(() => {
    const fetchGates = async () => {
      const response = await axios.get('/api/gates');
      setGates(response.data);
    };

    const fetchParkingSpots = async () => {
      const response = await axios.get('/api/parking-spots');
      setParkingSpots(response.data);
    };

    fetchGates();
    fetchParkingSpots();
  }, []);

  const handlePark = async (spotId) => {
    try {
      const response = await axios.post(`/api/parking-spots/${spotId}/park`, { userId: currentUser.userId });
      setParkedLocation(response.data);
      setNotification('Parked successfully.');
    } catch (error) {
      setNotification('Error parking the car.');
    }
  };

  const handleLeave = async () => {
    try {
      await axios.post(`/api/parking-spots/${parkedLocation.spotId}/leave`, { userId: currentUser.userId });
      setParkedLocation(null);
      setNotification('Left the parking spot.');
    } catch (error) {
      setNotification('Error leaving the parking spot.');
    }
  };

  return (
    <Container>
      <Typography variant="h4">User Dashboard</Typography>
      <Button onClick={onLogout} variant="contained" color="primary">Logout</Button>

      <Typography variant="h6">Parking Gate Status</Typography>
      {gates.map(gate => (
        <Typography key={gate.gateId}>{gate.gateName}: {gate.isOperational ? 'Open' : 'Closed'}</Typography>
      ))}

      <Typography variant="h6">Available Parking Spots</Typography>
      {parkingSpots.map(spot => (
        <Button key={spot.spotId} onClick={() => handlePark(spot.spotId)} disabled={spot.isOccupied}>
          {spot.spotNumber} - {spot.isOccupied ? 'Occupied' : 'Available'}
        </Button>
      ))}

      {parkedLocation && (
        <>
          <Typography variant="h6">Your Parked Location</Typography>
          <Typography>Level: {parkedLocation.level}</Typography>
          <Typography>Space: {parkedLocation.spaceNumber}</Typography>
          <Button onClick={handleLeave} variant="contained" color="secondary">Leave Spot</Button>
        </>
      )}

      {notification && <Snackbar open message={notification} onClose={() => setNotification('')} />}
    </Container>
  );
};

export default UserDashboard;
