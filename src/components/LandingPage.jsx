import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
    navigate(user.role === 'admin' ? '/admin-dashboard' : '/employee-dashboard');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20%' }}>
      <h1>Select a User to Login</h1>
      {users.length > 0 ? (
        users.map(user => (
          <button
            key={user.id}
            onClick={() => handleLogin(user)}
            style={{ display: 'block', margin: '10px auto' }}
          >
            {user.firstName} {user.lastName} ({user.role})
          </button>
        ))
      ) : (
        <p>Loading users...</p>
      )}
    </div>
  );
};

export default LandingPage;
