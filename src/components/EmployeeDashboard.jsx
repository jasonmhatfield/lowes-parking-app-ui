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
  const [parkingSpots, setParkingSpots] = useState([]); // State for parking spots data
  const [gates, setGates] = useState([]); // State for gates data
  const [user, setUser] = useState(null); // State for the logged-in user
  const [userParkingSpotId, setUserParkingSpotId] = useState(null); // State for the user's parking spot ID
  const [selectedFloor, setSelectedFloor] = useState('1'); // State for the selected floor
  const [parkingModalOpen, setParkingModalOpen] = useState(false); // State to control EmployeeParkingModal visibility
  const [isMobile, setIsMobile] = useState(() => sessionStorage.getItem('viewMode') === 'mobile'); // State to track if view is mobile
  const navigate = useNavigate(); // Hook to navigate between routes

  const fetchData = useCallback(async () => {
    try {
      const [parkingSpotsResponse, gatesResponse] = await Promise.all([
        fetch('http://localhost:8080/api/parkingSpots'),
        fetch('http://localhost:8080/api/gates'),
      ]);
      const parkingSpotsData = await parkingSpotsResponse.json();
      const gatesData = await gatesResponse.json();

      setParkingSpots(parkingSpotsData); // Set parking spots data
      setGates(gatesData); // Set gates data

      const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
      if (loggedInUser) {
        const userSpot = parkingSpotsData.find(spot => spot.userId === loggedInUser.id);
        if (userSpot) {
          setUserParkingSpotId(userSpot.id); // Set user's parking spot ID if occupied
          setParkingModalOpen(true); // Open parking modal if user has a spot
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
      navigate('/'); // Redirect to home if no user is logged in
      return;
    }
    setUser(loggedInUser); // Set logged-in user

    // Ensure the component uses the correct view mode on mount
    const savedViewMode = sessionStorage.getItem('viewMode');
    setIsMobile(savedViewMode === 'mobile');

    fetchData();
    const pollInterval = setInterval(fetchData, 5000); // Poll data every 5 seconds

    return () => clearInterval(pollInterval); // Clean up interval on unmount
  }, [fetchData, navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('loggedInUser'); // Remove user data from session storage
    navigate('/'); // Redirect to home page
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
      ); // Update the parking spot in state
      setUserParkingSpotId(isLeaving ? null : spot.id); // Update user's parking spot ID
      setParkingModalOpen(!isLeaving); // Toggle parking modal visibility
    } catch (error) {
      console.error('Failed to update parking spot.');
    }
  };

  const getIconForSpot = (spot) => {
    if (spot.occupied) return <DirectionsCarIcon />; // Show car icon if spot is occupied
    switch (spot.type) {
      case 'ev':
        return <EvStationIcon />; // Show EV station icon for EV spots
      case 'handicap':
        return <AccessibleIcon />; // Show handicap icon for handicap spots
      default:
        return <LocalParkingIcon />; // Default parking icon for regular spots
    }
  };

  const canParkInSpot = (spot) => {
    if (spot.occupied && spot.id !== userParkingSpotId) return false; // Prevent parking in occupied spots (except user's)
    if (spot.type === 'regular') return true;
    if (spot.type === 'handicap' && user?.hasHandicapPlacard) return true; // Allow parking in handicap spots if user has placard
    return spot.type === 'ev' && user?.hasEv; // Allow parking in EV spots if user has EV
  };

  const filteredParkingSpots = () =>
    parkingSpots
      .filter((spot) => spot.spotNumber.startsWith(selectedFloor))
      .sort((a, b) => parseInt(a.spotNumber) - parseInt(b.spotNumber)); // Filter and sort parking spots by floor

  const availableParkingSpots = filteredParkingSpots().filter(spot => !spot.occupied && canParkInSpot(spot)); // Filter available spots

  const toggleViewMode = () => {
    const newMode = !isMobile;
    setIsMobile(newMode); // Toggle between mobile and desktop views
    sessionStorage.setItem('viewMode', newMode ? 'mobile' : 'desktop'); // Save the new view mode
  };

  return (
    <div className={`DashboardContainer ${isMobile ? 'mobile' : ''}`}>
      <button className="ViewToggle" data-testid="view-toggle" onClick={toggleViewMode}>
        {isMobile ? <FaDesktop /> : <FaMobileAlt />}
      </button>
      <div className="ContentWrapper">
        <header className="Header">
          <img src={LowesLogo} alt="Lowe's Logo" className="Logo" />
          {user && <h1 className="WelcomeMessage">Welcome, {user.firstName}</h1>} {/* Greet the user */}
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
            <button onClick={handleLogout} className="LogoutButton">Logout</button> {/* Handle user logout */}
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
