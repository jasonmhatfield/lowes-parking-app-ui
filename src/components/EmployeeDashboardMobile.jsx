import React from 'react';
import styled from 'styled-components';
import LowesLogo from '../assets/lowes-logo.png';

const EmployeeDashboardMobile = ({ user, parkingSpots, selectedFloor, handleFloorChange, handleParking, getIconForSpot, handleLogout }) => {
  const availableSpots = parkingSpots.filter(
    spot => spot.spotNumber.startsWith(selectedFloor) && !spot.occupied
  );

  return (
    <DashboardContainer data-testid="employee-dashboard-mobile">
      <Logo src={LowesLogo} alt="Lowe's Logo" data-testid="lowes-logo-mobile" />
      {user && <WelcomeMessage data-testid="welcome-message-mobile">Welcome, {user.firstName}</WelcomeMessage>}

      <FloorSelectContainer>
        <FloorSelectLabel>Select Floor</FloorSelectLabel>
        <FloorSelect value={selectedFloor} onChange={handleFloorChange} data-testid="floor-select-mobile">
          <option value="1">Floor 1</option>
          <option value="2">Floor 2</option>
          <option value="3">Floor 3</option>
          <option value="4">Floor 4</option>
        </FloorSelect>
      </FloorSelectContainer>

      <AvailableSpotsList>
        {availableSpots.length > 0 ? (
          availableSpots.map(spot => (
            <AvailableSpotItem key={spot.id} onClick={() => handleParking(spot)} data-testid={`parking-spot-${spot.spotNumber}`}>
              {getIconForSpot(spot)}
              <SpotNumber>{spot.spotNumber}</SpotNumber>
            </AvailableSpotItem>
          ))
        ) : (
          <NoSpotsMessage data-testid="no-spots-message">No available spots on this floor.</NoSpotsMessage>
        )}
      </AvailableSpotsList>

      <LogoutButton onClick={handleLogout} data-testid="logout-button-mobile">Logout</LogoutButton>
    </DashboardContainer>
  );
};

const DashboardContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    background-color: #f4f4f9;
    height: 100vh;
    color: #00509e;
    max-width: 95%;
    margin: 0 auto;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
`;

const Logo = styled.img`
    width: 150px;
    margin-bottom: 20px;
`;

const WelcomeMessage = styled.h1`
    font-size: 1.5rem;
    margin-bottom: 20px;
    text-align: center;
`;

const FloorSelectContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
    position: sticky;
    top: 0;
    background-color: #f4f4f9;
    width: 100%;
    z-index: 10;
`;

const FloorSelectLabel = styled.label`
    font-size: 1.2rem;
    margin-bottom: 10px;
`;

const FloorSelect = styled.select`
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #cccccc;
    background-color: #ffffff;
    color: #00509e;
`;

const AvailableSpotsList = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    overflow-y: auto;
    margin-bottom: 20px;
    flex-grow: 1;
`;

const AvailableSpotItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #0072ce;
    color: #ffffff;
    padding: 15px;
    border-radius: 10px;
    width: 100%;
    max-width: 400px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease;

    &:hover {
        background-color: #00509e;
        transform: translateY(-2px);
    }

    svg {
        font-size: 1.5rem;
    }
`;

const SpotNumber = styled.span`
    font-size: 1.2rem;
`;

const NoSpotsMessage = styled.div`
    font-size: 1.2rem;
    color: #dc3545;
`;

const LogoutButton = styled.button`
    background-color: #ff4757;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease;
    margin-top: auto;
    position: sticky;
    bottom: 0;
    width: 100%;
    max-width: 400px;

    &:hover {
        background-color: #e04040;
        transform: translateY(-2px);
    }
`;

export default EmployeeDashboardMobile;
