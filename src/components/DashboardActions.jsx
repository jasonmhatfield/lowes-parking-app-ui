import React from 'react';
import Button from './Button';
import '../styles/DashboardActions.css';

const DashboardActions = ({ onManageGates, onManageParking, onManageUsers, onAddUser }) => (
  <div className="dashboard-actions">
    <Button onClick={onManageGates} className="action-button">Manage Gates</Button>
    <Button onClick={onManageParking} className="action-button">Manage Parking Spaces</Button>
    <Button onClick={onManageUsers} className="action-button">Manage Users</Button>
    <Button onClick={onAddUser} className="action-button">Add User</Button>
  </div>
);

export default DashboardActions;
