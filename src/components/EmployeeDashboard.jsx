import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EvStationIcon from '@mui/icons-material/EvStation';
import AccessibleIcon from '@mui/icons-material/Accessible';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import { Button } from '@mui/material';

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
    if (spot.occupied) return false;
    if (spot.type === 'regular') return true;
    if (spot.type === 'handicap' && user?.hasHandicapPlacard) return true;
    if (spot.type === 'ev' && user?.hasEv) return true;
    return false;
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

  const getButtonStyle = (spot) => {
    const greyColor = '#616161';  // Unified grey color for occupied and unavailable spots
    const greyBorder = '#424242';

    if (spot.id === userParkingSpotId) {
      return {
        backgroundColor: '#4CAF50', // Green for user's parked spot
        border: '2px solid #388E3C',
      };
    }

    if (spot.occupied || userParkingSpotId !== null || !canParkInSpot(spot)) {
      return {
        backgroundColor: greyColor, // Grey for all occupied or unavailable spots
        border: `2px solid ${greyBorder}`,
      };
    }

    return {
      backgroundColor: '#1976D2', // Blue for available spots
      border: '2px solid #0D47A1',
    };
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      {user && <h1>Welcome, {user.firstName}</h1>}
      <Button variant="contained" onClick={handleLogout} style={{ marginBottom: '20px' }}>
        Logout
      </Button>

      <h2>Gates</h2>
      {gates.map(gate => (
        <div key={gate.id} style={{ margin: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ marginRight: '10px' }}>Gate: {gate.gateName}</span>
          <span style={{ marginRight: '10px' }}>Status: {gate.operational ? 'Open' : 'Closed'}</span>
        </div>
      ))}

      <h2>Parking Spaces</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {parkingSpots.map(spot => (
          <Button
            key={spot.id}
            onClick={() => handleParking(spot)}
            disabled={!canParkInSpot(spot) || (userParkingSpotId !== null && spot.id !== userParkingSpotId)} // Disable if user can't park or is already parked
            style={{
              margin: '10px',
              padding: '20px',
              borderRadius: '10px',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              ...getButtonStyle(spot),
            }}
          >
            {getIconForSpot(spot)}
            <span style={{ marginTop: '5px' }}>{spot.spotNumber}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
