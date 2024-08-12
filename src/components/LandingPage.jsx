import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';
import LowesLogo from '../assets/lowes-logo.png';

const LandingPage = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleLogin = (user) => {
    localStorage.setItem('loggedInUser', JSON.stringify(user));
    if (user.role === 'admin') {
      navigate('/admin-dashboard');
    } else {
      navigate('/employee-dashboard');
    }
  };

  const filteredUsers = users.filter(
    (user) => ['Jason', 'Michael', 'Emily'].includes(user.firstName)
  );

  return (
    <div className="landing-page">
      <header className="header">
        <img src={LowesLogo} alt="Lowe's Logo" className="logo" />
        <h1>Welcome to Lowe's Parking Management</h1>
        <p>Manage your parking efficiently and effortlessly.</p>
      </header>

      <section className="login-section">
        <h2>Select a User to Login</h2>
        <div className="login-buttons">
          {filteredUsers && filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleLogin(user)}
                className="login-button"
              >
                {user.firstName} {user.lastName}
              </button>
            ))
          ) : (
            <p>Loading users...</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
