import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, List, ListItem, ListItemText, Button, Divider, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

const Admin = ({ onUpdateGateStatus, onLogout }) => {
    const [users, setUsers] = useState([]);
    const [gates, setGates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editUser, setEditUser] = useState(null);
    const [addUser, setAddUser] = useState(false);
    const [selectedPass, setSelectedPass] = useState(null);

    useEffect(() => {
        const fetchUsersAndGates = async () => {
            try {
                const [userResponse, gateResponse] = await Promise.all([
                    axios.get('http://localhost:8080/api/users'),
                    axios.get('http://localhost:8080/api/gates')
                ]);
                setUsers(userResponse.data);
                setGates(gateResponse.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching users or gates:', error);
                setError('Failed to fetch users or gates.');
                setLoading(false);
            }
        };

        fetchUsersAndGates();
    }, []);

    const toggleGateStatus = async (gateId, currentStatus) => {
        try {
            const response = await axios.put(`http://localhost:8080/api/gates/${gateId}`, { isOperational: !currentStatus });
            const updatedGate = response.data;
            setGates(gates.map(gate => gate.gateId === gateId ? updatedGate : gate));
            onUpdateGateStatus(updatedGate);
        } catch (error) {
            console.error('Error updating gate status:', error);
            setError('Failed to update gate status.');
        }
    };

    const handleEditUserClick = (user) => {
        setEditUser(user);
    };

    const handleCloseDialog = () => {
        setEditUser(null);
        setAddUser(false);
        setSelectedPass(null);
    };

    const handleSaveUser = async () => {
        try {
            await axios.put(`http://localhost:8080/api/users/${editUser.userId}`, editUser);
            setUsers(users.map(user => user.userId === editUser.userId ? editUser : user));
            setEditUser(null);
        } catch (error) {
            console.error('Error saving user:', error);
            setError('Failed to save user.');
        }
    };

    const handleAddUser = async () => {
        try {
            const response = await axios.post('http://localhost:8080/api/users', addUser);
            setUsers([...users, response.data]);
            setAddUser(false);
        } catch (error) {
            console.error('Error adding user:', error);
            setError('Failed to add user.');
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await axios.delete(`http://localhost:8080/api/users/${userId}`);
            setUsers(users.filter(user => user.userId !== userId));
        } catch (error) {
            console.error('Error deleting user:', error);
            setError('Failed to delete user.');
        }
    };

    const handlePassClick = (pass) => {
        setSelectedPass(pass);
    };

    const handleRenewPass = async () => {
        try {
            await axios.put(`http://localhost:8080/api/passes/${selectedPass.passId}/renew`);
            setSelectedPass(null);
        } catch (error) {
            console.error('Error renewing pass:', error);
            setError('Failed to renew pass.');
        }
    };

    const handleRevokePass = async () => {
        try {
            await axios.delete(`http://localhost:8080/api/passes/${selectedPass.passId}`);
            setSelectedPass(null);
        } catch (error) {
            console.error('Error revoking pass:', error);
            setError('Failed to revoke pass.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditUser(prevState => ({ ...prevState, [name]: value }));
    };

    const handleAddUserChange = (e) => {
        const { name, value } = e.target;
        setAddUser(prevState => ({ ...prevState, [name]: value }));
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>Admin Page</Typography>
            <Button onClick={onLogout} variant="contained" color="primary" style={{ marginBottom: '20px' }}>
                Home
            </Button>
            <Button onClick={() => setAddUser(true)} variant="contained" color="secondary" style={{ marginBottom: '20px' }}>
                Add User
            </Button>
            {error && <Typography color="error">{error}</Typography>}
            {loading ? (
                <CircularProgress />
            ) : (
                <>
                    <Typography variant="h6" gutterBottom>Manage Users</Typography>
                    <List style={{ maxHeight: 400, overflow: 'auto' }}>
                        {users.map(user => (
                            <ListItem button onClick={() => handleEditUserClick(user)} key={user.userId} divider>
                                <ListItemText
                                    primary={`${user.firstName} ${user.lastName}`}
                                    secondary={`Email: ${user.email}, Role: ${user.role}`}
                                />
                                <Button onClick={() => handleDeleteUser(user.userId)} color="secondary">Delete</Button>
                            </ListItem>
                        ))}
                    </List>
                    <Divider style={{ margin: '20px 0' }} />
                    <Typography variant="h6" gutterBottom>Manage Gates</Typography>
                    <List>
                        {gates.map(gate => (
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
                        ))}
                    </List>
                </>
            )}
            {editUser && (
                <Dialog open={Boolean(editUser)} onClose={handleCloseDialog}>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogContent>
                        <TextField
                            margin="dense"
                            label="First Name"
                            type="text"
                            fullWidth
                            name="firstName"
                            value={editUser.firstName}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="dense"
                            label="Last Name"
                            type="text"
                            fullWidth
                            name="lastName"
                            value={editUser.lastName}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="dense"
                            label="Email"
                            type="email"
                            fullWidth
                            name="email"
                            value={editUser.email}
                            onChange={handleChange}
                        />
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Role</InputLabel>
                            <Select
                                name="role"
                                value={editUser.role}
                                onChange={handleChange}
                                label="Role"
                            >
                                <MenuItem value="admin">Admin</MenuItem>
                                <MenuItem value="employee">Employee</MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} color="primary">Cancel</Button>
                        <Button onClick={handleSaveUser} color="primary">Save</Button>
                    </DialogActions>
                </Dialog>
            )}
            {addUser && (
                <Dialog open={Boolean(addUser)} onClose={handleCloseDialog}>
                    <DialogTitle>Add User</DialogTitle>
                    <DialogContent>
                        <TextField
                            margin="dense"
                            label="First Name"
                            type="text"
                            fullWidth
                            name="firstName"
                            value={addUser.firstName}
                            onChange={handleAddUserChange}
                        />
                        <TextField
                            margin="dense"
                            label="Last Name"
                            type="text"
                            fullWidth
                            name="lastName"
                            value={addUser.lastName}
                            onChange={handleAddUserChange}
                        />
                        <TextField
                            margin="dense"
                            label="Email"
                            type="email"
                            fullWidth
                            name="email"
                            value={addUser.email}
                            onChange={handleAddUserChange}
                        />
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Role</InputLabel>
                            <Select
                                name="role"
                                value={addUser.role}
                                onChange={handleAddUserChange}
                                label="Role"
                            >
                                <MenuItem value="admin">Admin</MenuItem>
                                <MenuItem value="employee">Employee</MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} color="primary">Cancel</Button>
                        <Button onClick={handleAddUser} color="primary">Add</Button>
                    </DialogActions>
                </Dialog>
            )}
            {selectedPass && (
                <Dialog open={Boolean(selectedPass)} onClose={handleCloseDialog}>
                    <DialogTitle>Manage Parking Pass</DialogTitle>
                    <DialogContent>
                        <Typography>Pass ID: {selectedPass.passId}</Typography>
                        <Typography>Issue Date: {selectedPass.issueDate}</Typography>
                        <Typography>Expiry Date: {selectedPass.expiryDate}</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} color="primary">Cancel</Button>
                        <Button onClick={handleRenewPass} color="primary">Renew</Button>
                        <Button onClick={handleRevokePass} color="secondary">Revoke</Button>
                    </DialogActions>
                </Dialog>
            )}
        </Container>
    );
};

export default Admin;