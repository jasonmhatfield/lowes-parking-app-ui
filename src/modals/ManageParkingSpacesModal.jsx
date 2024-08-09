import React, { useState, useEffect } from 'react';
import Tooltip from '../components/Tooltip';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EvStationIcon from '@mui/icons-material/EvStation';
import AccessibleIcon from '@mui/icons-material/Accessible';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import '../styles/ManageParkingSpacesModal.css';

const ManageParkingSpacesModal = ({ onClose }) => {
  const [parkingSpots, setParkingSpots] = useState([]);
  const [hoveredSpot, setHoveredSpot] = useState(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [userMap, setUserMap] = useState({});
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchParkingSpots = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/parkingSpots');
        const data = await response.json();
        console.log('Fetched Parking Spots:', data); // Log the fetched parking spots
        setParkingSpots(data);
        await fetchUsers(data);
      } catch (error) {
        console.error('Error fetching parking spots:', error);
      }
    };

    const fetchUsers = async (spots) => {
      try {
        const userIds = [...new Set(spots.filter(spot => spot.userId).map(spot => spot.userId))];
        console.log('User IDs from Parking Spots:', userIds); // Log the user IDs
        const userResponses = await Promise.all(userIds.map(id => fetch(`http://localhost:8080/api/users/${id}`)));
        const users = await Promise.all(userResponses.map(res => res.json()));
        console.log('Fetched Users:', users); // Log the fetched users
        const userMap = users.reduce((map, user) => ({ ...map, [user.id]: `${user.firstName} ${user.lastName}` }), {});
        console.log('User Map:', userMap); // Log the created user map
        setUserMap(userMap);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchParkingSpots();
  }, []);

  const handleMouseEnter = (spot) => {
    if (spot.isOccupied) {
      console.log('Hovered Spot:', spot); // Log the hovered spot
      setHoveredSpot(spot);
      setTooltipVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setTooltipVisible(false);
    setHoveredSpot(null);
  };

  const handleRemoveUserFromSpot = async (spotId) => {
    setUpdating(true);
    try {
      console.log('Removing user from Spot ID:', spotId); // Log the spot ID being updated
      const response = await fetch(`http://localhost:8080/api/parkingSpots/${spotId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOccupied: false, userId: null }),
      });

      if (response.ok) {
        const updatedSpots = parkingSpots.map(spot => spot.id === spotId ? { ...spot, isOccupied: false, userId: null } : spot);
        console.log('Updated Parking Spots:', updatedSpots); // Log the updated parking spots
        setParkingSpots(updatedSpots);
        setTooltipVisible(false);
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
    const iconStyle = { fontSize: '2rem', zIndex: 2 };  // Ensure icon appears above the car background
    if (spot.isOccupied) return <DirectionsCarIcon style={{ ...iconStyle, color: '#FF5722' }} />;  // Orange car icon for occupied spots
    switch (spot.type) {
      case 'ev':
        return <EvStationIcon style={{ ...iconStyle, color: '#4CAF50' }} />;  // Green for EV spots
      case 'handicap':
        return <AccessibleIcon style={{ ...iconStyle, color: '#FFFFFF' }} />;  // White for handicap spots
      default:
        return <LocalParkingIcon style={{ ...iconStyle, color: '#9E9E9E' }} />;  // Grey for regular spots
    }
  };

  const getButtonClass = (spot) => {
    if (spot.isOccupied) return 'parking-spot occupied';
    return 'parking-spot available';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">Manage Parking Spaces</div>
        <div className="modal-body">
          <div className="parking-spots-grid">
            {parkingSpots.map(spot => (
              <div
                key={spot.id}
                className={getButtonClass(spot)}
                onMouseEnter={() => handleMouseEnter(spot)}
                onMouseLeave={handleMouseLeave}
              >
                {spot.isOccupied && <div className="background-car-icon"><DirectionsCarIcon /></div>} {/* Background car icon */}
                {getIconForSpot(spot)}
                <div className="spot-number">{spot.spotNumber}</div>
                {tooltipVisible && hoveredSpot && hoveredSpot.id === spot.id && (
                  <Tooltip>
                    <p>{userMap[hoveredSpot.userId]}</p>
                    <button
                      onClick={() => handleRemoveUserFromSpot(hoveredSpot.id)}
                      disabled={updating}
                      style={{ backgroundColor: updating ? '#616161' : '#d32f2f', color: '#fff', padding: '8px', border: 'none', borderRadius: '4px', cursor: updating ? 'not-allowed' : 'pointer' }}
                    >
                      Remove User
                    </button>
                  </Tooltip>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="close-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ManageParkingSpacesModal;
