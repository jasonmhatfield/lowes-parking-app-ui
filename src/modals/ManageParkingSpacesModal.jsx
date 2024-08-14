import React, { useEffect, useState } from 'react';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EvStationIcon from '@mui/icons-material/EvStation';
import AccessibleIcon from '@mui/icons-material/Accessible';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import Modal from '../components/Modal';
import Button from '../components/Button';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import styled from 'styled-components';

const ManageParkingSpacesModal = ({ onClose }) => {
  const [parkingSpots, setParkingSpots] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [updating, setUpdating] = useState(false);
  const [filter, setFilter] = useState('all');

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
          prevSpots.map(spot => (spot.id === updatedSpot.id ? updatedSpot : spot))
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
        setParkingSpots(parkingSpots.map(s => (s.id === updatedSpot.id ? updatedSpot : s)));
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
    return true;
  });

  return (
    <Modal open={true} onClose={onClose} aria-labelledby="modal-title">
      <ModalContent>
        <ModalHeader id="modal-title">Manage Parking Spaces</ModalHeader>
        <ModalBody>
          <FilterButtons>
            <Button onClick={() => setFilter('all')} active={filter === 'all'}>All</Button>
            <Button onClick={() => setFilter('occupied')} active={filter === 'occupied'}>Occupied</Button>
            <Button onClick={() => setFilter('available')} active={filter === 'available'}>Available</Button>
          </FilterButtons>
          <ParkingTableContainer>
            <ParkingTable>
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
                  <td className="fixed-width">{spot.userId ? userMap[spot.userId] : ''}</td>
                  <td className="fixed-width">
                    {spot.occupied && (
                      <SmallButton
                        onClick={() => handleRemoveUserFromSpot(spot.id)}
                        disabled={updating}
                      >
                        Remove
                      </SmallButton>
                    )}
                  </td>
                </tr>
              ))}
              </tbody>
            </ParkingTable>
          </ParkingTableContainer>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const ModalContent = styled.div`
    background-color: #1e1e2f;
    padding: 20px;
    border-radius: 12px;
    width: 700px;
    max-height: 80vh;
    overflow: hidden;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
`;

const ModalHeader = styled.div`
    font-size: 1.8rem;
    color: #ffffff;
    text-align: center;
    margin-bottom: 20px;
`;

const ModalBody = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
    width: 100%;
    height: 60vh;
`;

const FilterButtons = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 15px;

    & > button {
        flex: 1;
        margin-right: 10px;
    }

    & > button:last-child {
        margin-right: 0;
    }
`;

const ParkingTableContainer = styled.div`
    width: 100%;
    overflow-x: auto;
`;

const ParkingTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    background-color: #252525;
    border-radius: 8px;
    overflow: hidden;

    th, td {
        padding: 10px;
        text-align: center;
        color: #ffffff;
        white-space: nowrap;
    }

    th {
        background-color: #33334d;
    }

    td {
        background-color: #1e1e2f;
    }

    tr:nth-child(even) td {
        background-color: #2a2a3b;
    }

    tr:hover td {
        background-color: #3a3a4d;
    }
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 20px;
`;

const SmallButton = styled(Button)`
    padding: 6px 12px;
    font-size: 0.875rem;
    min-width: unset;
    background-color: #f44336;
`;

export default ManageParkingSpacesModal;
