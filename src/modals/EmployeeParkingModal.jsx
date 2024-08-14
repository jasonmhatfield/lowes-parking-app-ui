import React from 'react';
import { Modal, Button } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import styled from 'styled-components';

const EmployeeParkingModal = ({
                                open,
                                userParkingSpotId,
                                parkingSpots,
                                handleParking,
                              }) => {
  const getFloorAndSpot = (spotId) => {
    const spotIdString = spotId.toString();
    const floor = spotIdString.charAt(0);
    let spotNumber = parseInt(spotIdString.slice(-2), 10);

    return {
      floor,
      spotNumber,
    };
  };

  const spotInfo = userParkingSpotId ? getFloorAndSpot(userParkingSpotId) : {};

  return (
    <StyledModal
      open={open}
      onClose={null} // Disable onClose functionality
      aria-labelledby="parked-modal-title"
      aria-describedby="parked-modal-description"
      disableEscapeKeyDown // Disable closing via the escape key
      disableBackdropClick // Disable closing via clicking on the backdrop
    >
      <ModalContent>
        <ModalHeader>
          <CarIcon />
          <div>
            <FloorDisplay data-testid="floor-display">Floor {spotInfo.floor}</FloorDisplay>
            <SpotDisplay data-testid="spot-display">Spot {spotInfo.spotNumber}</SpotDisplay>
          </div>
        </ModalHeader>
        <LeaveButton
          variant="contained"
          className="parking-button green"
          onClick={() => handleParking(parkingSpots.find(spot => spot.id === userParkingSpotId))}
          data-testid="leave-button"
        >
          Leave Spot
        </LeaveButton>
      </ModalContent>
    </StyledModal>
  );
};

// Styled Components for improved styling
const StyledModal = styled(Modal)`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const ModalContent = styled.div`
    background-color: #ffffff;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    text-align: center;
    max-width: 400px;
    width: 90%;
    position: relative;

    @media (max-width: 768px) {
        width: 100%;
        height: 100%;
        border-radius: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
`;

const ModalHeader = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
`;

const CarIcon = styled(DirectionsCarIcon)`
    font-size: 4rem;
    color: #0072ce;
    margin-bottom: 10px;
`;

const FloorDisplay = styled.div`
    font-size: 1.5rem;
    font-weight: bold;
    color: #00509e;
`;

const SpotDisplay = styled.div`
    font-size: 1.2rem;
    color: #333333;
`;

const LeaveButton = styled(Button)`
    background-color: #28a745 !important;
    color: #ffffff !important;
    padding: 10px 20px !important;
    font-size: 1rem !important;
    margin-top: 20px !important;

    &:hover {
        background-color: #218838 !important;
    }
`;

export default EmployeeParkingModal;
