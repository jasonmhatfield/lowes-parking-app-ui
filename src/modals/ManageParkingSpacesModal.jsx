import React, { useEffect, useState } from 'react';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EvStationIcon from '@mui/icons-material/EvStation';
import AccessibleIcon from '@mui/icons-material/Accessible';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { fetchParkingSpotsData, removeUserFromSpot } from '../services/parkingSpotsService';

const ManageParkingSpacesModal = ({ onClose }) => {
  const [parkingSpots, setParkingSpots] = useState([]); // State to hold the list of parking spots
  const [userMap, setUserMap] = useState({}); // State to map user IDs to user names
  const [updating, setUpdating] = useState(false); // State to track update status
  const [filter, setFilter] = useState('all'); // State to hold the current filter

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { spotsData, userMapData } = await fetchParkingSpotsData(); // Fetch parking spots and user data
        setParkingSpots(spotsData); // Set the fetched parking spots
        setUserMap(userMapData); // Set the user map data
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData(); // Fetch data on component mount

    const pollInterval = setInterval(fetchData, 5000); // Poll data every 5 seconds

    return () => clearInterval(pollInterval); // Clean up interval on component unmount
  }, []);

  const handleRemoveUserFromSpot = async (spotId) => {
    setUpdating(true); // Set updating to true when the operation starts
    try {
      const updatedSpot = await removeUserFromSpot(spotId); // Remove user from the selected spot
      setParkingSpots(parkingSpots.map(s => (s.id === updatedSpot.id ? updatedSpot : s))); // Update the spot in state
    } catch (error) {
      console.error('Error removing user from spot:', error);
    } finally {
      setUpdating(false); // Reset updating state
    }
  };

  const getIconForSpot = (spot) => {
    const iconStyle = { fontSize: '1.5rem', zIndex: 2 };
    if (spot.occupied) return <DirectionsCarIcon style={{ ...iconStyle, color: '#FF5722' }} />; // Show car icon if spot is occupied
    switch (spot.type) {
      case 'ev':
        return <EvStationIcon style={{ ...iconStyle, color: '#4CAF50' }} />; // Show EV icon for EV spots
      case 'handicap':
        return <AccessibleIcon style={{ ...iconStyle, color: '#FFFFFF' }} />; // Show handicap icon for handicap spots
      default:
        return <LocalParkingIcon style={{ ...iconStyle, color: '#9E9E9E' }} />; // Show default parking icon for regular spots
    }
  };

  const filteredParkingSpots = parkingSpots.filter(spot => {
    if (filter === 'occupied') return spot.occupied; // Filter by occupied spots
    if (filter === 'available') return !spot.occupied; // Filter by available spots
    return true; // Default to showing all spots
  });

  return (
    <Modal open={true} onClose={onClose} aria-labelledby="modal-title">
      <div style={styles.modalContent}>
        <div id="modal-title" style={styles.modalHeader}>Manage Parking Spaces</div>
        <div style={styles.modalBody}>
          <div style={styles.filterButtons}>
            <Button
              onClick={() => setFilter('all')}
              style={{
                ...styles.button,
                ...(filter === 'all' && styles.activeButton)
              }}
            >
              All
            </Button>
            <Button
              onClick={() => setFilter('occupied')}
              style={{
                ...styles.button,
                ...(filter === 'occupied' && styles.activeButton)
              }}
            >
              Occupied
            </Button>
            <Button
              onClick={() => setFilter('available')}
              style={{
                ...styles.button,
                ...(filter === 'available' && styles.activeButton)
              }}
            >
              Available
            </Button>
          </div>
          <div style={styles.parkingTableContainer}>
            <table style={styles.parkingTable}>
              <thead>
              <tr>
                <th style={styles.tableCell}>Spot Number</th>
                <th style={styles.tableCell}>Type</th>
                <th style={styles.tableCell}>Status</th>
                <th style={styles.tableCell}>Employee</th>
                <th style={styles.tableCell}>Action</th>
              </tr>
              </thead>
              <tbody>
              {filteredParkingSpots.map(spot => (
                <tr key={spot.id}>
                  <td style={styles.tableCell}>{spot.spotNumber}</td>
                  <td style={styles.tableCell}>{getIconForSpot(spot)}</td>
                  <td style={styles.tableCell}>{spot.occupied ? 'Occupied' : 'Available'}</td>
                  <td style={styles.tableCell}>{spot.userId ? userMap[spot.userId] : ''}</td>
                  <td style={styles.tableCell}>
                    {spot.occupied && (
                      <Button
                        onClick={() => handleRemoveUserFromSpot(spot.id)}
                        disabled={updating}
                        style={styles.smallButton}
                      >
                        Remove
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
        <div style={styles.modalFooter}>
          <Button onClick={onClose}>Close</Button> {/* Button to close the modal */}
        </div>
      </div>
    </Modal>
  );
};

const styles = {
  modalContent: {
    backgroundColor: '#1e1e2f',
    padding: '20px',
    borderRadius: '12px',
    width: '700px',
    maxHeight: '80vh',
    overflow: 'hidden',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    fontSize: '1.8rem',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: '20px',
  },
  modalBody: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflowY: 'auto',
    width: '100%',
    height: '60vh',
  },
  filterButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: '15px',
  },
  button: {
    flex: 1,
    padding: '10px',
    margin: '0 10px',
    borderRadius: '8px',
    fontSize: '1rem',
    color: '#ffffff',
    backgroundColor: '#1976D2',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'background-color 0.3s ease, transform 0.3s ease',
  },
  activeButton: {
    backgroundColor: '#4242aa',
  },
  parkingTableContainer: {
    width: '100%',
    overflowX: 'auto',
  },
  parkingTable: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#252525',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  tableCell: {
    padding: '10px',
    textAlign: 'center',
    color: '#ffffff',
    whiteSpace: 'nowrap',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
  },
  smallButton: {
    padding: '6px 12px',
    fontSize: '0.875rem',
    minWidth: 'unset',
    backgroundColor: '#f44336',
  },
};

export default ManageParkingSpacesModal;
