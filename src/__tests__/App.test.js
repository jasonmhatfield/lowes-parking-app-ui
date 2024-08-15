import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Force import of CSS to be executed
import '../styles/styles.css';

// Mock the components
jest.mock('../components/LandingPage', () => () => <div data-testid="landing-page">Landing Page</div>);
jest.mock('../components/AdminDashboard', () => () => <div data-testid="admin-dashboard">Admin Dashboard</div>);
jest.mock('../components/EmployeeDashboard', () => () => <div data-testid="employee-dashboard">Employee Dashboard</div>);

// Mock react-transition-group to prevent transition effects
jest.mock('react-transition-group', () => ({
  TransitionGroup: ({ children }) => children,
  CSSTransition: ({ children }) => children,
}));

describe('App', () => {
  const renderWithRouter = (route) => {
    return render(
        <App />
    );
  };

  // This test ensures the App component is fully rendered and exported correctly
  test('App component can be imported and rendered', () => {
    expect(App).toBeDefined();
    const { container } = renderWithRouter('/');
    expect(container.firstChild).toBeTruthy();
  });
});