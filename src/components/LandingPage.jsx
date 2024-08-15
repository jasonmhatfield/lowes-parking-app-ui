import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import LowesLogo from '../assets/lowes-logo.png';
import { FaMobileAlt, FaDesktop } from 'react-icons/fa';

const LandingPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users');
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleLogin = (user) => {
    sessionStorage.setItem('loggedInUser', JSON.stringify(user));
    sessionStorage.setItem('viewMode', isMobile ? 'mobile' : 'desktop');
    if (user.role === 'admin') {
      navigate('/admin-dashboard');
    } else {
      navigate('/employee-dashboard');
    }
  };

  const filteredUsers = users.filter(
    (user) => isMobile ? ['Mark', 'Emily'].includes(user.firstName) : ['Admin', 'Mark', 'Emily'].includes(user.firstName)
  );

  const toggleViewMode = () => {
    setIsMobile(!isMobile);
  };

  return (
    <PageContainer data-testid="landing-page">
      <ViewToggle onClick={toggleViewMode}>
        {isMobile ? <FaDesktop /> : <FaMobileAlt />}
      </ViewToggle>
      <ContentWrapper isMobile={isMobile}>
        <Header>
          <Logo src={LowesLogo} alt="Lowe's Logo" data-testid="lowes-logo" />
          <Title>Welcome to Lowe's <span><br /></span>Parking Management</Title>
          <Subtitle>Manage your parking efficiently and effortlessly.</Subtitle>
        </Header>

        <LoginSection>
          <SectionTitle>Select a User to Login</SectionTitle>
          {loading ? (
            <LoadingMessage data-testid="loading-message">Loading users...</LoadingMessage>
          ) : (
            <LoginButtons>
              {filteredUsers.map((user) => (
                <LoginButton key={user.id} onClick={() => handleLogin(user)} data-testid={`login-button-${user.firstName.toLowerCase()}`}>
                  {user.firstName} {user.lastName}
                </LoginButton>
              ))}
            </LoginButtons>
          )}
        </LoginSection>
      </ContentWrapper>
    </PageContainer>
  );
};

// Styled components (including new and modified ones)
const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background-color: #f4f4f9;
    min-height: 100vh;
    position: relative;
`;

const ViewToggle = styled.button`
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #004792;
    color: white;
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
        background-color: #0056b3;
    }
`;

const ContentWrapper = styled.div`
  background-color: white;
  border-radius: ${props => props.isMobile ? '20px' : '0'};
  box-shadow: ${props => props.isMobile ? '0 0 0 10px #333, 0 0 0 13px #666' : 'none'};
  overflow: hidden;
  width: ${props => props.isMobile ? '375px' : '100%'};
  height: ${props => props.isMobile ? '667px' : 'auto'};
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 1s ease-in;
`;

const Header = styled.header`
    text-align: center;
    padding: 20px;
    background-color: #004792;
    color: #ffffff;
`;

const Logo = styled.img`
    max-width: 100px;
    margin-bottom: 20px;
`;

const Title = styled.h1`
    font-size: 1.8rem;
    font-weight: bold;
`;

const Subtitle = styled.p`
    font-size: 1rem;
    color: #e0e0eb;
`;

const LoginSection = styled.section`
    text-align: center;
    padding: 20px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const SectionTitle = styled.h2`
    font-size: 1.5rem;
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
  padding: 15px;
  margin: 10px 0;
  cursor: pointer;
  border-radius: 8px;
  font-size: 1rem;
  width: 100%;
  max-width: 250px;
  transition: background-color 0.3s ease, transform 0.3s ease;

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
  font-size: 1rem;
  color: #33334d;
`;

export default LandingPage;