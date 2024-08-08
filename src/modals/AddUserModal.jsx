import React, { useState } from 'react';
import { Modal, Box, TextField, Button } from '@mui/material';

const AddUserModal = ({ open, onClose, onSave }) => {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    hasHandicapPlacard: false,
    hasEv: false,
    role: 'employee'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = () => {
    onSave(user);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ p: 4, backgroundColor: 'white', margin: 'auto', marginTop: '10%', width: 400 }}>
        <h2>Add User</h2>
        <TextField
          label="First Name"
          name="firstName"
          value={user.firstName}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Last Name"
          name="lastName"
          value={user.lastName}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email"
          name="email"
          value={user.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <label>
          <input type="checkbox" name="hasHandicapPlacard" checked={user.hasHandicapPlacard} onChange={handleChange} />
          Handicap Placard
        </label>
        <label>
          <input type="checkbox" name="hasEv" checked={user.hasEv} onChange={handleChange} />
          Electric Vehicle
        </label>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save
          </Button>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddUserModal;
