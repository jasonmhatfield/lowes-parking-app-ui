import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import { AlertProvider } from './context/AlertContext';

function App() {
  const [selectedUser, setSelectedUser] = useState(null);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handleLogout = () => {
    setSelectedUser(null);
  };

  return (
    <AlertProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              selectedUser ? (
                <Navigate to={selectedUser.role === 'admin' ? '/admin' : '/user'} />
              ) : (
                <LandingPage onSelectUser={handleUserSelect} />
              )
            }
          />
          <Route
            path="/admin"
            element={
              selectedUser && selectedUser.role === 'admin' ? (
                <AdminDashboard currentUser={selectedUser} onLogout={handleLogout} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/user"
            element={
              selectedUser && selectedUser.role !== 'admin' ? (
                <UserDashboard currentUser={selectedUser} onLogout={handleLogout} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </Router>
    </AlertProvider>
  );
}

export default App;
