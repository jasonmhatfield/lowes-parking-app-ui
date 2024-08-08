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

        // Check if the current user is already parked and set the parkedLocation state
        const parkedSpot = response.data.find(spot => spot.userId === currentUser.id);
        if (parkedSpot) {
          setParkedLocation(parkedSpot);
        }
      } catch (error) {
        console.error('Error fetching parking spots:', error);
      }
    };

    fetchGates();
    fetchParkingSpots();
  }, [currentUser.id]);

  const handlePark = async (spotId) => {
    try {
      const response = await axios.patch(`http://localhost:8080/parkingSpots/${spotId}`, { isOccupied: true, userId: currentUser.id });
      setParkedLocation(response.data);
      setParkingSpots(prevSpots => prevSpots.map(spot =>
        spot.id === spotId ? { ...spot, isOccupied: true, userId: currentUser.id } : spot
      ));
      setNotification('Parked successfully.');
    } catch (error) {
      setNotification('Error parking the car.');
      console.error('Error parking the car:', error);
    }
  };

  const handleLeave = async () => {
    try {
      await axios.patch(`http://localhost:8080/parkingSpots/${parkedLocation.id}`, { isOccupied: false, userId: null });
      setParkingSpots(prevSpots => prevSpots.map(spot =>
        spot.id === parkedLocation.id ? { ...spot, isOccupied: false, userId: null } : spot
      ));
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
        <button
          key={spot.id}
          onClick={() => spot.userId === currentUser.id ? handleLeave() : handlePark(spot.id)}
          disabled={(spot.isOccupied && spot.userId !== currentUser.id) || (parkedLocation && spot.userId !== currentUser.id)}
        >
          {spot.userId === currentUser.id ? 'Leave' : `${spot.spotNumber} - ${spot.isOccupied ? 'Occupied' : 'Available'}`}
        </button>
      ))}

      {notification && <p>{notification}</p>}
    </div>
  );
};

export default UserDashboard;
