import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserDashboard = ({ currentUser, onLogout }) => {
  const [gates, setGates] = useState([]);
  const [parkingSpots, setParkingSpots] = useState([]);
  const [notification, setNotification] = useState('');
  const [parkedLocation, setParkedLocation] = useState(null);

  useEffect(() => {
    const fetchGates = async () => {
      try {
        const response = await axios.get('http://localhost:8080/gates');
        setGates(response.data);
      } catch (error) {
        console.error('Error fetching gates:', error);
      }
    };

    const fetchParkingSpots = async () => {
      try {
        const response = await axios.get('http://localhost:8080/parkingSpots');
        setParkingSpots(response.data);
      } catch (error) {
        console.error('Error fetching parking spots:', error);
      }
    };

    fetchGates();
    fetchParkingSpots();
  }, []);

  const handlePark = async (spotId) => {
    try {
      const response = await axios.patch(`http://localhost:8080/parkingSpots/${spotId}`, { isOccupied: true, userId: currentUser.id });
      setParkedLocation(response.data);
      setNotification('Parked successfully.');
    } catch (error) {
      setNotification('Error parking the car.');
      console.error('Error parking the car:', error);
    }
  };

  const handleLeave = async () => {
    try {
      await axios.patch(`http://localhost:8080/parkingSpots/${parkedLocation.id}`, { isOccupied: false, userId: null });
      setParkedLocation(null);
      setNotification('Left the parking spot.');
    } catch (error) {
      setNotification('Error leaving the parking spot.');
      console.error('Error leaving the parking spot:', error);
    }
  };

  return (
    <div>
      <h2>User Dashboard</h2>
      <p>Welcome, {currentUser.firstName} {currentUser.lastName}</p>
      <button onClick={onLogout}>Logout</button>

      <h3>Parking Gate Status</h3>
      {gates.map(gate => (
        <p key={gate.id}>{gate.gateName}: {gate.isOperational ? 'Open' : 'Closed'}</p>
      ))}

      <h3>Available Parking Spots</h3>
      {parkingSpots.map(spot => (
        <button key={spot.id} onClick={() => handlePark(spot.id)} disabled={spot.isOccupied}>
          {spot.spotNumber} - {spot.isOccupied ? 'Occupied' : 'Available'}
        </button>
      ))}

      {parkedLocation && (
        <>
          <h3>Your Parked Location</h3>
          <p>Level: {parkedLocation.level}</p>
          <p>Space: {parkedLocation.spaceNumber}</p>
          <button onClick={handleLeave}>Leave Spot</button>
        </>
      )}

      {notification && <p>{notification}</p>}
    </div>
  );
};

export default UserDashboard;
