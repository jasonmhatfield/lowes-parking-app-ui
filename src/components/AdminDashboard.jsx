import React, { useState } from 'react';
import ManageGatesModal from '../modals/ManageGatesModal';
import ManageParkingSpacesModal from '../modals/ManageParkingSpacesModal';
import ManageUsersModal from '../modals/ManageUsersModal';
import AddUserModal from '../modals/AddUserModal';
import Button from './Button';
import { useNavigate } from "react-router-dom";
import '../styles/AdminDashboard.css';
import '../styles/Button.css';
import '../styles/Modal.css';
import '../styles/ManageParkingSpacesModal.css';
import '../styles/ManageGatesModal.css';

const AdminDashboard = () => {
  const [showGatesModal, setShowGatesModal] = useState(false);
  const [showParkingSpacesModal, setShowParkingSpacesModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => navigate('/');

  const handleAddUser = async (newUser) => {
    try {
      const response = await fetch('http://localhost:8080/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        setShowAddUserModal(false);
      } else {
        console.error('Error adding user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  return (
    <div className="admin-dashboard">
      <h1 className="title">Admin Dashboard</h1>
      <Button onClick={handleLogout} className="logout-button">Logout</Button>

      <div className="dashboard-actions">
        <Button onClick={() => setShowGatesModal(true)} className="action-button">Manage Gates</Button>
        <Button onClick={() => setShowParkingSpacesModal(true)} className="action-button">Manage Parking Spaces</Button>
        <Button onClick={() => setShowUsersModal(true)} className="action-button">Manage Users</Button>
        <Button onClick={() => setShowAddUserModal(true)} className="action-button">Add User</Button>
      </div>

      {showGatesModal && <ManageGatesModal onClose={() => setShowGatesModal(false)} />}
      {showParkingSpacesModal && <ManageParkingSpacesModal onClose={() => setShowParkingSpacesModal(false)} />}
      {showUsersModal && <ManageUsersModal onClose={() => setShowUsersModal(false)} />}
      {showAddUserModal && <AddUserModal onClose={() => setShowAddUserModal(false)} onSave={handleAddUser} />}
    </div>
  );
};

export default AdminDashboard;
