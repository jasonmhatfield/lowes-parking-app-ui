import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EvStationIcon from '@mui/icons-material/EvStation';
import AccessibleIcon from '@mui/icons-material/Accessible';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import { FaMobileAlt, FaDesktop } from 'react-icons/fa';
import EmployeeParkingModal from '../modals/EmployeeParkingModal';
import LowesLogo from '../assets/lowes-logo.png';
import '../styles/components/EmployeeDashboard.css';

const EmployeeDashboard = () => {
  const [parkingSpots, setParkingSpots] = useState([]);
  const [gates, setGates] = useState([]);
  const [user, setUser] = useState(null);
  const [userParkingSpotId, setUserParkingSpotId] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState('1');
  const [parkingModalOpen, setParkingModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    return sessionStorage.getItem('viewMode') === 'mobile';
  });
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

    // Ensure the component uses the correct view mode on mount
    const savedViewMode = sessionStorage.getItem('viewMode');
    setIsMobile(savedViewMode === 'mobile');

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

  const filteredParkingSpots = () =>
    parkingSpots
      .filter((spot) => spot.spotNumber.startsWith(selectedFloor))
      .sort((a, b) => parseInt(a.spotNumber) - parseInt(b.spotNumber));

  const availableParkingSpots = filteredParkingSpots().filter(spot => !spot.occupied && canParkInSpot(spot));

  const toggleViewMode = () => {
    const newMode = !isMobile;
    setIsMobile(newMode);
    sessionStorage.setItem('viewMode', newMode ? 'mobile' : 'desktop');
  };

  return (
    <div className={`DashboardContainer ${isMobile ? 'mobile' : ''}`}>
      <button className = "ViewToggle" data-testid = "view-toggle" onClick = {toggleViewMode}>
        {isMobile ? <FaDesktop/> : <FaMobileAlt/>}
      </button>
      <div className = "ContentWrapper">
        <header className = "Header">
        <img src={LowesLogo} alt="Lowe's Logo" className="Logo" />
          {user && <h1 className="WelcomeMessage">Welcome, {user.firstName}</h1>}
        </header>

        <main className="MainContent">
          <div className="FloorSelectContainer">
            <label htmlFor="floorSelect" className="FloorSelectLabel">Select Floor:</label>
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

          {isMobile ? (
            <div className="ParkingListContainer">
              {availableParkingSpots.length > 0 ? (
                <div className="ParkingList">

                  {availableParkingSpots.map((spot) => (
                    <button
                      key={spot.id}
                      onClick={() => handleParking(spot)}
                      className="ParkingSpot blue"
                    >
                      {getIconForSpot(spot)}
                      <span>Spot {spot.spotNumber}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="NoSpotsMessage">No available parking spots on this floor.</p>
              )}
            </div>
          ) : (
            <div className="ParkingGarage">
              <div className="ParkingRow">
                {filteredParkingSpots().filter((_, index) => index % 2 === 0).map((spot) => (
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
                {filteredParkingSpots().filter((_, index) => index % 2 !== 0).map((spot) => (
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
          )}

          <div className="BottomSection">
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
        </main>

        {parkingModalOpen && (
          <EmployeeParkingModal
            open={parkingModalOpen}
            userParkingSpotId={userParkingSpotId}
            parkingSpots={parkingSpots}
            handleParking={handleParking}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;