import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EditUserModal from '../modals/EditUserModal';
import AddUserModal from '../modals/AddUserModal';
import DeleteUserModal from '../modals/DeleteUserModal';

const AdminDashboard = () => {
  const [gates, setGates] = useState([]);
  const [users, setUsers] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gatesResponse, usersResponse] = await Promise.all([
          fetch('http://localhost:8080/api/gates'),
          fetch('http://localhost:8080/api/users')
        ]);

        const gatesData = await gatesResponse.json();
        const usersData = await usersResponse.json();

        setGates(gatesData);
        setUsers(usersData.filter(user => user.role !== 'admin'));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => navigate('/');

  const handleGateToggle = async (id, currentStatus) => {
    try {
      const response = await fetch(`http://localhost:8080/api/gates/${id}?isOperational=${!currentStatus}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setGates(gates.map(gate => gate.id === id ? { ...gate, operational: !currentStatus } : gate));
      } else {
        console.error('Error updating gate status');
      }
    } catch (error) {
      console.error('Error updating gate status:', error);
    }
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setShowEditModal(true);
  };

  const handleAddUser = () => setShowAddModal(true);

  const handleDeleteUser = (user) => {
    setCurrentUser(user);
    setShowDeleteModal(true);
  };

  const saveEditedUser = async (editedUser) => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${editedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedUser),
      });

      if (response.ok) {
        setUsers(users.map(user => user.id === editedUser.id ? editedUser : user));
      } else {
        console.error('Error saving user');
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const addNewUser = async (newUser) => {
    try {
      const response = await fetch('http://localhost:8080/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        const savedUser = await response.json();
        setUsers([...users, savedUser]);
      } else {
        console.error('Error adding user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const deleteUser = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
      } else {
        console.error('Error deleting user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h1>Admin Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>

      <h2>Gates</h2>
      {gates.map(gate => (
        <div key={gate.id} style={{ margin: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ marginRight: '10px' }}>Gate: {gate.gateName}</span>
          <span style={{ marginRight: '10px' }}>Status: {gate.operational ? 'Open' : 'Closed'}</span>
          <button onClick={() => handleGateToggle(gate.id, gate.operational)}>
            {gate.operational ? 'Close' : 'Open'}
          </button>
        </div>
      ))}

      <h2>Users</h2>
      {users.map(user => (
        <div key={user.id} style={{ margin: '10px' }}>
          <span>{user.firstName} {user.lastName}</span>
          <button onClick={() => handleEditUser(user)}>Edit</button>
          <button onClick={() => handleDeleteUser(user)}>Delete</button>
        </div>
      ))}
      <button onClick={handleAddUser}>Add New User</button>

      {showEditModal && (
        <EditUserModal
          user={currentUser}
          onClose={() => setShowEditModal(false)}
          onSave={saveEditedUser}
        />
      )}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onSave={addNewUser}
        />
      )}
      {showDeleteModal && (
        <DeleteUserModal
          user={currentUser}
          onClose={() => setShowDeleteModal(false)}
          onDelete={deleteUser}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
