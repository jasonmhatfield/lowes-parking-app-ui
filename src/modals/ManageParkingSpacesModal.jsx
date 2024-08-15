import React, { useEffect, useState } from 'react';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EvStationIcon from '@mui/icons-material/EvStation';
import AccessibleIcon from '@mui/icons-material/Accessible';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { setupWebSocketConnection, fetchParkingSpotsData, removeUserFromSpot } from '../services/parkingSpotsService';
import '../styles/components/ManageParkingSpacesModal.css';

const ManageParkingSpacesModal = ({ onClose }) => {
  const [parkingSpots, setParkingSpots] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [updating, setUpdating] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { spotsData, userMapData } = await fetchParkingSpotsData();
        setParkingSpots(spotsData);
        setUserMap(userMapData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    const stompClient = setupWebSocketConnection((updatedSpot) => {
      setParkingSpots(prevSpots =>
        prevSpots.map(spot => (spot.id === updatedSpot.id ? updatedSpot : spot))
      );
    });

    return () => {
      if (stompClient) stompClient.disconnect();
    };
  }, []);

  const handleRemoveUserFromSpot = async (spotId) => {
    setUpdating(true);
    try {
      const updatedSpot = await removeUserFromSpot(spotId);
      setParkingSpots(parkingSpots.map(s => (s.id === updatedSpot.id ? updatedSpot : s)));
    } catch (error) {
      console.error('Error removing user from spot:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getIconForSpot = (spot) => {
    const iconStyle = { fontSize: '1.5rem', zIndex: 2 };
    if (spot.occupied) return <DirectionsCarIcon style={{ ...iconStyle, color: '#FF5722' }} />;
    switch (spot.type) {
      case 'ev':
        return <EvStationIcon style={{ ...iconStyle, color: '#4CAF50' }} />;
      case 'handicap':
        return <AccessibleIcon style={{ ...iconStyle, color: '#FFFFFF' }} />;
      default:
        return <LocalParkingIcon style={{ ...iconStyle, color: '#9E9E9E' }} />;
    }
  };

  const filteredParkingSpots = parkingSpots.filter(spot => {
    if (filter === 'occupied') return spot.occupied;
    if (filter === 'available') return !spot.occupied;
    return true;
  });

  return (
    <Modal open={true} onClose={onClose} aria-labelledby="modal-title">
      <div className="modal-content">
        <div className="modal-header" id="modal-title">Manage Parking Spaces</div>
        <div className="modal-body">
          <div className="filter-buttons">
            <Button onClick={() => setFilter('all')} active={filter === 'all'}>All</Button>
            <Button onClick={() => setFilter('occupied')} active={filter === 'occupied'}>Occupied</Button>
            <Button onClick={() => setFilter('available')} active={filter === 'available'}>Available</Button>
          </div>
          <div className="parking-table-container">
            <table className="parking-table">
              <thead>
              <tr>
                <th>Spot Number</th>
                <th>Type</th>
                <th>Status</th>
                <th>Employee</th>
                <th>Action</th>
              </tr>
              </thead>
              <tbody>
              {filteredParkingSpots.map(spot => (
                <tr key={spot.id}>
                  <td>{spot.spotNumber}</td>
                  <td>{getIconForSpot(spot)}</td>
                  <td>{spot.occupied ? 'Occupied' : 'Available'}</td>
                  <td>{spot.userId ? userMap[spot.userId] : ''}</td>
                  <td>
                    {spot.occupied && (
                      <Button
                        onClick={() => handleRemoveUserFromSpot(spot.id)}
                        disabled={updating}
                        className="small-button"
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
        <div className="modal-footer">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ManageParkingSpacesModal;
