import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import '../styles/ManageGatesModal.css';

const ManageGatesModal = ({ onClose }) => {
  const [gates, setGates] = useState([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchGates = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/gates');
        const data = await response.json();
        setGates(data);
      } catch (error) {
        console.error('Error fetching gates:', error);
      }
    };

    fetchGates();
  }, []);

  const handleGateToggle = async (id, currentStatus) => {
    setUpdating(true);
    try {
      const response = await fetch(`http://localhost:8080/api/gates/${id}?isOperational=${!currentStatus}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setGates(gates.map(gate => gate.id === id ? { ...gate, operational: !currentStatus } : gate));
      } else {
        console.error('Error updating gate status');
      }
    } catch (error) {
      console.error('Error updating gate status:', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Modal open={true} onClose={onClose}>
      <div className="modal-header">Manage Gates</div>
      <div className="modal-body">
        {gates.map(gate => (
          <div
            key={gate.id}
            className={`gate-item ${gate.operational ? 'gate-item-open' : 'gate-item-closed'}`}
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
        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
};

export default ManageGatesModal;
