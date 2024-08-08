import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LandingPage = ({ onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleUserSelect = (user) => {
    onSelectUser(user);
    navigate(user.role === 'admin' ? '/admin' : '/user');
  };

  return (
    <div>
      <h2>Select User to Log In</h2>
      {users.map(user => (
        <button key={user.id} onClick={() => handleUserSelect(user)}>
          {user.firstName} {user.lastName} - {user.role}
        </button>
      ))}
    </div>
  );
};

export default LandingPage;
