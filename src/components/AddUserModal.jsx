import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const AddUserModal = ({ open, onClose, user, onSave, onChange }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add User</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="First Name"
          type="text"
          fullWidth
          name="firstName"
          value={user.firstName}
          onChange={onChange}
        />
        <TextField
          margin="dense"
          label="Last Name"
          type="text"
          fullWidth
          name="lastName"
          value={user.lastName}
          onChange={onChange}
        />
        <TextField
          margin="dense"
          label="Email"
          type="email"
          fullWidth
          name="email"
          value={user.email}
          onChange={onChange}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Role</InputLabel>
          <Select
            name="role"
            value={user.role}
            onChange={onChange}
            label="Role"
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="employee">Employee</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Cancel</Button>
        <Button onClick={onSave} color="primary">Add</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUserModal;
