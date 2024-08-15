import React, { useEffect, useState } from 'react';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import Modal from '../components/Modal';
import '../styles/modals/ManageGatesModal.css';

const fetchGates = async () => {
  const response = await fetch('http://localhost:8080/api/gates');
  if (!response.ok) {
    throw new Error('Failed to fetch gates');
  }
  return await response.json();
};

const toggleGateStatus = async (id, currentStatus) => {
  const response = await fetch(`http://localhost:8080/api/gates/${id}?isOperational=${!currentStatus}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Error updating gate status');
  }
};

const ManageGatesModal = ({ onClose }) => {
  const [gates, setGates] = useState([]);

  useEffect(() => {
    const loadGates = async () => {
      try {
        const data = await fetchGates();
        setGates(data);
      } catch (error) {
        console.error('Error fetching gates:', error);
      }
    };
    loadGates();
  }, []);

  const handleGateToggle = async (id, currentStatus) => {
    try {
      await toggleGateStatus(id, currentStatus);
      setGates(gates =>
        gates.map(gate => gate.id === id ? { ...gate, operational: !currentStatus } : gate)
      );
    } catch (error) {
      console.error('Error updating gate status:', error);
    }
  };

  return (
    <Modal open={true} onClose={onClose}>
      <div className="modal-content">
        <div className="modal-header">Manage Gates</div>
        <div className="modal-body">
          {gates.map(gate => (
            <div
              key={gate.id}
              className={`gate-item ${gate.operational ? 'operational' : 'not-operational'}`}
              onClick={() => handleGateToggle(gate.id, gate.operational)}
            >
              <span className="gate-name">{gate.gateName}</span>
              <div className="gate-icon">
                {gate.operational ? <LockOpenIcon fontSize="inherit" /> : <LockIcon fontSize="inherit" />}
              </div>
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="close-button">Close</button>
        </div>
      </div>
    </Modal>
  );
};

export default ManageGatesModal;
