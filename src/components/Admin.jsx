import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Container, Typography, List, ListItem, ListItemText, Button, Divider, CircularProgress } from '@mui/material';
import EditUserModal from './EditUserModal';
import AddUserModal from './AddUserModal';

const Admin = ({ onUpdateGateStatus, onLogout, currentUser }) => {
    const [users, setUsers] = useState([]);
    const [gates, setGates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editUser, setEditUser] = useState(null);
    const [addUserModalOpen, setAddUserModalOpen] = useState(false);
    const [addUser, setAddUser] = useState({ firstName: '', lastName: '', email: '', role: 'employee' });

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Failed to fetch users.');
        }
    };

    useEffect(() => {
        const fetchUsersAndGates = async () => {
            try {
                const [gateResponse] = await Promise.all([
                    axios.get('http://localhost:8080/api/gates')
                ]);
                setGates(gateResponse.data);
                await fetchUsers();
                setLoading(false);
            } catch (error) {
                console.error('Error fetching users or gates:', error);
                setError('Failed to fetch users or gates.');
                setLoading(false);
            }
        };

        fetchUsersAndGates();
    }, []);

    const toggleGateStatus = useCallback(async (gateId, currentStatus) => {
        try {
            const response = await axios.put(`http://localhost:8080/api/gates/${gateId}`, { isOperational: !currentStatus });
            const updatedGate = response.data;
            setGates(prevGates => prevGates.map(gate => gate.gateId === gateId ? updatedGate : gate));
            onUpdateGateStatus(updatedGate);
        } catch (error) {
            console.error('Error updating gate status:', error);
            setError('Failed to update gate status.');
        }
    }, [onUpdateGateStatus]);

    const handleEditUserClick = useCallback((user) => {
        setEditUser(user);
    }, []);

    const handleCloseDialog = useCallback(() => {
        setEditUser(null);
        setAddUserModalOpen(false);
        setAddUser({ firstName: '', lastName: '', email: '', role: 'employee' });
    }, []);

    const handleSaveUser = useCallback(async () => {
        try {
            await axios.put(`http://localhost:8080/api/users/${editUser.userId}`, editUser);
            await fetchUsers();
            setEditUser(null);
        } catch (error) {
            console.error('Error saving user:', error);
            setError('Failed to save user.');
        }
    }, [editUser]);

    const handleAddUser = useCallback(async () => {
        try {
            const response = await axios.post('http://localhost:8080/api/users', addUser);
            setUsers(prevUsers => [...prevUsers, response.data]);
            setAddUserModalOpen(false);
            setAddUser({ firstName: '', lastName: '', email: '', role: 'employee' });
        } catch (error) {
            console.error('Error adding user:', error);
            setError('Failed to add user.');
        }
    }, [addUser]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setEditUser(prevState => ({ ...prevState, [name]: value }));
    }, []);

    const handleAddUserChange = useCallback((e) => {
        const { name, value } = e.target;
        setAddUser(prevState => ({ ...prevState, [name]: value }));
    }, []);

    const memoizedUsers = useMemo(() => users.map(user => (
      <ListItem button onClick={() => handleEditUserClick(user)} key={user.userId} divider>
          <ListItemText
            primary={`${user.firstName} ${user.lastName}`}
            secondary={`Email: ${user.email}, Role: ${user.role}`}
          />
      </ListItem>
    )), [users, handleEditUserClick]);

    const memoizedGates = useMemo(() => gates.map(gate => (
      <ListItem key={gate.gateId} divider>
          <ListItemText primary={`${gate.gateName} - ${gate.isOperational ? 'Open' : 'Closed'}`} />
          <Button
            variant="contained"
            color={gate.isOperational ? 'secondary' : 'primary'}
            onClick={() => toggleGateStatus(gate.gateId, gate.isOperational)}
          >
              {gate.isOperational ? 'Close' : 'Open'}
          </Button>
      </ListItem>
    )), [gates, toggleGateStatus]);

    return (
      <Container>
          <Typography variant="h4" gutterBottom>Admin Page</Typography>
          <Button onClick={onLogout} variant="contained" color="primary" style={{ marginBottom: '20px' }}>
              Home
          </Button>
          <Button onClick={() => setAddUserModalOpen(true)} variant="contained" color="secondary" style={{ marginBottom: '20px' }}>
              Add User
          </Button>
          {error && <Typography color="error">{error}</Typography>}
          {loading ? (
            <CircularProgress />
          ) : (
            <>
                <Typography variant="h6" gutterBottom>Manage Users</Typography>
                <List style={{ maxHeight: 400, overflow: 'auto' }}>
                    {memoizedUsers}
                </List>
                <Divider style={{ margin: '20px 0' }} />
                <Typography variant="h6" gutterBottom>Manage Gates</Typography>
                <List>
                    {memoizedGates}
                </List>
            </>
          )}
          <EditUserModal
            open={Boolean(editUser)}
            onClose={handleCloseDialog}
            user={editUser}
            onSave={handleSaveUser}
            onChange={handleChange}
            currentUser={currentUser}
            fetchUsers={fetchUsers}
          />
          <AddUserModal
            open={addUserModalOpen}
            onClose={handleCloseDialog}
            user={addUser}
            onSave={handleAddUser}
            onChange={handleAddUserChange}
          />
      </Container>
    );
};

export default Admin;
