// src/components/LandingPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
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
    sessionStorage.setItem('loggedInUser', JSON.stringify(user));
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
    <PageContainer>
      <Header>
        <Logo src={LowesLogo} alt="Lowe's Logo" />
        <Title>Welcome to Lowe's Parking Management</Title>
        <Subtitle>Manage your parking efficiently and effortlessly.</Subtitle>
      </Header>

      <LoginSection>
        <SectionTitle>Select a User to Login</SectionTitle>
        <LoginButtons>
          {filteredUsers && filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <LoginButton key={user.id} onClick={() => handleLogin(user)}>
                {user.firstName} {user.lastName}
              </LoginButton>
            ))
          ) : (
            <LoadingMessage>Loading users...</LoadingMessage>
          )}
        </LoginButtons>
      </LoginSection>
    </PageContainer>
  );
};

const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
    background-color: #f4f4f9;
    height: 97vh;
    max-width: 1000px; /* Ensure this matches the width in EmployeeDashboardDesktop */
    margin: 0 auto; /* Center the container horizontally */
`;

const Header = styled.header`
  text-align: center;
  padding: 20px;
  background-color: #004792;
  color: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
    max-height: 300px;
`;

const Logo = styled.img`
  max-width: 150px;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #e0e0eb;
`;

const LoginSection = styled.section`
  text-align: center;
  margin-top: 20px;
  width: 100%;
  max-width: 600px;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 20px;
  color: #33334d;
`;

const LoginButtons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LoginButton = styled.button`
  background-color: #004792;
  color: #ffffff;
  border: none;
  padding: 15px 30px;
  margin: 10px;
  cursor: pointer;
  border-radius: 8px;
  font-size: 1.1rem;
  width: 100%;
  max-width: 300px;
  transition: background-color 0.3s ease, transform 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
  }

  &:active {
    background-color: #003366;
    transform: translateY(0);
  }
`;

const LoadingMessage = styled.p`
  font-size: 1.2rem;
  color: #33334d;
`;

export default LandingPage;
