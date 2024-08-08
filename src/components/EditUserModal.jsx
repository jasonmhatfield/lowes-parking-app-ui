import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import ConfirmationModal from './ConfirmationModal';
import axios from 'axios';

const EditUserModal = ({ open, onClose, user, onSave, onChange, currentUser, fetchUsers }) => {
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [selectedPass, setSelectedPass] = useState(null);

  useEffect(() => {
    const fetchParkingPass = async () => {
      if (!user || user.role === 'admin' || !user.userId) {
        setSelectedPass(null);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8080/api/passes/user/${user.userId}`);
        setSelectedPass(response.data);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setSelectedPass(null); // No pass found for this user
        } else {
          console.error('Error fetching parking pass:', error);
        }
      }
    };

    fetchParkingPass();
  }, [user]);

  const handleDeleteUser = useCallback(() => {
    if (!user) return;

    if (currentUser.userId === user.userId) {
      alert("You cannot delete yourself.");
      return;
    }
    setConfirmationModalOpen(true);
  }, [currentUser, user]);

  const confirmDeleteUser = useCallback(async () => {
    if (!user) return;

    try {
      await axios.delete(`http://localhost:8080/api/users/${user.userId}`);
      fetchUsers();
      onClose();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }, [user, fetchUsers, onClose]);

  const handlePassChange = (e) => {
    const { name, value } = e.target;
    setSelectedPass(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSavePass = async () => {
    if (!selectedPass) return;

    try {
      await axios.put(`http://localhost:8080/api/passes/${selectedPass.passId}`, selectedPass);
      alert("Parking pass updated successfully.");
    } catch (error) {
      console.error('Error updating parking pass:', error);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="First Name"
            type="text"
            fullWidth
            name="firstName"
            value={user?.firstName || ''}
            onChange={onChange}
          />
          <TextField
            margin="dense"
            label="Last Name"
            type="text"
            fullWidth
            name="lastName"
            value={user?.lastName || ''}
            onChange={onChange}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            name="email"
            value={user?.email || ''}
            onChange={onChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={user?.role || ''}
              onChange={onChange}
              label="Role"
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="employee">Employee</MenuItem>
            </Select>
          </FormControl>
          {selectedPass && (
            <>
              <Typography variant="h6" gutterBottom>Parking Pass</Typography>
              <TextField
                margin="dense"
                label="Expiry Date"
                type="date"
                fullWidth
                name="expiryDate"
                value={selectedPass.expiryDate}
                onChange={handlePassChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <Button onClick={handleSavePass} color="primary">Save Pass</Button>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">Cancel</Button>
          <Button onClick={onSave} color="primary">Save</Button>
          <Button onClick={handleDeleteUser} color="secondary">Delete</Button>
        </DialogActions>
      </Dialog>
      <ConfirmationModal
        open={confirmationModalOpen}
        onClose={() => setConfirmationModalOpen(false)}
        onConfirm={confirmDeleteUser}
        message="Are you sure you want to delete this user?"
      />
    </>
  );
};

export default EditUserModal;
