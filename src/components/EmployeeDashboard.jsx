import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import EmployeeDashboardDesktop from './EmployeeDashboardDesktop';
import EmployeeDashboardMobile from './EmployeeDashboardMobile';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EvStationIcon from '@mui/icons-material/EvStation';
import AccessibleIcon from '@mui/icons-material/Accessible';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import EmployeeParkingModal from '../modals/EmployeeParkingModal';

const EmployeeDashboard = () => {
  const [parkingSpots, setParkingSpots] = useState([]);
  const [gates, setGates] = useState([]);
  const [user, setUser] = useState(null);
  const [userParkingSpotId, setUserParkingSpotId] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState('1');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [parkingModalOpen, setParkingModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const [parkingSpotsResponse, gatesResponse] = await Promise.all([
        fetch('http://localhost:8080/api/parkingSpots'),
        fetch('http://localhost:8080/api/gates')
      ]);
      const parkingSpotsData = await parkingSpotsResponse.json();
      const gatesData = await gatesResponse.json();

      setParkingSpots(parkingSpotsData);
      setGates(gatesData);

      const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
      if (loggedInUser) {
        const userSpot = parkingSpotsData.find(spot => spot.userId === loggedInUser.id);
        if (userSpot) {
          setUserParkingSpotId(userSpot.id);
          setParkingModalOpen(true);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  useEffect(() => {
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
      navigate('/');
      return;
    }
    setUser(loggedInUser);
    fetchData();

    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
      stompClient.subscribe('/topic/gates', (message) => {
        const updatedGate = JSON.parse(message.body);
        setGates(prevGates => prevGates.map(gate => gate.id === updatedGate.id ? updatedGate : gate));
      });

      stompClient.subscribe('/topic/parkingSpots', (message) => {
        const updatedSpot = JSON.parse(message.body);
        setParkingSpots(prevSpots =>
          prevSpots.map(spot => spot.id === updatedSpot.id ? updatedSpot : spot)
        );
        if (updatedSpot.userId !== user.id && userParkingSpotId === updatedSpot.id) {
          setUserParkingSpotId(null);
          setParkingModalOpen(false);
        }
      });
    });

    return () => {
      stompClient.disconnect();
    };
  }, [fetchData, navigate, userParkingSpotId]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('loggedInUser');
    navigate('/');
  };

  const handleParking = async (spot) => {
    const isLeaving = spot.id === userParkingSpotId;
    const updates = { occupied: !isLeaving, userId: isLeaving ? null : user.id };

    try {
      const response = await fetch(`http://localhost:8080/api/parkingSpots/${spot.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedSpot = await response.json();
        setParkingSpots(prevSpots => prevSpots.map(s => s.id === updatedSpot.id ? updatedSpot : s));
        setUserParkingSpotId(isLeaving ? null : spot.id);
        setParkingModalOpen(!isLeaving);
      } else {
        console.error('Failed to update parking spot.');
      }
    } catch (error) {
      console.error('Error updating parking spot:', error);
    }
  };

  const getIconForSpot = (spot) => {
    if (spot.occupied) return <DirectionsCarIcon />;
    switch (spot.type) {
      case 'ev': return <EvStationIcon />;
      case 'handicap': return <AccessibleIcon />;
      default: return <LocalParkingIcon />;
    }
  };

  const getButtonClass = (spot) => {
    if (spot.id === userParkingSpotId) return 'green';
    if (spot.occupied || userParkingSpotId !== null || !canParkInSpot(spot)) return 'grey';
    return 'blue';
  };

  const canParkInSpot = (spot) => {
    if (spot.occupied && spot.id !== userParkingSpotId) return false;
    if (spot.type === 'regular') return true;
    if (spot.type === 'handicap' && user?.hasHandicapPlacard) return true;
    return spot.type === 'ev' && user?.hasEv;
  };

  const handleFloorChange = (event) => setSelectedFloor(event.target.value);

  return (
    <>
      {isMobile ? (
        <EmployeeDashboardMobile
          user={user}
          parkingSpots={parkingSpots}
          selectedFloor={selectedFloor}
          handleFloorChange={handleFloorChange}
          handleParking={handleParking}
          getIconForSpot={getIconForSpot}
          handleLogout={handleLogout}
          data-testid="employee-dashboard-mobile"
        />
      ) : (
        <EmployeeDashboardDesktop
          user={user}
          parkingSpots={parkingSpots}
          gates={gates}
          selectedFloor={selectedFloor}
          handleFloorChange={handleFloorChange}
          handleParking={handleParking}
          getButtonClass={getButtonClass}
          getIconForSpot={getIconForSpot}
          handleLogout={handleLogout}
          data-testid="employee-dashboard-desktop"
        />
      )}

      <EmployeeParkingModal
        open={parkingModalOpen}
        userParkingSpotId={userParkingSpotId}
        parkingSpots={parkingSpots}
        handleParking={handleParking}
        data-testid="employee-parking-modal"
      />
    </>
  );
};

export default EmployeeDashboard;
