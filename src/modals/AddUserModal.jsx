import React, { useState } from 'react';

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
    const { name, value, type, checked } = e.target;
    setNewUser({
      ...newUser,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSave = () => {
    onSave(newUser);
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Add New User</h2>
        <label>First Name: <input type="text" name="firstName" value={newUser.firstName} onChange={handleChange} /></label>
        <label>Last Name: <input type="text" name="lastName" value={newUser.lastName} onChange={handleChange} /></label>
        <label>Email: <input type="email" name="email" value={newUser.email} onChange={handleChange} /></label>
        <label>Has Handicap Placard: <input type="checkbox" name="hasHandicapPlacard" checked={newUser.hasHandicapPlacard} onChange={handleChange} /></label>
        <label>Has EV: <input type="checkbox" name="hasEv" checked={newUser.hasEv} onChange={handleChange} /></label>
        <button onClick={handleSave}>Add User</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default AddUserModal;
