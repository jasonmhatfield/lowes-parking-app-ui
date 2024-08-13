import React, { useState, useEffect } from 'react';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EvStationIcon from '@mui/icons-material/EvStation';
import AccessibleIcon from '@mui/icons-material/Accessible';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import Modal from '../components/Modal';
import Button from '../components/Button';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import '../styles/ManageParkingSpacesModal.css';

const ManageParkingSpacesModal = ({ onClose }) => {
  const [parkingSpots, setParkingSpots] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [updating, setUpdating] = useState(false);
  const [filter, setFilter] = useState('all'); // Filter state: 'all', 'occupied', 'available'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const parkingSpotsResponse = await fetch('http://localhost:8080/api/parkingSpots');
        const parkingSpotsData = await parkingSpotsResponse.json();
        setParkingSpots(parkingSpotsData);

        const userIds = [...new Set(parkingSpotsData.filter(spot => spot.userId).map(spot => spot.userId))];
        const userResponses = await Promise.all(userIds.map(id => fetch(`http://localhost:8080/api/users/${id}`)));
        const users = await Promise.all(userResponses.map(res => res.json()));
        const userMap = users.reduce((map, user) => ({ ...map, [user.id]: `${user.firstName} ${user.lastName}` }), {});
        setUserMap(userMap);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
      stompClient.subscribe('/topic/parkingSpots', (message) => {
        const updatedSpot = JSON.parse(message.body);
        setParkingSpots(prevSpots =>
          prevSpots.map(spot => spot.id === updatedSpot.id ? updatedSpot : spot)
        );
      });
    });

    return () => {
      if (stompClient) stompClient.disconnect();
    };
  }, []);

  const handleRemoveUserFromSpot = async (spotId) => {
    setUpdating(true);
    try {
      const response = await fetch(`http://localhost:8080/api/parkingSpots/${spotId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ occupied: false, userId: null }),
      });

      if (response.ok) {
        const updatedSpot = await response.json();
        setParkingSpots(parkingSpots.map(s => s.id === updatedSpot.id ? updatedSpot : s));
      } else {
        console.error('Error removing user from spot.');
      }
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
    return true; // 'all'
  });

  return (
    <Modal open={true} onClose={onClose}>
      <div className="modal-header">Manage Parking Spaces</div>
      <div className="modal-body">
        <div className="filter-buttons">
          <Button onClick={() => setFilter('all')} className={filter === 'all' ? 'active-filter' : ''}>All</Button>
          <Button onClick={() => setFilter('occupied')} className={filter === 'occupied' ? 'active-filter' : ''}>Occupied</Button>
          <Button onClick={() => setFilter('available')} className={filter === 'available' ? 'active-filter' : ''}>Available</Button>
        </div>
        <div className="parking-table-container">
          <table className="parking-table">
            <thead>
            <tr>
              <th>Spot Number</th>
              <th>Type</th>
              <th>Status</th>
              <th>Employee</th> {/* Renamed column */}
              <th>Action</th>
            </tr>
            </thead>
            <tbody>
            {filteredParkingSpots.map(spot => (
              <tr key={spot.id}>
                <td>{spot.spotNumber}</td>
                <td>{getIconForSpot(spot)}</td>
                <td>{spot.occupied ? 'Occupied' : 'Available'}</td>
                <td>{spot.userId ? userMap[spot.userId] : ''}</td> {/* Display employee name */}
                <td>
                  {spot.occupied ? (
                    <Button
                      onClick={() => handleRemoveUserFromSpot(spot.id)}
                      disabled={updating}
                      className="remove-button"
                    >
                      Remove
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="modal-footer">
        <Button className="close-button" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
};

export default ManageParkingSpacesModal;
