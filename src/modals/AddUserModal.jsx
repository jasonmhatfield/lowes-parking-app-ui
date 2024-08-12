import React, { useState } from 'react';
import AccessibleIcon from '@mui/icons-material/Accessible';
import EvStationIcon from '@mui/icons-material/EvStation';
import '../styles/Modal.css';

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
    await onSave(newUser); // Calling the onSave function passed as a prop
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
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
              style={{ backgroundColor: newUser.hasHandicapPlacard ? '#4CAF50' : '#616161' }}
            >
              <AccessibleIcon />
            </button>
            <button
              className={`toggle-button ${newUser.hasEv ? 'active' : ''}`}
              onClick={() => handleToggle('hasEv')}
              style={{ backgroundColor: newUser.hasEv ? '#4CAF50' : '#616161' }}
            >
              <EvStationIcon />
            </button>
          </div>
        </div>
        <div className="modal-footer">
          <button className="close-button" onClick={onClose}>
            Cancel
          </button>
          <button className="submit-button" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
