import React from 'react';
import styled from 'styled-components';

const EmployeeParkingModal = ({ open, userParkingSpotId, parkingSpots, handleParking }) => {
  if (!open) return null;

  const userSpot = parkingSpots.find((spot) => spot.id === userParkingSpotId);

  return (
    <ModalContainer>
      <ModalContent>
        <ModalTitle>Parking Spot Details</ModalTitle>
        <p data-testid="spot-display">
          {userSpot
            ? `You are currently parked in spot ${userSpot.number}.`
            : 'You do not have a reserved parking spot.'}
        </p>
        {userSpot && (
          <ModalButton
            data-testid="leave-button"
            onClick={() => handleParking(userSpot)}
          >
            Leave Spot
          </ModalButton>
        )}
      </ModalContent>
    </ModalContainer>
  );
};

const ModalContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
`;

const ModalContent = styled.div`
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    text-align: center;
`;

const ModalTitle = styled.h2`
    margin-bottom: 20px;
    font-size: 1.5rem;
    color: #00509e;
`;

const ModalButton = styled.button`
    background-color: #0072ce;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease;

    &:hover {
        background-color: #00509e;
        transform: translateY(-2px);
    }
`;

export default EmployeeParkingModal;
