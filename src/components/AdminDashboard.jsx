import React, { useState } from 'react';
import ManageGatesModal from '../modals/ManageGatesModal';
import ManageParkingSpacesModal from '../modals/ManageParkingSpacesModal';
import ManageUsersModal from '../modals/ManageUsersModal';
import AddUserModal from '../modals/AddUserModal';
import { useNavigate } from "react-router-dom";
import styled from 'styled-components';

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
    <Wrapper>
      <DashboardContainer>
        <Title>Admin Dashboard</Title>

        <DashboardActions>
          <ActionButton onClick={() => setShowGatesModal(true)}>Manage Gates</ActionButton>
          <ActionButton onClick={() => setShowParkingSpacesModal(true)}>Manage Parking Spaces</ActionButton>
          <ActionButton onClick={() => setShowUsersModal(true)}>Manage Users</ActionButton>
          <ActionButton onClick={() => setShowAddUserModal(true)}>Add User</ActionButton>
          <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        </DashboardActions>

        {showGatesModal && <ManageGatesModal onClose={() => setShowGatesModal(false)} />}
        {showParkingSpacesModal && <ManageParkingSpacesModal onClose={() => setShowParkingSpacesModal(false)} />}
        {showUsersModal && <ManageUsersModal onClose={() => setShowUsersModal(false)} />}
        {showAddUserModal && <AddUserModal onClose={() => setShowAddUserModal(false)} onSave={handleAddUser} />}
      </DashboardContainer>
    </Wrapper>
  );
};

const Wrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #1a1a2e;
    overflow: auto; /* Allow scrolling if needed */
`;

const DashboardContainer = styled.div`
    padding: 20px;
    background: #1e1e2f;
    border-radius: 12px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
    color: #ffffff;
    max-width: 400px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
`;

const Title = styled.h1`
    font-size: 2.5rem;
    text-align: center;
    margin-bottom: 20px;
    color: #ffffff;
`;

const DashboardActions = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 30px;
`;

const ActionButton = styled.button`
    background-color: #1976D2;
    color: #fff;
    border: none;
    padding: 15px 30px;
    border-radius: 10px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease;
    font-size: 1.2em;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    margin-bottom: 20px;
    width: 80%;

    &:hover {
        background-color: #0056b3;
        transform: translateY(-2px);
    }
`;

const LogoutButton = styled.button`
    background-color: #ff4757;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease;
    font-size: 1em;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    width: 70%;

    &:hover {
        background-color: #e04040;
        transform: translateY(-2px);
    }
`;

export default AdminDashboard;
