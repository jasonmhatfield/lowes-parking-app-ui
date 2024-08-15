import React, { useState } from 'react';
import ManageGatesModal from '../modals/ManageGatesModal';
import ManageParkingSpacesModal from '../modals/ManageParkingSpacesModal';
import ManageUsersModal from '../modals/ManageUsersModal';
import AddUserModal from '../modals/AddUserModal';
import { useNavigate } from 'react-router-dom';
import '../styles/components/AdminDashboard.css';

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
    <div className="wrapper">
      <div className="dashboard-container">
        <h1 className="title">Admin Dashboard</h1>

        <div className="dashboard-actions">
          <button className="action-button" onClick={() => setShowGatesModal(true)}>Manage Gates</button>
          <button className="action-button" onClick={() => setShowParkingSpacesModal(true)}>Manage Parking Spaces</button>
          <button className="action-button" onClick={() => setShowUsersModal(true)}>Manage Users</button>
          <button className="action-button" onClick={() => setShowAddUserModal(true)}>Add User</button>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>

        {showGatesModal && <ManageGatesModal onClose={() => setShowGatesModal(false)} />}
        {showParkingSpacesModal && <ManageParkingSpacesModal onClose={() => setShowParkingSpacesModal(false)} />}
        {showUsersModal && <ManageUsersModal onClose={() => setShowUsersModal(false)} />}
        {showAddUserModal && <AddUserModal onClose={() => setShowAddUserModal(false)} onSave={handleAddUser} />}
      </div>
    </div>
  );
};

export default AdminDashboard;
