import React, { useState } from 'react';
import AccessibleIcon from '@mui/icons-material/Accessible';
import EvStationIcon from '@mui/icons-material/EvStation';
import Modal from '../components/Modal';
import Button from '../components/Button';

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
    <Modal open={true} onClose={onClose}>
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
          >
            <AccessibleIcon />
          </button>
          <button
            className={`toggle-button ${editedUser.hasEv ? 'active' : ''}`}
            onClick={() => handleToggle('hasEv')}
          >
            <EvStationIcon />
          </button>
        </div>
      </div>
      <div className="modal-footer">
        <Button className="close-button" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button className="submit-button" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </Modal>
  );
};

export default EditUserModal;
