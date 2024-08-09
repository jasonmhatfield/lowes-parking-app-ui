import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EvStationIcon from '@mui/icons-material/EvStation';
import AccessibleIcon from '@mui/icons-material/Accessible';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import { Button } from '@mui/material';
import '../styles/EmployeeDashboard.css';

const EmployeeDashboard = () => {
  const [parkingSpots, setParkingSpots] = useState([]);
  const [gates, setGates] = useState([]);
  const [user, setUser] = useState(null);
  const [userParkingSpotId, setUserParkingSpotId] = useState(null);
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
          if (userSpot) setUserParkingSpotId(userSpot.id);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
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
      const response = await fetch(`http://localhost:8080/api/parkingSpots/${spot.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedSpot = await response.json();
        setParkingSpots(parkingSpots.map(s => s.id === updatedSpot.id ? updatedSpot : s));
        setUserParkingSpotId(isLeaving ? null : spot.id);
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
    if (spot.occupied) return <DirectionsCarIcon />; // Show car icon for all occupied spots, including the user's
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

  return (
    <div className="employee-dashboard">
      {user && <h1 className="welcome-message">Welcome, {user.firstName}</h1>}
      <Button variant="contained" onClick={handleLogout} className="logout-button">
        Logout
      </Button>

      <h2>Gates</h2>
      {gates.map(gate => (
        <div key={gate.id} className="gate-status">
          <span>Gate: {gate.gateName}</span>
          <span>Status: {gate.operational ? 'Open' : 'Closed'}</span>
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
    </div>
  );
};

export default EmployeeDashboard;
