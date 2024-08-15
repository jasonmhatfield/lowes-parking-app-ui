import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EvStationIcon from '@mui/icons-material/EvStation';
import AccessibleIcon from '@mui/icons-material/Accessible';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import EmployeeParkingModal from '../modals/EmployeeParkingModal';
import '../styles/components/EmployeeDashboard.css';
import LowesLogo from '../assets/lowes-logo.png';

const EmployeeDashboard = () => {
  const [parkingSpots, setParkingSpots] = useState([]);
  const [gates, setGates] = useState([]);
  const [user, setUser] = useState(null);
  const [userParkingSpotId, setUserParkingSpotId] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState('1');
  const [parkingModalOpen, setParkingModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const [parkingSpotsResponse, gatesResponse] = await Promise.all([
        fetch('http://localhost:8080/api/parkingSpots'),
        fetch('http://localhost:8080/api/gates'),
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
        } else {
          setUserParkingSpotId(null);
          setParkingModalOpen(false);
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
    const pollInterval = setInterval(fetchData, 5000);

    return () => clearInterval(pollInterval);
  }, [fetchData, navigate]);

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

      if (!response.ok) {
        console.error('Failed to update parking spot.');
        return;
      }

      setParkingSpots(prevSpots =>
        prevSpots.map(s => (s.id === spot.id ? { ...s, ...updates } : s))
      );
      setUserParkingSpotId(isLeaving ? null : spot.id);
      setParkingModalOpen(!isLeaving);
    } catch (error) {
      console.error('Failed to update parking spot.');
    }
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

  const canParkInSpot = (spot) => {
    if (spot.occupied && spot.id !== userParkingSpotId) return false;
    if (spot.type === 'regular') return true;
    if (spot.type === 'handicap' && user?.hasHandicapPlacard) return true;
    return spot.type === 'ev' && user?.hasEv;
  };

  const filteredParkingSpots = (even) =>
    parkingSpots
      .filter(
        (spot) =>
          (parseInt(spot.spotNumber) % 2 === (even ? 0 : 1)) &&
          spot.spotNumber.startsWith(selectedFloor)
      )
      .sort((a, b) => parseInt(a.spotNumber) - parseInt(b.spotNumber));

  return (
    <div className="DashboardContainer">
      <header className="Header">
        <img src={LowesLogo} alt="Lowe's Logo" className="Logo" />
        {user && <h1 className="WelcomeMessage">Welcome, {user.firstName}</h1>}
      </header>

      <div className="MainContent">
        <div className="FloorSelectContainer">
          <label htmlFor="floorSelect" className="FloorSelectLabel">Select Floor</label>
          <select
            id="floorSelect"
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="FloorSelect"
          >
            {[1, 2, 3, 4].map(floor => (
              <option key={floor} value={floor.toString()}>Floor {floor}</option>
            ))}
          </select>
        </div>

        <div className="ParkingGarage">
          <div className="ParkingRow">
            {filteredParkingSpots(false).map((spot) => (
              <button
                key={spot.id}
                onClick={() => canParkInSpot(spot) && handleParking(spot)}
                className={`ParkingButton ${spot.id === userParkingSpotId ? 'green' : canParkInSpot(spot) ? 'blue' : 'grey'}`}
                aria-label={`Parking spot ${spot.spotNumber}`}
              >
                {getIconForSpot(spot)}
                <span>{spot.spotNumber}</span>
              </button>
            ))}
          </div>

          <div className="ParkingRoad">
            <div className="RoadLine" />
          </div>

          <div className="ParkingRow">
            {filteredParkingSpots(true).map((spot) => (
              <button
                key={spot.id}
                onClick={() => canParkInSpot(spot) && handleParking(spot)}
                className={`ParkingButton ${spot.id === userParkingSpotId ? 'green' : canParkInSpot(spot) ? 'blue' : 'grey'}`}
                aria-label={`Parking spot ${spot.spotNumber}`}
              >
                {getIconForSpot(spot)}
                <span>{spot.spotNumber}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="GateStatusContainer">
          {gates.map((gate) => (
            <div key={gate.id} className="GateStatus">
              <div className={`GateIcon ${gate.operational ? 'gate-open' : 'gate-closed'}`}>
                <DirectionsCarIcon />
              </div>
              <span className="GateName">
                {gate.gateName} {gate.operational ? '(Open)' : '(Closed)'}
              </span>
            </div>
          ))}
        </div>

        <button onClick={handleLogout} className="LogoutButton">Logout</button>
      </div>

      {parkingModalOpen && (
        <EmployeeParkingModal
          open={parkingModalOpen}
          userParkingSpotId={userParkingSpotId}
          parkingSpots={parkingSpots}
          handleParking={handleParking}
        />
      )}
    </div>
  );
};

export default EmployeeDashboard;
