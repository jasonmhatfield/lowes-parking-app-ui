import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EmployeeDashboard from '../../components/EmployeeDashboard';
import { useNavigate } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

describe('EmployeeDashboard', () => {
  let mockNavigate;

  beforeEach(() => {
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    sessionStorage.setItem('loggedInUser', JSON.stringify({ id: 1, firstName: 'John' }));
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  test('renders the desktop version of the dashboard when the screen width is greater than 768px', async () => {
    global.innerWidth = 1024;
    render(<EmployeeDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Welcome, John')).toBeInTheDocument();
    });
  });

  test('renders the mobile version of the dashboard when the screen width is less than or equal to 768px', async () => {
    global.innerWidth = 768;
    render(<EmployeeDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Welcome, John')).toBeInTheDocument();
    });
  });

  test('opens the parking modal when user has a parking spot', async () => {
    const parkingSpots = [
      { id: 1, spotNumber: '1A', userId: 1, occupied: true, type: 'regular' },
    ];

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(parkingSpots),
      })
    );

    render(<EmployeeDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('DirectionsCarIcon')).toBeInTheDocument();
    });
  });

  test('logs out the user', async () => {
    global.innerWidth = 1024;
    render(<EmployeeDashboard />);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('does not show the parking modal if user does not have a parking spot', async () => {
    const parkingSpots = [
      { id: 1, spotNumber: '1A', userId: null, occupied: false, type: 'regular' },
    ];

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(parkingSpots),
      })
    );

    render(<EmployeeDashboard />);

    await waitFor(() => {
      expect(screen.queryByTestId('DirectionsCarIcon')).not.toBeInTheDocument();
    });
  });
});
