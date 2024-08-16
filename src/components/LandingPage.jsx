import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import LowesLogo from '../assets/lowes-logo.png';
import { FaMobileAlt, FaDesktop } from 'react-icons/fa';

const LandingPage = () => {
  const [users, setUsers] = useState([]); // State to store the list of users
  const [loading, setLoading] = useState(true); // State to track loading status
  const [isMobile, setIsMobile] = useState(() => {
    const savedViewMode = sessionStorage.getItem('viewMode');
    return savedViewMode === 'mobile'; // State to track whether the view is mobile
  });
  const navigate = useNavigate(); // Hook to navigate between routes

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users');
      const data = await response.json();
      setUsers(data); // Set the fetched users in state
      setLoading(false); // Set loading to false once data is fetched
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false); // Set loading to false even if there's an error
    }
  };

  useEffect(() => {
    fetchUsers(); // Fetch users when the component mounts
  }, []);

  const handleLogin = (user) => {
    sessionStorage.setItem('loggedInUser', JSON.stringify(user)); // Store the logged-in user in session storage
    if (user.role === 'admin') {
      navigate('/admin-dashboard'); // Navigate to admin dashboard if user is an admin
    } else {
      navigate('/employee-dashboard'); // Navigate to employee dashboard if user is not an admin
    }
  };

  const filteredUsers = users.filter(
    (user) => isMobile ? ['Mark', 'Emily'].includes(user.firstName) : ['Admin', 'Mark', 'Emily'].includes(user.firstName)
  ); // Filter users based on view mode (mobile or desktop)

  const toggleViewMode = () => {
    const newMode = !isMobile;
    setIsMobile(newMode); // Toggle between mobile and desktop views
    sessionStorage.setItem('viewMode', newMode ? 'mobile' : 'desktop'); // Save the new view mode
  };

  return (
    <DashboardContainer className={isMobile ? 'mobile' : ''} data-testid="landing-page">
      <ViewToggle onClick={toggleViewMode}>
        {isMobile ? <FaDesktop /> : <FaMobileAlt />}
      </ViewToggle>
      <ContentWrapper>
        <Header>
          <Logo src={LowesLogo} alt="Lowe's Logo" data-testid="lowes-logo" />
          <WelcomeMessage>Welcome to Lowe's Parking Management</WelcomeMessage> {/* Display welcome message */}
        </Header>

        <MainContent>
          <LoginSection>
            <SectionTitle>Select a User to Login</SectionTitle>
            {loading ? (
              <LoadingMessage data-testid="loading-message">Loading users...</LoadingMessage> // Show loading message
            ) : (
              <LoginButtons>
                {filteredUsers.map((user) => (
                  <LoginButton
                    key={user.id}
                    onClick={() => handleLogin(user)}
                    data-testid={`login-button-${user.firstName.toLowerCase()}`}
                  >
                    {user.firstName} {user.lastName} {/* Display user names */}
                  </LoginButton>
                ))}
              </LoginButtons>
            )}
          </LoginSection>
        </MainContent>

        <BottomSection>
          <Subtitle>Manage your parking efficiently and effortlessly.</Subtitle> {/* Display subtitle */}
        </BottomSection>
      </ContentWrapper>
    </DashboardContainer>
  );
};

const DashboardContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f4f4f9;
    height: 100vh;
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    overflow: hidden;
    transition: opacity 0.3s ease-in-out;

    &.mobile {
        background-color: #333;
        max-width: none;
    }
`;

const ContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
    transition: opacity 0.3s ease-in-out;
    background-color: #f4f4f9;

    .mobile & {
        width: 375px;
        height: 667px;
        border-radius: 30px;
        box-shadow: 0 0 0 10px #333, 0 0 0 13px #667;
        overflow: hidden;
    }
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
    z-index: 4;

    &:hover {
        background-color: #0056b3;
    }
`;

const Header = styled.header`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 20px;
    background-color: #004792;
    color: #ffffff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const Logo = styled.img`
    width: 100px;
    margin-bottom: 10px;
`;

const WelcomeMessage = styled.h1`
    font-size: 1.2rem;
    margin: 0;
    text-align: center;
    color: #ffffff;

    .mobile & {
        font-size: 1rem;
    }
`;

const MainContent = styled.main`
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    overflow-y: auto;
    width: 100%;
    overflow-x: hidden;
    transition: all 0.3s ease-in-out;
    padding: 20px;
    box-sizing: border-box;

    .mobile & {
        padding: 10px;
    }
`;

const LoginSection = styled.section`
    text-align: center;
    padding: 20px;
    width: 100%;
`;

const SectionTitle = styled.h2`
    font-size: 1.5rem;
    margin-bottom: 20px;
    color: #00509e;

    .mobile & {
        font-size: 1.2rem;
        margin-bottom: 15px;
    }
`;

const LoginButtons = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
`;

const LoginButton = styled.button`
    background-color: #0072ce;
    color: white;
    border: none;
    padding: 15px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    width: 90%;
    max-width: 250px;
    transition: background-color 0.3s ease, transform 0.3s ease;

    &:hover {
        background-color: #00509e;
        transform: translateY(-2px);
    }

    .mobile & {
        padding: 12px;
        font-size: 0.9rem;
    }
`;

const LoadingMessage = styled.p`
    font-size: 1rem;
    color: #00509e;
`;

const BottomSection = styled.div`
    background-color: #ffffff;
    padding: 10px;
    position: sticky;
    bottom: 0;
    z-index: 1;
    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
    width: 100%;
    box-sizing: border-box;
`;

const Subtitle = styled.p`
    font-size: 1rem;
    color: #00509e;
    text-align: center;

    .mobile & {
        font-size: 0.9rem;
    }
`;

export default LandingPage;
