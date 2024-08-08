import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AccessibleIcon from '@mui/icons-material/Accessible';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import AlertModal from '../modals/AlertModal';
import { useAlert } from '../context/AlertContext';

const UserDashboard = ({ currentUser, onLogout }) => {
  const [gates, setGates] = useState([]);
  const [parkingSpots, setParkingSpots] = useState([]);
  const [notification, setNotification] = useState('');
  const [parkedLocation, setParkedLocation] = useState(null);
  const { alert, showAlert, hideAlert } = useAlert();

  useEffect(() => {
    const fetchGates = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/gates');
        setGates(response.data);
      } catch (error) {
        console.error('Error fetching gates:', error);
      }
    };

    const fetchParkingSpots = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/parkingSpots');
        setParkingSpots(response.data);

        // Check if the current user is already parked and set the parkedLocation state
        const parkedSpot = response.data.find(spot => spot.userId === currentUser.id);
        if (parkedSpot) {
          setParkedLocation(parkedSpot);
        }

        const totalSpots = response.data.length;
        const availableSpots = response.data.filter(spot => !spot.isOccupied).length;
        const availableHandicapSpots = response.data.filter(spot => !spot.isOccupied && spot.type === 'handicap').length;
        const availableEvSpots = response.data.filter(spot => !spot.isOccupied && spot.type === 'ev').length;
        if (availableSpots / totalSpots < 0.2) {
          showAlert('Parking availability is below 20%.');
        }
        if (availableHandicapSpots / totalSpots < 0.2 && currentUser.hasHandicapPlacard) {
          showAlert('Handicap parking availability is below 20%.');
        }
        if (availableEvSpots / totalSpots < 0.2 && currentUser.hasEv) {
          showAlert('EV parking availability is below 20%.');
        }
      } catch (error) {
        console.error('Error fetching parking spots:', error);
      }
    };

    fetchGates();
    fetchParkingSpots();
  }, [currentUser.id, showAlert]);

  const handlePark = async (spotId) => {
    try {
      const response = await axios.patch(`http://localhost:8080/api/parkingSpots/${spotId}`, {
        isOccupied: true,
        userId: Number(currentUser.id) // Ensure this is passed as a Long
      });
      setParkedLocation(response.data);
      setParkingSpots(prevSpots => prevSpots.map(spot =>
        spot.id === spotId ? { ...spot, isOccupied: true, userId: currentUser.id } : spot
      ));
      setNotification('Parked successfully.');
    } catch (error) {
      if (error.response) {
        console.error('Error parking the car:', error.response.data);
        setNotification(`Error: ${error.response.data.message || 'An error occurred while parking the car.'}`);
      } else {
        console.error('Error parking the car:', error.message);
        setNotification('An unknown error occurred.');
      }
    }
  };

  const handleLeave = async () => {
    try {
      const response = await axios.patch(`http://localhost:8080/api/parkingSpots/${parkedLocation.id}`, {
        isOccupied: false,
        userId: null,
      });
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

  const isSpotDisabled = (spot) => {
    if (spot.isOccupied && spot.userId !== currentUser.id) {
      return true;
    }
    if (spot.type === 'handicap' && !currentUser.hasHandicapPlacard) {
      return true;
    }
    if (spot.type === 'ev' && !currentUser.hasEv) {
      return true;
    }
    return false;
  };

  const getSpotIcon = (spot) => {
    if (spot.id === (parkedLocation ? parkedLocation.id : null)) {
      return <DirectionsCarIcon />;
    }
    if (spot.type === 'handicap') {
      return <AccessibleIcon />;
    }
    if (spot.type === 'ev') {
      return <ElectricCarIcon />;
    }
    return <LocalParkingIcon />;
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
        <Tooltip key={spot.id} title={`${spot.spotNumber} - ${spot.isOccupied ? 'Occupied' : 'Available'}`}>
          <span>
            <Button
              onClick={() => (parkedLocation && spot.id === parkedLocation.id) ? handleLeave() : handlePark(spot.id)}
              disabled={parkedLocation ? (spot.id !== parkedLocation.id) : isSpotDisabled(spot)}
              variant="contained"
              color={spot.isOccupied ? "secondary" : "primary"}
            >
              {getSpotIcon(spot)}
            </Button>
          </span>
        </Tooltip>
      ))}

      {notification && <p>{notification}</p>}
      <AlertModal
        open={alert.visible}
        onClose={hideAlert}
        message={alert.message}
      />
    </div>
  );
};

export default UserDashboard;
