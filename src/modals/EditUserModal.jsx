import React, { useState } from 'react';
import AccessibleIcon from '@mui/icons-material/Accessible';
import EvStationIcon from '@mui/icons-material/EvStation';
import Modal from '../components/Modal';
import Button from '../components/Button';
import styled from 'styled-components';

const EditUserModal = ({ user, onClose, onSave }) => {
  const [editedUser, setEditedUser] = useState({ ...user }); // State to hold the edited user details
  const [saving, setSaving] = useState(false); // State to track saving status

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({ ...editedUser, [name]: value }); // Update user details based on input changes
  };

  const handleToggle = (field) => {
    setEditedUser({ ...editedUser, [field]: !editedUser[field] }); // Toggle boolean fields (hasHandicapPlacard, hasEv)
  };

  const handleSave = async () => {
    setSaving(true); // Set saving to true when save starts
    try {
      await onSave(editedUser); // Trigger save action for the edited user
      setSaving(false); // Reset saving state once save is complete
      onClose(); // Close the modal after saving
    } catch (error) {
      console.error('Error saving user:', error);
      setSaving(false); // Reset saving state in case of an error
    }
  };

  return (
    <Modal open={true} onClose={onClose}>
      <ModalContent data-testid="edit-user-modal">
        <ModalHeader data-testid="modal-header">Edit User</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>First Name</Label>
            <Input
              data-testid="first-name-input"
              type="text"
              name="firstName"
              value={editedUser.firstName}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label>Last Name</Label>
            <Input
              data-testid="last-name-input"
              type="text"
              name="lastName"
              value={editedUser.lastName}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label>Email</Label>
            <Input
              data-testid="email-input"
              type="email"
              name="email"
              value={editedUser.email}
              onChange={handleChange}
            />
          </FormGroup>
          <ToggleGroup>
            <ToggleButton
              data-testid="handicap-toggle"
              active={editedUser.hasHandicapPlacard}
              onClick={() => handleToggle('hasHandicapPlacard')}
            >
              <AccessibleIcon /> {/* Handicap icon toggle button */}
            </ToggleButton>
            <ToggleButton
              data-testid="ev-toggle"
              active={editedUser.hasEv}
              onClick={() => handleToggle('hasEv')}
            >
              <EvStationIcon /> {/* EV icon toggle button */}
            </ToggleButton>
          </ToggleGroup>
        </ModalBody>
        <ModalFooter>
          <Button
            dataTestId="cancel-button"
            onClick={onClose}
            disabled={saving}
            className="cancel-button"
          >
            Cancel
          </Button>
          <Button
            dataTestId="save-button"
            onClick={handleSave}
            disabled={saving}
            className="save-button"
          >
            {saving ? 'Saving...' : 'Save'}
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
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const FormGroup = styled.div`
    width: 100%;
    margin-bottom: 15px;
`;

const Label = styled.label`
    display: block;
    color: #ffffff;
    margin-bottom: 5px;
`;

const Input = styled.input`
    width: 100%;
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
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
`;

export default EditUserModal;
