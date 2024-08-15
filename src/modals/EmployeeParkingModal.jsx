import React from 'react';
import '../styles/modals/EmployeeParkingModal.css';

const EmployeeParkingModal = ({ open, userParkingSpotId, parkingSpots, handleParking }) => {
  if (!open) return null;

  const userSpot = parkingSpots.find((spot) => spot.id === userParkingSpotId);

  return (
    <div className="modal-container">
      <div className="modal-content">
        <h2 className="modal-title">Parking Spot Details</h2>
        <p data-testid="spot-display">
          {userSpot
            ? `You are currently parked in spot ${userSpot.number}.`
            : 'You do not have a reserved parking spot.'}
        </p>
        {userSpot && (
          <button
            className="modal-button"
            data-testid="leave-button"
            onClick={() => handleParking(userSpot)}
          >
            Leave Spot
          </button>
        )}
      </div>
    </div>
  );
};

export default EmployeeParkingModal;
