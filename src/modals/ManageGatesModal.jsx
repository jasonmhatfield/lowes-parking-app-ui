import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import Button from '../components/Button';

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
          <div key={gate.id} className="display-item">
            <span>Gate: {gate.gateName}</span>
            <span>Status: {gate.operational ? 'Open' : 'Closed'}</span>
            <Button onClick={() => handleGateToggle(gate.id, gate.operational)} disabled={updating}>
              {gate.operational ? 'Close' : 'Open'}
            </Button>
          </div>
        ))}
      </div>
      <div className="modal-footer">
        <Button className="close-button" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
};

export default ManageGatesModal;
