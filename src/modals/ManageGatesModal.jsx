import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import Modal from '../components/Modal';

const ManageGatesModal = ({ onClose }) => {
  const [gates, setGates] = useState([]);

  useEffect(() => {
    const fetchGates = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/gates');
        if (response.ok) {
          const data = await response.json();
          setGates(data);
        } else {
          throw new Error('Failed to fetch gates');
        }
      } catch (error) {
        console.error('Error fetching gates:', error);
      }
    };

    fetchGates();
  }, []);

  const handleGateToggle = async (id, currentStatus) => {
    try {
      const response = await fetch(`http://localhost:8080/api/gates/${id}?isOperational=${!currentStatus}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setGates((prevGates) =>
          prevGates.map((gate) =>
            gate.id === id ? { ...gate, operational: !currentStatus } : gate
          )
        );
      } else {
        console.error('Error updating gate status');
      }
    } catch (error) {
      console.error('Error updating gate status:', error);
    }
  };

  return (
    <Modal open={true} onClose={onClose}>
      <ModalContent>
        <ModalHeader data-testid="modal-header">Manage Gates</ModalHeader>
        <ModalBody>
          {gates.map((gate) => (
            <GateItem
              key={gate.id}
              operational={gate.operational}
              onClick={() => handleGateToggle(gate.id, gate.operational)}
              data-testid={`gate-item-${gate.id}`}
            >
              <GateName data-testid={`gate-name-${gate.id}`}>{gate.gateName}</GateName>
              <GateIcon operational={gate.operational} data-testid={`gate-icon-${gate.id}`}>
                {gate.operational ? <LockOpenIcon fontSize="inherit" /> : <LockIcon fontSize="inherit" />}
              </GateIcon>
            </GateItem>
          ))}
        </ModalBody>
        <ModalFooter>
          <CloseButton onClick={onClose} data-testid="close-button">Close</CloseButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const ModalContent = styled.div`
    background-color: #1e1e2f;
    padding: 20px;
    border-radius: 12px;
    width: 360px;
    height: 400px;
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
    justify-content: center;
    align-items: center;
    flex: 1;
    max-height: calc(100% - 100px);
    overflow-y: auto;
`;

const GateItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: ${({ operational }) => (operational ? '#4caf50' : '#f44336')};
    padding: 10px 15px;
    border-radius: 8px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease;
    width: 60%;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);

    &:hover {
        transform: translateY(-2px);
    }
`;

const GateName = styled.span`
    font-size: 1rem;
    color: #ffffff;
`;

const GateIcon = styled.div`
    font-size: 1.5rem;
    color: #ffffff;
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 20px;
`;

const CloseButton = styled.button`
    padding: 10px 20px;
    border-radius: 8px;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    background-color: #1976D2;
    color: #ffffff;
    transition: background-color 0.3s ease, transform 0.3s ease;

    &:hover {
        background-color: #0056b3;
        transform: translateY(-2px);
    }
`;

export default ManageGatesModal;
