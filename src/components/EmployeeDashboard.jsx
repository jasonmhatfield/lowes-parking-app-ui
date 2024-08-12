import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EvStationIcon from '@mui/icons-material/EvStation';
import AccessibleIcon from '@mui/icons-material/Accessible';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import { Button, Modal, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import '../styles/EmployeeDashboard.css';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const EmployeeDashboard = () => {
  const [parkingSpots, setParkingSpots] = useState([]);
  const [gates, setGates] = useState([]);
  const [user, setUser] = useState(null);
  const [userParkingSpotId, setUserParkingSpotId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [parkingModalOpen, setParkingModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState('1');
  const [availableSpotsCount, setAvailableSpotsCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    setUser(loggedInUser);

    const fetchData = async () => {
      try {
        const [parkingSpotsResponse, gatesResponse] = await Promise.all([
          fetch('http://localhost:8080/api/parkingSpots'),
          fetch('http://localhost:8080/api/gates')
        ]);

        const parkingSpotsData = await parkingSpotsResponse.json();
        const gatesData = await gatesResponse.json();

        setParkingSpots(parkingSpotsData);
        setGates(gatesData);

        if (loggedInUser) {
          const userSpot = parkingSpotsData.find(spot => spot.userId === loggedInUser.id);
          if (userSpot) {
            setUserParkingSpotId(userSpot.id);
            setParkingModalOpen(true); // Open modal if user is parked
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
      stompClient.subscribe('/topic/notifications', (message) => {
        setNotifications(prev => [...prev, message.body]);
        setNotificationModalOpen(true); // Show notification modal
      });

      // Listen for gate status changes
      stompClient.subscribe('/topic/gates', (message) => {
        const updatedGate = JSON.parse(message.body);
        setGates(prevGates => prevGates.map(gate => gate.id === updatedGate.id ? updatedGate : gate));
      });

      stompClient.subscribe('/topic/parkingSpots', (message) => {
        const updatedSpot = JSON.parse(message.body);
        setParkingSpots(prevSpots => prevSpots.map(spot => spot.id === updatedSpot.id ? updatedSpot : spot));
      });
    });

    return () => {
      if (stompClient) stompClient.disconnect();
    };
  }, []);

  useEffect(() => {
    const availableSpots = parkingSpots.filter(
      (spot) =>
        spot.spotNumber.startsWith(selectedFloor) &&
        !spot.occupied &&
        canParkInSpot(spot)
    ).length;
    setAvailableSpotsCount(availableSpots);
  }, [parkingSpots, selectedFloor]);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/');
  };

  const handleParking = async (spot) => {
    if (!user) return;

    const isLeaving = spot.id === userParkingSpotId;
    const updates = {
      isOccupied: !isLeaving,
      userId: isLeaving ? null : user.id
    };

    try {
      const response = await fetch(`http://localhost:8080/api/parkingSpots/${spot.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedSpot = await response.json();
        setParkingSpots(parkingSpots.map(s => s.id === updatedSpot.id ? updatedSpot : s));
        setUserParkingSpotId(isLeaving ? null : spot.id);
        setParkingModalOpen(!isLeaving);
      } else {
        console.error('Failed to update parking spot.');
      }
    } catch (error) {
      console.error('Error updating parking spot:', error);
    }
  };

  const canParkInSpot = (spot) => {
    if (spot.occupied && spot.id !== userParkingSpotId) return false;
    if (spot.type === 'regular') return true;
    if (spot.type === 'handicap' && user?.hasHandicapPlacard) return true;
    return spot.type === 'ev' && user?.hasEv;
  };

  const getIconForSpot = (spot) => {
    if (spot.occupied) return <DirectionsCarIcon />;
    switch (spot.type) {
      case 'ev':
        return <EvStationIcon />;
      case 'handicap':
        return <AccessibleIcon />;
      default:
        return <LocalParkingIcon />;
    }
  };

  const getButtonClass = (spot) => {
    if (spot.id === userParkingSpotId) return 'parking-button green';
    if (spot.occupied || userParkingSpotId !== null || !canParkInSpot(spot)) return 'parking-button grey';
    return 'parking-button blue';
  };

  const handleFloorChange = (event) => {
    setSelectedFloor(event.target.value);
  };

  return (
    <div className="container">
      {user && <h1 className="welcome-message">Welcome, {user.firstName}</h1>}
      <Button variant="contained" onClick={handleLogout} className="logout-button">
        Logout
      </Button>

      <div className="gate-status-container">
        {gates.map(gate => (
          <div key={gate.id} className="gate-status">
            <div className={`gate-icon ${gate.operational ? 'gate-open' : 'gate-closed'}`}>
              {gate.operational ? 'Open' : 'Closed'}
            </div>
            <span>{gate.gateName}</span>
          </div>
        ))}
      </div>

      <FormControl className="floor-select">
        <InputLabel>Floor</InputLabel>
        <Select value={selectedFloor} onChange={handleFloorChange}>
          <MenuItem value="1">Floor 1</MenuItem>
          <MenuItem value="2">Floor 2</MenuItem>
          <MenuItem value="3">Floor 3</MenuItem>
          <MenuItem value="4">Floor 4</MenuItem>
        </Select>
      </FormControl>

      <h2>Available Parking Spaces: {availableSpotsCount}</h2>

      <div className="parking-garage">
        <div className="parking-row left-row">
          {parkingSpots
            .filter(spot => spot.spotNumber.startsWith(selectedFloor) && parseInt(spot.spotNumber.slice(-1)) % 2 !== 0)
            .sort((a, b) => parseInt(a.spotNumber) - parseInt(b.spotNumber))
            .map(spot => (
              <Button
                key={spot.id}
                onClick={() => handleParking(spot)}
                disabled={spot.id !== userParkingSpotId && (!canParkInSpot(spot) || userParkingSpotId !== null)}
                className={getButtonClass(spot)}
              >
                {getIconForSpot(spot)}
                <span>{spot.spotNumber}</span>
              </Button>
            ))}
        </div>
        <div className="parking-road"></div>
        <div className="parking-row right-row">
          {parkingSpots
            .filter(spot => spot.spotNumber.startsWith(selectedFloor) && parseInt(spot.spotNumber.slice(-1)) % 2 === 0)
            .sort((a, b) => parseInt(a.spotNumber) - parseInt(b.spotNumber))
            .map(spot => (
              <Button
                key={spot.id}
                onClick={() => handleParking(spot)}
                disabled={spot.id !== userParkingSpotId && (!canParkInSpot(spot) || userParkingSpotId !== null)}
                className={getButtonClass(spot)}
              >
                {getIconForSpot(spot)}
                <span>{spot.spotNumber}</span>
              </Button>
            ))}
        </div>
      </div>

      <Modal
        open={parkingModalOpen}
        onClose={() => setParkingModalOpen(false)}
        aria-labelledby="parked-modal-title"
        aria-describedby="parked-modal-description"
      >
        <div className="parking-modal-content">
          <h2>You are parked at spot {userParkingSpotId}</h2>
          <Button variant="contained" onClick={() => handleParking(parkingSpots.find(spot => spot.id === userParkingSpotId))}>
            Leave Spot
          </Button>
        </div>
      </Modal>

      <Modal
        open={notificationModalOpen}
        onClose={() => setNotificationModalOpen(false)}
        aria-labelledby="notification-modal-title"
        aria-describedby="notification-modal-description"
      >
        <div className="notification-modal-content">
          <h2>New Notifications</h2>
          {notifications.map((note, index) => (
            <div key={index} className="notification">
              {note}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeDashboard;
