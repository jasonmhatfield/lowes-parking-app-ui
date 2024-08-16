import React, { useState } from 'react';
import ManageGatesModal from '../modals/ManageGatesModal';
import ManageParkingSpacesModal from '../modals/ManageParkingSpacesModal';
import ManageUsersModal from '../modals/ManageUsersModal';
import AddUserModal from '../modals/AddUserModal';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [showGatesModal, setShowGatesModal] = useState(false); // State to control ManageGatesModal visibility
  const [showParkingSpacesModal, setShowParkingSpacesModal] = useState(false); // State to control ManageParkingSpacesModal visibility
  const [showUsersModal, setShowUsersModal] = useState(false); // State to control ManageUsersModal visibility
  const [showAddUserModal, setShowAddUserModal] = useState(false); // State to control AddUserModal visibility
  const navigate = useNavigate(); // Hook to navigate between routes

  const handleLogout = () => navigate('/'); // Redirect to the home page on logout

  const handleAddUser = async (newUser) => {
    try {
      const response = await fetch('http://localhost:8080/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        setShowAddUserModal(false); // Close modal if user is added successfully
      } else {
        console.error('Error adding user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.dashboardContainer}>
        <h1 style={styles.title}>Admin Dashboard</h1>

        <div style={styles.dashboardActions}>
          <button style={styles.actionButton} onClick={() => setShowGatesModal(true)}>Manage Gates</button> {/* Show ManageGatesModal */}
          <button style={styles.actionButton} onClick={() => setShowParkingSpacesModal(true)}>Manage Parking Spaces</button> {/* Show ManageParkingSpacesModal */}
          <button style={styles.actionButton} onClick={() => setShowUsersModal(true)}>Manage Users</button> {/* Show ManageUsersModal */}
          <button style={styles.actionButton} onClick={() => setShowAddUserModal(true)}>Add User</button> {/* Show AddUserModal */}
          <button style={styles.logoutButton} onClick={handleLogout}>Logout</button> {/* Handle user logout */}
        </div>

        {showGatesModal && <ManageGatesModal onClose={() => setShowGatesModal(false)} />} {/* Conditional rendering of ManageGatesModal */}
        {showParkingSpacesModal && <ManageParkingSpacesModal onClose={() => setShowParkingSpacesModal(false)} />} {/* Conditional rendering of ManageParkingSpacesModal */}
        {showUsersModal && <ManageUsersModal onClose={() => setShowUsersModal(false)} />} {/* Conditional rendering of ManageUsersModal */}
        {showAddUserModal && <AddUserModal onClose={() => setShowAddUserModal(false)} onSave={handleAddUser} />} {/* Conditional rendering of AddUserModal */}
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex', // Centers the content
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#1a1a2e',
    overflow: 'auto',
  },
  dashboardContainer: {
    padding: '20px',
    background: '#1e1e2f',
    borderRadius: '12px',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.5)',
    color: '#ffffff',
    maxWidth: '400px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  title: {
    fontSize: '2.5rem',
    textAlign: 'center',
    marginBottom: '20px',
    color: '#ffffff',
  },
  dashboardActions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '30px',
  },
  actionButton: {
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.3s ease',
    fontSize: '1.2em',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
    marginBottom: '20px',
    width: '80%',
    padding: '15px 30px',
    backgroundColor: '#1976D2',
    color: '#fff',
  },
  actionButtonHover: {
    backgroundColor: '#0056b3',
    transform: 'translateY(-2px)',
  },
  logoutButton: {
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.3s ease',
    fontSize: '1em',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
    width: '70%',
    padding: '10px 20px',
    backgroundColor: '#ff4757',
    color: 'white',
  },
  logoutButtonHover: {
    backgroundColor: '#e04040',
    transform: 'translateY(-2px)',
  },
};

export default AdminDashboard;
