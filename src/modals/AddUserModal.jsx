import React, { useState } from 'react';
import AccessibleIcon from '@mui/icons-material/Accessible';
import EvStationIcon from '@mui/icons-material/EvStation';
import Modal from '../components/Modal';
import Button from '../components/Button';

const AddUserModal = ({ onClose, onSave }) => {
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    hasHandicapPlacard: false,
    hasEv: false,
    role: 'employee'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleToggle = (field) => {
    setNewUser({ ...newUser, [field]: !newUser[field] });
  };

  const handleSave = async () => {
    await onSave(newUser);
  };

  return (
    <Modal open={true} onClose={onClose}>
      <div className="modal-header">Add New User</div>
      <div className="modal-body">
        <div className="form-group">
          <label>First Name</label>
          <input type="text" name="firstName" value={newUser.firstName} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Last Name</label>
          <input type="text" name="lastName" value={newUser.lastName} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={newUser.email} onChange={handleChange} />
        </div>
        <div className="toggle-button-group">
          <button
            className={`toggle-button ${newUser.hasHandicapPlacard ? 'active' : ''}`}
            onClick={() => handleToggle('hasHandicapPlacard')}
          >
            <AccessibleIcon />
          </button>
          <button
            className={`toggle-button ${newUser.hasEv ? 'active' : ''}`}
            onClick={() => handleToggle('hasEv')}
          >
            <EvStationIcon />
          </button>
        </div>
      </div>
      <div className="modal-footer">
        <Button className="close-button" onClick={onClose}>
          Cancel
        </Button>
        <Button className="submit-button" onClick={handleSave}>
          Save
        </Button>
      </div>
    </Modal>
  );
};

export default AddUserModal;
