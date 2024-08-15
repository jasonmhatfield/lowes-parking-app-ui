import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import LandingPage from '../../components/LandingPage';
import { useNavigate } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

describe('LandingPage', () => {
  let mockNavigate;

  beforeEach(() => {
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    fetch.resetMocks();

    // Mock sessionStorage
    const mockSessionStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
    };
    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
    });
  });

  test('renders landing page with logo, title, and subtitle', () => {
    render(<LandingPage />);

    expect(screen.getByTestId('lowes-logo')).toBeInTheDocument();
    expect(screen.getByText(/Welcome to Lowe's/)).toBeInTheDocument();
    expect(screen.getByText(/Manage your parking efficiently and effortlessly/)).toBeInTheDocument();
  });

  test('displays loading message while fetching users', () => {
    render(<LandingPage />);

    expect(screen.getByTestId('loading-message')).toHaveTextContent('Loading users...');
  });

  test('renders login buttons for filtered users after loading in desktop mode', async () => {
    const users = [
      { id: 1, firstName: 'Admin', lastName: 'User', role: 'admin' },
      { id: 2, firstName: 'Mark', lastName: 'Jess', role: 'employee' },
      { id: 3, firstName: 'Emily', lastName: 'Jones', role: 'employee' },
      { id: 4, firstName: 'John', lastName: 'Doe', role: 'employee' },
    ];

    fetch.mockResponseOnce(JSON.stringify(users));

    render(<LandingPage />);

    await waitFor(() => {
      expect(screen.getByTestId('login-button-admin')).toBeInTheDocument();
      expect(screen.getByTestId('login-button-mark')).toBeInTheDocument();
      expect(screen.getByTestId('login-button-emily')).toBeInTheDocument();
      expect(screen.queryByTestId('login-button-john')).not.toBeInTheDocument();
    });
  });

  test('renders login buttons for filtered users after loading in mobile mode', async () => {
    window.sessionStorage.getItem.mockReturnValue('mobile');

    const users = [
      { id: 1, firstName: 'Admin', lastName: 'User', role: 'admin' },
      { id: 2, firstName: 'Mark', lastName: 'Jess', role: 'employee' },
      { id: 3, firstName: 'Emily', lastName: 'Jones', role: 'employee' },
      { id: 4, firstName: 'John', lastName: 'Doe', role: 'employee' },
    ];

    fetch.mockResponseOnce(JSON.stringify(users));

    render(<LandingPage />);

    await waitFor(() => {
      expect(screen.queryByTestId('login-button-admin')).not.toBeInTheDocument();
      expect(screen.getByTestId('login-button-mark')).toBeInTheDocument();
      expect(screen.getByTestId('login-button-emily')).toBeInTheDocument();
      expect(screen.queryByTestId('login-button-john')).not.toBeInTheDocument();
    });
  });

  test('handles login button click and navigates based on user role', async () => {
    const users = [
      { id: 1, firstName: 'Admin', lastName: 'User', role: 'admin' },
      { id: 2, firstName: 'Mark', lastName: 'Jess', role: 'employee' },
    ];

    fetch.mockResponseOnce(JSON.stringify(users));

    render(<LandingPage />);

    await waitFor(() => screen.getByTestId('login-button-admin'));

    const adminButton = screen.getByTestId('login-button-admin');
    fireEvent.click(adminButton);
    expect(mockNavigate).toHaveBeenCalledWith('/admin-dashboard');
    expect(window.sessionStorage.setItem).toHaveBeenCalledWith('loggedInUser', JSON.stringify(users[0]));

    const markButton = screen.getByTestId('login-button-mark');
    fireEvent.click(markButton);
    expect(mockNavigate).toHaveBeenCalledWith('/employee-dashboard');
    expect(window.sessionStorage.setItem).toHaveBeenCalledWith('loggedInUser', JSON.stringify(users[1]));
  });

  test('handles error when failing to fetch users', async () => {
    console.error = jest.fn();
    fetch.mockReject(new Error('Failed to fetch'));

    render(<LandingPage />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error fetching users:', expect.any(Error));
    });

    expect(screen.queryByTestId('login-button-admin')).not.toBeInTheDocument();
    expect(screen.queryByTestId('login-button-mark')).not.toBeInTheDocument();
    expect(screen.queryByTestId('login-button-emily')).not.toBeInTheDocument();
  });

  test('toggles between mobile and desktop view', async () => {
    const users = [
      { id: 1, firstName: 'Admin', lastName: 'User', role: 'admin' },
      { id: 2, firstName: 'Mark', lastName: 'Jess', role: 'employee' },
      { id: 3, firstName: 'Emily', lastName: 'Jones', role: 'employee' },
    ];

    fetch.mockResponseOnce(JSON.stringify(users));

    render(<LandingPage />);

    await waitFor(() => screen.getByTestId('login-button-admin'));

    const viewToggleButton = screen.getByRole('button', { name: '' });

    // Toggle to mobile view
    fireEvent.click(viewToggleButton);
    expect(window.sessionStorage.setItem).toHaveBeenCalledWith('viewMode', 'mobile');
    expect(screen.queryByTestId('login-button-admin')).not.toBeInTheDocument();
    expect(screen.getByTestId('login-button-mark')).toBeInTheDocument();
    expect(screen.getByTestId('login-button-emily')).toBeInTheDocument();

    // Toggle back to desktop view
    fireEvent.click(viewToggleButton);
    expect(window.sessionStorage.setItem).toHaveBeenCalledWith('viewMode', 'desktop');
    expect(screen.getByTestId('login-button-admin')).toBeInTheDocument();
    expect(screen.getByTestId('login-button-mark')).toBeInTheDocument();
    expect(screen.getByTestId('login-button-emily')).toBeInTheDocument();
  });

  test('initializes with mobile view when saved in session storage', async () => {
    window.sessionStorage.getItem.mockReturnValue('mobile');

    const users = [
      { id: 1, firstName: 'Admin', lastName: 'User', role: 'admin' },
      { id: 2, firstName: 'Mark', lastName: 'Jess', role: 'employee' },
      { id: 3, firstName: 'Emily', lastName: 'Jones', role: 'employee' },
    ];

    fetch.mockResponseOnce(JSON.stringify(users));

    render(<LandingPage />);

    await waitFor(() => {
      expect(screen.queryByTestId('login-button-admin')).not.toBeInTheDocument();
      expect(screen.getByTestId('login-button-mark')).toBeInTheDocument();
      expect(screen.getByTestId('login-button-emily')).toBeInTheDocument();
    });

    expect(screen.getByTestId('landing-page')).toHaveClass('mobile');
  });
});