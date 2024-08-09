import React, { useState } from 'react';

const EditUserModal = ({ user, onClose, onSave }) => {
  const [editedUser, setEditedUser] = useState({ ...user });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedUser({
      ...editedUser,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSave = () => {
    onSave(editedUser);
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Edit User</h2>
        <label>First Name: <input type="text" name="firstName" value={editedUser.firstName} onChange={handleChange} /></label>
        <label>Last Name: <input type="text" name="lastName" value={editedUser.lastName} onChange={handleChange} /></label>
        <label>Email: <input type="email" name="email" value={editedUser.email} onChange={handleChange} /></label>
        <label>Has Handicap Placard: <input type="checkbox" name="hasHandicapPlacard" checked={editedUser.hasHandicapPlacard} onChange={handleChange} /></label>
        <label>Has EV: <input type="checkbox" name="hasEv" checked={editedUser.hasEv} onChange={handleChange} /></label>
        <button onClick={handleSave}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default EditUserModal;
