import React from 'react';
import styled from 'styled-components';
import LowesLogo from '../assets/lowes-logo.png';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';

const EmployeeDashboardDesktop = ({ user, parkingSpots, gates, selectedFloor, handleFloorChange, handleParking, getButtonClass, getIconForSpot, handleLogout }) => {
  const userParkingSpotId = user?.parkingSpotId;

  // Separate odd and even numbered spots
  const oddSpots = parkingSpots.filter(spot => parseInt(spot.spotNumber) % 2 !== 0 && spot.spotNumber.startsWith(selectedFloor));
  const evenSpots = parkingSpots.filter(spot => parseInt(spot.spotNumber) % 2 === 0 && spot.spotNumber.startsWith(selectedFloor));

  return (
    <DashboardContainer data-testid="employee-dashboard-desktop">
      <Header>
        <Logo src={LowesLogo} alt="Lowe's Logo" data-testid="lowes-logo" />
        {user && <WelcomeMessage data-testid="welcome-message">Welcome, {user.firstName}</WelcomeMessage>}
      </Header>

      <MainContent>
        <FloorSelectContainer>
          <FloorSelectLabel>Select Floor</FloorSelectLabel>
          <FloorSelect value={selectedFloor} onChange={handleFloorChange} data-testid="floor-select">
            <option value="1">Floor 1</option>
            <option value="2">Floor 2</option>
            <option value="3">Floor 3</option>
            <option value="4">Floor 4</option>
          </FloorSelect>
        </FloorSelectContainer>

        <ParkingGarage>
          <ParkingRow>
            {oddSpots
              .sort((a, b) => parseInt(a.spotNumber) - parseInt(b.spotNumber))
              .map(spot => (
                <ParkingButton
                  key={spot.id}
                  onClick={() => handleParking(spot)}
                  className={getButtonClass(spot)}
                  data-testid={`parking-button-${spot.spotNumber}`}
                >
                  {getIconForSpot(spot)}
                  <span>{spot.spotNumber}</span>
                </ParkingButton>
              ))}
          </ParkingRow>
          <ParkingRoad>
            <RoadLine />
          </ParkingRoad>
          <ParkingRow>
            {evenSpots
              .sort((a, b) => parseInt(a.spotNumber) - parseInt(b.spotNumber))
              .map(spot => (
                <ParkingButton
                  key={spot.id}
                  onClick={() => handleParking(spot)}
                  className={getButtonClass(spot)}
                  data-testid={`parking-button-${spot.spotNumber}`}
                >
                  {getIconForSpot(spot)}
                  <span>{spot.spotNumber}</span>
                </ParkingButton>
              ))}
          </ParkingRow>
        </ParkingGarage>

        <GateStatusContainer>
          {gates.map(gate => (
            <GateStatus key={gate.id} data-testid={`gate-status-${gate.id}`}>
              <GateIcon className={gate.operational ? 'gate-open' : 'gate-closed'}>
                {gate.operational ? <LockOpenIcon data-testid={`gate-icon-open-${gate.id}`} /> : <LockIcon data-testid={`gate-icon-closed-${gate.id}`} />}
              </GateIcon>
              <GateName>{gate.gateName} {gate.operational ? '(Open)' : '(Closed)'}</GateName>
            </GateStatus>
          ))}
        </GateStatusContainer>

        <LogoutButton onClick={handleLogout} data-testid="logout-button-desktop">Logout</LogoutButton>
      </MainContent>
    </DashboardContainer>
  );
};

const DashboardContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #f4f4f9;
    height: 100vh;
    max-width: 1000px;
    margin: 0 auto;
    overflow: hidden;
`;

const Header = styled.header`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin-bottom: 20px;
`;

const Logo = styled.img`
    width: 150px;
`;

const WelcomeMessage = styled.h1`
    font-size: 2rem;
    margin-top: 10px;
    text-align: center;
    color: #00509e;
`;

const MainContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    width: 100%;
`;

const FloorSelectContainer = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 20px;
`;

const FloorSelectLabel = styled.label`
    font-size: 1.2rem;
    margin-right: 10px;
    color: #00509e;
`;

const FloorSelect = styled.select`
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #cccccc;
    background-color: #ffffff;
    color: #00509e;
`;

const ParkingGarage = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 800px;
    margin-bottom: 20px;
`;

const ParkingRow = styled.div`
    display: flex;
    justify-content: space-around;
    width: 100%;
    margin-bottom: 10px;
    gap: 10px;
`;

const ParkingRoad = styled.div`
    width: 100%;
    height: 60px;
    background-color: #2c3e50;
    border-radius: 10px;
    position: relative;
    margin-bottom: 10px;
`;

const RoadLine = styled.div`
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background-color: #ffffff;
    transform: translateY(-50%);
`;

const ParkingButton = styled.button`
    position: relative;
    width: 80px;
    height: 100px;
    background-color: #0072ce;
    color: #ffffff;
    border: none;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s ease, transform 0.3s ease;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    cursor: pointer;

    &.green {
        background-color: #28a745;
    }

    &.grey {
        background-color: #6c757d;
        cursor: not-allowed;
    }

    &.blue {
        background-color: #0072ce;
    }

    &:hover {
        transform: translateY(-2px);
    }

    &:disabled {
        cursor: not-allowed;
    }

    span {
        margin-top: 5px;
        font-size: 12px;
    }

    svg {
        font-size: 2rem;
    }
`;

const GateStatusContainer = styled.div`
    display: flex;
    justify-content: space-around;
    width: 100%;
    max-width: 600px;
    margin-top: 20px;
`;

const GateStatus = styled.div`
    display: flex;
    align-items: center;
    background-color: #f4f4f9;
    padding: 10px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    margin: 0 5px;
`;

const GateIcon = styled.div`
    margin-right: 10px;
    font-size: 2rem;
    &.gate-open {
        color: #28a745;
    }
    &.gate-closed {
        color: #dc3545;
    }
`;

const GateName = styled.span`
    font-size: 1.2rem;
    color: #00509e;
`;

const LogoutButton = styled.button`
    background-color: #ff6b6b;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease;
    margin-top: 20px;

    &:hover {
        background-color: #e04040;
        transform: translateY(-2px);
    }
`;

export default EmployeeDashboardDesktop;
