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
      { id: 1, firstName: 'Jason', lastName: 'Hatfield', role: 'employee' },
      { id: 2, firstName: 'Michael', lastName: 'Smith', role: 'admin' },
      { id: 3, firstName: 'Emily', lastName: 'Jones', role: 'employee' },
    ];

    fetch.mockResponseOnce(JSON.stringify(users));

    render(<LandingPage />);

    await waitFor(() => {
      expect(screen.getByTestId('login-button-jason')).toBeInTheDocument();
      expect(screen.getByTestId('login-button-michael')).toBeInTheDocument();
      expect(screen.getByTestId('login-button-emily')).toBeInTheDocument();
    });
  });

  test('handles login button click and navigates based on user role', async () => {
    const users = [
      { id: 1, firstName: 'Jason', lastName: 'Hatfield', role: 'employee' },
      { id: 2, firstName: 'Michael', lastName: 'Smith', role: 'admin' },
    ];

    fetch.mockResponseOnce(JSON.stringify(users));

    render(<LandingPage />);

    await waitFor(() => screen.getByTestId('login-button-jason'));

    const jasonButton = screen.getByTestId('login-button-jason');
    fireEvent.click(jasonButton);

    expect(mockNavigate).toHaveBeenCalledWith('/employee-dashboard');

    const michaelButton = screen.getByTestId('login-button-michael');
    fireEvent.click(michaelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/admin-dashboard');
  });

  test('displays an error message when failing to fetch users', async () => {
    fetch.mockReject(new Error('Failed to fetch'));

    render(<LandingPage />);

    await waitFor(() => expect(screen.getByText('Loading users...')).toBeInTheDocument());

    expect(screen.queryByTestId('login-button-jason')).not.toBeInTheDocument();
    expect(screen.queryByTestId('login-button-michael')).not.toBeInTheDocument();
    expect(screen.queryByTestId('login-button-emily')).not.toBeInTheDocument();
  });
});
