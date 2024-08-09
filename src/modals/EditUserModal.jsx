import React, { useState } from 'react';
import AccessibleIcon from '@mui/icons-material/Accessible';
import EvStationIcon from '@mui/icons-material/EvStation';
import '../styles/Modal.css';

const EditUserModal = ({ user, onClose, onSave }) => {
  const [editedUser, setEditedUser] = useState({ ...user });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({ ...editedUser, [name]: value });
  };

  const handleToggle = (field) => {
    setEditedUser({ ...editedUser, [field]: !editedUser[field] });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editedUser);
      setSaving(false);
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">Edit User</div>
        <div className="modal-body">
          <div className="form-group">
            <label>First Name</label>
            <input type="text" name="firstName" value={editedUser.firstName} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input type="text" name="lastName" value={editedUser.lastName} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={editedUser.email} onChange={handleChange} />
          </div>
          <div className="toggle-button-group">
            <button
              className={`toggle-button ${editedUser.hasHandicapPlacard ? 'active' : ''}`}
              onClick={() => handleToggle('hasHandicapPlacard')}
              style={{ backgroundColor: editedUser.hasHandicapPlacard ? '#4CAF50' : '#616161' }}
            >
              <AccessibleIcon />
            </button>
            <button
              className={`toggle-button ${editedUser.hasEv ? 'active' : ''}`}
              onClick={() => handleToggle('hasEv')}
              style={{ backgroundColor: editedUser.hasEv ? '#4CAF50' : '#616161' }}
            >
              <EvStationIcon />
            </button>
          </div>
        </div>
        <div className="modal-footer">
          <button className="close-button" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="submit-button" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
