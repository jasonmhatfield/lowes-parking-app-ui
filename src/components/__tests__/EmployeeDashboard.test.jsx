import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EmployeeDashboard from '../EmployeeDashboard';
import { useNavigate } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

describe('EmployeeDashboard', () => {
  let mockNavigate;

  beforeEach(() => {
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    sessionStorage.setItem('loggedInUser', JSON.stringify({ id: 1, firstName: 'John', hasHandicapPlacard: true, hasEv: true }));
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
      expect(screen.getByTestId('employee-parking-modal')).toBeInTheDocument();
    });
  });

  test('logs out the user', async () => {
    global.innerWidth = 1024;
    render(<EmployeeDashboard />);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
    expect(sessionStorage.getItem('loggedInUser')).toBeNull();
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
      expect(screen.queryByTestId('employee-parking-modal')).not.toBeInTheDocument();
    });
  });

  test('handles WebSocket updates for gates', async () => {
    const gates = [
      { id: 1, gateName: 'Main Gate', operational: true },
    ];

    global.fetch = jest.fn((url) => {
      if (url.includes('/gates')) {
        return Promise.resolve({
          json: () => Promise.resolve(gates),
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve([]),
      });
    });

    render(<EmployeeDashboard />);

    // Simulate WebSocket message
    const updatedGate = { id: 1, gateName: 'Main Gate', operational: false };
    const messageCallback = jest.fn();
    const mockStompClient = {
      subscribe: jest.fn((topic, callback) => {
        if (topic === '/topic/gates') {
          messageCallback.mockImplementation(() => callback({ body: JSON.stringify(updatedGate) }));
        }
      }),
      connect: jest.fn((_headers, onConnect) => {
        onConnect();
      }),
      disconnect: jest.fn(),
    };
    jest.spyOn(global, 'SockJS').mockReturnValue({});
    jest.spyOn(Stomp, 'over').mockReturnValue(mockStompClient);

    await waitFor(() => {
      messageCallback();
      expect(screen.getByText(/Main Gate/i)).toBeInTheDocument();
    });
  });

  test('handles WebSocket updates for parking spots', async () => {
    const parkingSpots = [
      { id: 1, spotNumber: '1A', userId: 1, occupied: true, type: 'regular' },
    ];

    global.fetch = jest.fn((url) => {
      if (url.includes('/parkingSpots')) {
        return Promise.resolve({
          json: () => Promise.resolve(parkingSpots),
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve([]),
      });
    });

    render(<EmployeeDashboard />);

    const updatedSpot = { id: 1, spotNumber: '1A', userId: null, occupied: false, type: 'regular' };
    const messageCallback = jest.fn();
    const mockStompClient = {
      subscribe: jest.fn((topic, callback) => {
        if (topic === '/topic/parkingSpots') {
          messageCallback.mockImplementation(() => callback({ body: JSON.stringify(updatedSpot) }));
        }
      }),
      connect: jest.fn((_headers, onConnect) => {
        onConnect();
      }),
      disconnect: jest.fn(),
    };
    jest.spyOn(global, 'SockJS').mockReturnValue({});
    jest.spyOn(Stomp, 'over').mockReturnValue(mockStompClient);

    await waitFor(() => {
      messageCallback();
      expect(screen.queryByTestId('employee-parking-modal')).not.toBeInTheDocument();
    });
  });

  test('handles window resize event', async () => {
    render(<EmployeeDashboard />);

    global.innerWidth = 500;
    global.dispatchEvent(new Event('resize'));

    await waitFor(() => {
      expect(screen.getByTestId('employee-dashboard-mobile')).toBeInTheDocument();
    });

    global.innerWidth = 1024;
    global.dispatchEvent(new Event('resize'));

    await waitFor(() => {
      expect(screen.getByTestId('employee-dashboard-desktop')).toBeInTheDocument();
    });
  });

  test('handles parking spot update by user', async () => {
    const parkingSpots = [
      { id: 1, spotNumber: '1A', userId: 1, occupied: true, type: 'regular' },
      { id: 2, spotNumber: '1B', userId: null, occupied: false, type: 'regular' },
    ];

    global.fetch = jest.fn((url, options) => {
      if (url.includes('/parkingSpots/1') && options.method === 'PATCH') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ...parkingSpots[0], userId: null, occupied: false }),
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve(parkingSpots),
      });
    });

    render(<EmployeeDashboard />);

    fireEvent.click(screen.getByTestId('employee-parking-modal'));
    fireEvent.click(screen.getByText('Leave Spot'));

    await waitFor(() => {
      expect(screen.queryByTestId('employee-parking-modal')).not.toBeInTheDocument();
    });
  });

  test('handles error during parking spot update', async () => {
    const parkingSpots = [
      { id: 1, spotNumber: '1A', userId: 1, occupied: true, type: 'regular' },
    ];

    global.fetch = jest.fn((url, options) => {
      if (url.includes('/parkingSpots/1') && options.method === 'PATCH') {
        return Promise.resolve({
          ok: false,
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve(parkingSpots),
      });
    });

    render(<EmployeeDashboard />);

    fireEvent.click(screen.getByTestId('employee-parking-modal'));
    fireEvent.click(screen.getByText('Leave Spot'));

    await waitFor(() => {
      expect(screen.getByTestId('employee-parking-modal')).toBeInTheDocument();
    });
  });
});
