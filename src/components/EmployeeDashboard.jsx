import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EvStationIcon from '@mui/icons-material/EvStation';
import AccessibleIcon from '@mui/icons-material/Accessible';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import { Button, Modal } from '@mui/material';
import '../styles/EmployeeDashboard.css';

const EmployeeDashboard = () => {
  const [parkingSpots, setParkingSpots] = useState([]);
  const [gates, setGates] = useState([]);
  const [user, setUser] = useState(null);
  const [userParkingSpotId, setUserParkingSpotId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [parkingModalOpen, setParkingModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    setUser(loggedInUser);

    const fetchInitialData = async () => {
      try {
        const [parkingSpotsResponse, gatesResponse] = await Promise.all([
          axios.get('http://localhost:8080/api/parkingSpots'),
          axios.get('http://localhost:8080/api/gates')
        ]);

        setParkingSpots(parkingSpotsResponse.data);
        setGates(gatesResponse.data);

        if (loggedInUser) {
          const userSpot = parkingSpotsResponse.data.find(spot => spot.userId === loggedInUser.id);
          if (userSpot) {
            setUserParkingSpotId(userSpot.id);
            setParkingModalOpen(true); // Open modal if user is parked
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchInitialData();

    // Initialize WebSocket connection
    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = Stomp.over(socket);

    const connectWebSocket = () => {
      stompClient.connect({}, (frame) => {
        console.log('Connected: ' + frame);

        // Subscribe to gate updates
        stompClient.subscribe('/topic/gates', (message) => {
          const updatedGate = JSON.parse(message.body);
          console.log("Received gate update:", updatedGate);
          setGates((prevGates) =>
            prevGates.map((gate) =>
              gate.id === updatedGate.id ? updatedGate : gate
            )
          );
        });

        // Subscribe to parking spot updates
        stompClient.subscribe('/topic/parkingSpots', (message) => {
          const updatedSpot = JSON.parse(message.body);
          console.log("Received parking spot update:", updatedSpot);
          setParkingSpots((prevSpots) =>
            prevSpots.map((spot) =>
              spot.id === updatedSpot.id ? updatedSpot : spot
            )
          );
        });

        // Subscribe to notifications
        stompClient.subscribe('/topic/notifications', (message) => {
          console.log("Received notification:", message.body);
          setNotifications((prev) => [...prev, message.body]);
          setNotificationModalOpen(true); // Show notification modal
        });
      });

      stompClient.debug = () => {}; // Disable STOMP debugging in production
    };

    connectWebSocket();

    socket.onclose = () => {
      console.log('WebSocket disconnected. Attempting to reconnect...');
      setTimeout(connectWebSocket, 5000);
    };

    return () => {
      stompClient.disconnect(() => {
        console.log('WebSocket disconnected cleanly.');
      });
    };
  }, []);

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
      const response = await axios.patch(`http://localhost:8080/api/parkingSpots/${spot.id}`, updates);

      if (response.status === 200) {
        const updatedSpot = response.data;
        setParkingSpots((prevSpots) =>
          prevSpots.map((s) => (s.id === updatedSpot.id ? updatedSpot : s))
        );
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
    if (spot.occupied || userParkingSpotId !== null || !canParkInSpot(spot))
      return 'parking-button grey';
    return 'parking-button blue';
  };

  return (
    <div className="container">
      {user && <h1 className="welcome-message">Welcome, {user.firstName}</h1>}
      <Button variant="contained" onClick={handleLogout} className="logout-button">
        Logout
      </Button>

      <h2>Gates</h2>
      {gates.map(gate => (
        <div key={gate.id} className="gate-status">
          <div className={`gate-icon ${gate.operational ? 'gate-open' : 'gate-closed'}`}>
            {gate.operational ? 'Open' : 'Closed'}
          </div>
          <span>{gate.gateName}</span>
        </div>
      ))}

      <h2>Parking Spaces</h2>
      <div className="parking-spaces">
        {parkingSpots.map(spot => (
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
