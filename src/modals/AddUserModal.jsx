import React, { useState } from 'react';
import AccessibleIcon from '@mui/icons-material/Accessible';
import EvStationIcon from '@mui/icons-material/EvStation';
import Modal from '../components/Modal';
import Button from '../components/Button';
import styled from 'styled-components';

const AddUserModal = ({ onClose, onSave }) => {
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    hasHandicapPlacard: false,
    hasEv: false,
    role: 'employee',
  }); // State to hold new user details

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value }); // Update user details based on input changes
  };

  const handleToggle = (field) => {
    setNewUser({ ...newUser, [field]: !newUser[field] }); // Toggle boolean fields (hasHandicapPlacard, hasEv)
  };

  const handleSave = async () => {
    await onSave(newUser); // Trigger save action for the new user
  };

  return (
    <Modal open={true} onClose={onClose}>
      <ModalContent data-testid="add-user-modal">
        <ModalHeader data-testid="modal-header">Add New User</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>First Name</Label>
            <Input
              data-testid="first-name-input"
              type="text"
              name="firstName"
              value={newUser.firstName}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label>Last Name</Label>
            <Input
              data-testid="last-name-input"
              type="text"
              name="lastName"
              value={newUser.lastName}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label>Email</Label>
            <Input
              data-testid="email-input"
              type="email"
              name="email"
              value={newUser.email}
              onChange={handleChange}
            />
          </FormGroup>
          <ToggleGroup>
            <ToggleButton
              data-testid="handicap-toggle"
              active={newUser.hasHandicapPlacard}
              onClick={() => handleToggle('hasHandicapPlacard')}
              className={newUser.hasHandicapPlacard ? 'active' : ''}
            >
              <AccessibleIcon /> {/* Handicap icon toggle button */}
            </ToggleButton>
            <ToggleButton
              data-testid="ev-toggle"
              active={newUser.hasEv}
              onClick={() => handleToggle('hasEv')}
              className={newUser.hasEv ? 'active' : ''}
            >
              <EvStationIcon /> {/* EV icon toggle button */}
            </ToggleButton>
          </ToggleGroup>
        </ModalBody>
        <ModalFooter>
          <Button
            dataTestId="cancel-button"
            onClick={onClose}
            className="cancel-button"
          >
            Cancel
          </Button>
          <Button
            dataTestId="save-button"
            onClick={handleSave}
            className="save-button"
          >
            Save
          </Button>
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
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
`;

const ModalHeader = styled.div`
    font-size: 1.8rem;
    color: #ffffff;
    text-align: center;
    margin-bottom: 20px;
`;

const ModalBody = styled.div`
    flex-direction: column;
    align-items: center;
`;

const FormGroup = styled.div`
    margin-bottom: 15px;
`;

const Label = styled.label`
    display: block;
    color: #ffffff;
    margin-bottom: 5px;
`;

const Input = styled.input`
    width: 94%;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #555573;
    background-color: #3c3c5e;
    color: #ffffff;
    font-size: 16px;
`;

const ToggleGroup = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-top: 15px;
`;

const ToggleButton = styled.button`
    width: 48%;
    padding: 10px;
    border-radius: 8px;
    border: none;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    background-color: ${({ active }) => (active ? '#4caf50' : '#555573')};
    color: #ffffff;

    &.active {
        background-color: #4caf50;
    }
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
`;

export default AddUserModal;
