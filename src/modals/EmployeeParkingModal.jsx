import React from 'react';

const EmployeeParkingModal = ({ open, userParkingSpotId, parkingSpots, handleParking }) => {
  if (!open) return null;

  const userSpot = parkingSpots.find((spot) => spot.id === userParkingSpotId);

  return (
    <div style={styles.modalContainer}>
      <div style={styles.modalContent}>
        <h2 style={styles.modalTitle}>Parking Spot Details</h2>
        <p data-testid="spot-display">
          {userSpot
            ? `You are currently parked in spot ${userSpot.spotNumber}.`
            : 'You do not have a reserved parking spot.'}
        </p>
        {userSpot && (
          <button
            style={styles.modalButton}
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

const styles = {
  modalContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
    textAlign: 'center',
  },
  modalTitle: {
    marginBottom: '20px',
    fontSize: '1.5rem',
    color: '#00509e',
  },
  modalButton: {
    backgroundColor: '#0072ce',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.3s ease',
  },
  modalButtonHover: {
    backgroundColor: '#00509e',
    transform: 'translateY(-2px)',
  },
};

export default EmployeeParkingModal;
