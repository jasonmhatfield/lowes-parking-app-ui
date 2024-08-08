import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddUserModal from '../modals/AddUserModal';
import EditUserModal from '../modals/EditUserModal';
import ConfirmationModal from '../modals/ConfirmationModal';
import { Button, IconButton, Tooltip } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, LockOpen as LockOpenIcon, Lock as LockIcon } from '@mui/icons-material';
import { useAlert } from '../context/AlertContext';

const AdminDashboard = ({ currentUser, onLogout }) => {
  const [gates, setGates] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchGates = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/gates');
        setGates(response.data);
      } catch (error) {
        console.error('Error fetching gates:', error);
        setError('Error fetching gates.');
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/users');
        setUsers(response.data.filter(user => user.role !== 'admin'));
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Error fetching users.');
      }
    };

    fetchGates();
    fetchUsers();
  }, []);

  const toggleGateStatus = async (gateId, currentStatus) => {
    try {
      const response = await axios.patch(`http://localhost:8080/api/gates/${gateId}`, null, {
        params: { isOperational: !currentStatus },
      });
      const updatedGate = response.data;
      setGates(prevGates => prevGates.map(gate => gate.id === gateId ? updatedGate : gate));
      if (!updatedGate.isOperational) {
        showAlert(`Gate ${updatedGate.gateName} is now closed.`);
      }
    } catch (error) {
      console.error('Failed to update gate status:', error);
      setError('Failed to update gate status.');
    }
  };

  const handleAddUser = async (user) => {
    try {
      const response = await axios.post('http://localhost:8080/api/users', user);
      setUsers([...users, response.data]);
    } catch (error) {
      console.error('Error adding user:', error);
      setError('Error adding user.');
    }
  };

  const handleEditUser = async (updatedUser) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/users/${updatedUser.id}`, updatedUser);
      setUsers(users.map(user => user.id === updatedUser.id ? response.data : user));
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Error updating user.');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:8080/api/users/${userId}`);
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Error deleting user.');
    }
  };

  const confirmDeleteUser = (user) => {
    setUserToDelete(user);
    setConfirmationModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      handleDeleteUser(userToDelete.id);
      setUserToDelete(null);
      setConfirmationModalOpen(false);
    }
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>Welcome, {currentUser.firstName} {currentUser.lastName}</p>
      <button onClick={onLogout}>Logout</button>

      <h3>Manage Parking Gates</h3>
      {error && <p>{error}</p>}
      {gates.map(gate => (
        <div key={gate.id}>
          <Tooltip title={gate.isOperational ? 'Close Gate' : 'Open Gate'}>
            <span>
              <Button
                onClick={() => toggleGateStatus(gate.id, gate.isOperational)}
                variant="contained"
                color={gate.isOperational ? "secondary" : "primary"}
              >
                {gate.isOperational ? <LockOpenIcon /> : <LockIcon />}
              </Button>
            </span>
          </Tooltip>
          <p>{gate.gateName}: {gate.isOperational ? 'Open' : 'Closed'}</p>
        </div>
      ))}

      <h3>Manage Users</h3>
      <Button variant="contained" color="primary" onClick={() => setAddUserModalOpen(true)}>Add User</Button>
      {users.map(user => (
        <div key={user.id}>
          <p>{user.firstName} {user.lastName}</p>
          <IconButton onClick={() => { setUserToEdit(user); setEditUserModalOpen(true); }}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => confirmDeleteUser(user)}>
            <DeleteIcon />
          </IconButton>
        </div>
      ))}

      <AddUserModal open={addUserModalOpen} onClose={() => setAddUserModalOpen(false)} onSave={handleAddUser} />
      {userToEdit && (
        <EditUserModal open={editUserModalOpen} onClose={() => setEditUserModalOpen(false)} onSave={handleEditUser} userToEdit={userToEdit} />
      )}
      <ConfirmationModal
        open={confirmationModalOpen}
        onClose={() => setConfirmationModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete ${userToDelete?.firstName} ${userToDelete?.lastName}?`}
      />
    </div>
  );
};

export default AdminDashboard;
