import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

  test('renders login buttons for filtered users after loading', async () => {
    const users = [
      { id: 1, firstName: 'Admin', lastName: 'User', role: 'employee' },
      { id: 2, firstName: 'Mark', lastName: 'Jess', role: 'admin' },
      { id: 3, firstName: 'Emily', lastName: 'Jones', role: 'employee' },
    ];

    fetch.mockResponseOnce(JSON.stringify(users));

    render(<LandingPage />);

    await waitFor(() => {
      expect(screen.getByTestId('login-button-admin')).toBeInTheDocument();
      expect(screen.getByTestId('login-button-mark')).toBeInTheDocument();
      expect(screen.getByTestId('login-button-emily')).toBeInTheDocument();
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

    const markButton = screen.getByTestId('login-button-mark');
    fireEvent.click(markButton);
    expect(mockNavigate).toHaveBeenCalledWith('/employee-dashboard');
  });

  test('displays an error message when failing to fetch users', async () => {
    fetch.mockReject(new Error('Failed to fetch'));

    render(<LandingPage />);

    await waitFor(() => expect(screen.getByText('Loading users...')).toBeInTheDocument());

    expect(screen.queryByTestId('login-button-admin')).not.toBeInTheDocument();
    expect(screen.queryByTestId('login-button-mark')).not.toBeInTheDocument();
    expect(screen.queryByTestId('login-button-emily')).not.toBeInTheDocument();
  });
});
