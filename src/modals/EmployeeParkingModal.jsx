import React from 'react';
import { FaParking, FaCar } from 'react-icons/fa';
import Modal from '../components/Modal';

const EmployeeParkingModal = ({ open, userParkingSpotId, parkingSpots, handleParking, isMobile }) => {
  const userSpot = parkingSpots.find((spot) => spot.id === userParkingSpotId); // Find user's parking spot

  const getFloorAndSpot = (spotNumber) => {
    const floor = Math.floor(spotNumber / 100);
    const spot = spotNumber % 100;
    return { floor, spot }; // Extract floor and spot number from spotNumber
  };

  const userSpotDetails = userSpot ? getFloorAndSpot(userSpot.spotNumber) : null;

  return (
    <Modal open={open} isMobile={isMobile}>
      <h2 style={styles.modalTitle}>
        <FaParking style={styles.icon} /> Parking Spot Details {/* Display parking spot details */}
      </h2>
      <div style={styles.detailsContainer}>
        {userSpotDetails ? (
          <>
            <div style={styles.parkingMap}>
              <div style={styles.mapPlaceholder}>
                <FaCar style={styles.carIcon} /> {/* Display car icon */}
                <span style={styles.floorText}>Floor {userSpotDetails.floor}</span> {/* Display floor number */}
              </div>
              <div style={styles.spotNumber}>
                Spot {userSpotDetails.spot} {/* Display spot number */}
              </div>
            </div>
          </>
        ) : (
          <p style={styles.noSpotText}>You do not have a reserved parking spot.</p>
          )} {/* Message for no reserved spot */}
      </div>
      {userSpot && (
        <div style={styles.buttonContainer}>
          <button
            style={styles.modalButton}
            data-testid="leave-button"
            onClick={() => handleParking(userSpot)} // Handle leaving the spot
          >
            Leave Spot
          </button>
        </div>
      )}
    </Modal>
  );
};

const styles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)', // Almost black background
  },
  modalTitle: {
    marginBottom: '20px',
    fontSize: '1.8rem',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsContainer: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  icon: {
    marginRight: '10px',
    color: '#0072ce', // Icon color
  },
  floorText: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#f0f0f0',
  },
  spotText: {
    fontSize: '1.2rem',
    color: '#b0b0b0',
  },
  parkingMap: {
    backgroundColor: '#2a2a3b',
    borderRadius: '8px',
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    margin: '0 auto',
    maxWidth: '100%',
  },
  mapPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10px',
  },
  carIcon: {
    fontSize: '2.5rem',
    color: '#0072ce', // Car icon color
    marginBottom: '5px',
  },
  spotNumber: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#3a3a4a',
    padding: '10px 15px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  noSpotText: {
    color: '#b0b0b0',
    fontSize: '1.2rem',
    textAlign: 'center',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  modalButton: {
    backgroundColor: '#0072ce', // Button background color
    color: 'white',
    border: 'none',
    padding: '12px 25px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    transition: 'background-color 0.3s ease, transform 0.3s ease',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  modalButtonHover: {
    backgroundColor: '#00509e',
    transform: 'translateY(-2px)',
  },
};

export default EmployeeParkingModal;
