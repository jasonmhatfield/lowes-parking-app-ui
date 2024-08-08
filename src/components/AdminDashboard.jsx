import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = ({ currentUser, onLogout }) => {
  const [gates, setGates] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGates = async () => {
      try {
        const response = await axios.get('http://localhost:8080/gates');
        setGates(response.data);
      } catch (error) {
        console.error('Error fetching gates:', error);
        setError('Error fetching gates.');
      }
    };

    fetchGates();
  }, []);

  const toggleGateStatus = async (gateId, currentStatus) => {
    try {
      const response = await axios.patch(`http://localhost:8080/gates/${gateId}`, { isOperational: !currentStatus });
      const updatedGate = response.data;
      setGates(prevGates => prevGates.map(gate => gate.id === gateId ? updatedGate : gate));
    } catch (error) {
      console.error('Failed to update gate status:', error);
      setError('Failed to update gate status.');
    }
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>Welcome, {currentUser.firstName} {currentUser.lastName}</p>
      <button onClick={onLogout}>Logout</button>

      <h3>Manage Parking Gates</h3>
      {error && <p>{error}</p>}
      {gates.map(gate => (
        <div key={gate.id}>
          <p>{gate.gateName}: {gate.isOperational ? 'Open' : 'Closed'}</p>
          <button onClick={() => toggleGateStatus(gate.id, gate.isOperational)}>
            {gate.isOperational ? 'Close' : 'Open'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
