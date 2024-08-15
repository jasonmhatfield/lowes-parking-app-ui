import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EmployeeDashboard from '../EmployeeDashboard';
import '@testing-library/jest-dom';

// Mock the react-router-dom's useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock the fetch function
global.fetch = jest.fn();

describe('EmployeeDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  test('redirects to home if user is not logged in', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);

    render(<EmployeeDashboard />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('fetches and displays parking spots and gates', async () => {
    sessionStorage.setItem('loggedInUser', JSON.stringify({ id: 1, firstName: 'John' }));

    const mockParkingSpots = [
      { id: 1, spotNumber: '101', occupied: false, type: 'regular' },
      { id: 2, spotNumber: '102', occupied: true, type: 'ev' },
    ];
    const mockGates = [
      { id: 1, gateName: 'Gate A', operational: true },
      { id: 2, gateName: 'Gate B', operational: false },
    ];

    global.fetch.mockImplementation((url) => {
      if (url.includes('parkingSpots')) {
        return Promise.resolve({ json: () => Promise.resolve(mockParkingSpots) });
      }
      if (url.includes('gates')) {
        return Promise.resolve({ json: () => Promise.resolve(mockGates) });
      }
    });

    render(
      <BrowserRouter>
        <EmployeeDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('101')).toBeInTheDocument();
      expect(screen.getByText('102')).toBeInTheDocument();
      expect(screen.getByText('Gate A (Open)')).toBeInTheDocument();
      expect(screen.getByText('Gate B (Closed)')).toBeInTheDocument();
    });
  });

  test('handles parking spot selection', async () => {
    sessionStorage.setItem('loggedInUser', JSON.stringify({ id: 1, firstName: 'John' }));

    const mockParkingSpots = [
      { id: 1, spotNumber: '101', occupied: false, type: 'regular' },
    ];
    const mockGates = [];

    global.fetch.mockImplementation((url) => {
      if (url.includes('parkingSpots')) {
        if (url.endsWith('/1')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
        }
        return Promise.resolve({ json: () => Promise.resolve(mockParkingSpots) });
      }
      if (url.includes('gates')) {
        return Promise.resolve({ json: () => Promise.resolve(mockGates) });
      }
    });

    render(
      <BrowserRouter>
        <EmployeeDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      const parkingButton = screen.getByText('101');
      fireEvent.click(parkingButton);
    });

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/api/parkingSpots/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ occupied: true, userId: 1 }),
    });
  });

  test('handles floor selection', async () => {
    sessionStorage.setItem('loggedInUser', JSON.stringify({ id: 1, firstName: 'John' }));

    const mockParkingSpots = [
      { id: 1, spotNumber: '101', occupied: false, type: 'regular' },
      { id: 2, spotNumber: '201', occupied: false, type: 'regular' },
    ];
    const mockGates = [];

    global.fetch.mockImplementation((url) => {
      if (url.includes('parkingSpots')) {
        return Promise.resolve({ json: () => Promise.resolve(mockParkingSpots) });
      }
      if (url.includes('gates')) {
        return Promise.resolve({ json: () => Promise.resolve(mockGates) });
      }
    });

    render(
      <BrowserRouter>
        <EmployeeDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      const floorSelect = screen.getByLabelText('Select Floor');
      fireEvent.change(floorSelect, { target: { value: '2' } });
    });

    await waitFor(() => {
      expect(screen.queryByText('101')).not.toBeInTheDocument();
      const spot201 = screen.getByLabelText('Parking spot 201');
      expect(within(spot201).getByText('201')).toBeInTheDocument();
    });
  });

  test('handles logout', async () => {
    sessionStorage.setItem('loggedInUser', JSON.stringify({ id: 1, firstName: 'John' }));

    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);

    global.fetch.mockImplementation(() => Promise.resolve({ json: () => Promise.resolve([]) }));

    render(
      <BrowserRouter>
        <EmployeeDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);
    });

    expect(sessionStorage.getItem('loggedInUser')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('displays user parking spot modal', async () => {
    sessionStorage.setItem('loggedInUser', JSON.stringify({ id: 1, firstName: 'John' }));

    const mockParkingSpots = [
      { id: 1, spotNumber: '101', occupied: true, userId: 1, type: 'regular' }, // Ensure `spotNumber` is used
    ];
    const mockGates = [];

    global.fetch.mockImplementation((url) => {
      if (url.includes('parkingSpots')) {
        return Promise.resolve({ json: () => Promise.resolve(mockParkingSpots) });
      }
      if (url.includes('gates')) {
        return Promise.resolve({ json: () => Promise.resolve(mockGates) });
      }
    });

    render(
      <BrowserRouter>
        <EmployeeDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Parking Spot Details')).toBeInTheDocument();
      expect(screen.getByText('You are currently parked in spot 101.')).toBeInTheDocument(); // This should now pass
    });
  });

  test('handles fetch error', async () => {
    sessionStorage.setItem('loggedInUser', JSON.stringify({ id: 1, firstName: 'John' }));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    global.fetch.mockRejectedValue(new Error('Fetch error'));

    render(
      <BrowserRouter>
        <EmployeeDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching data:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  test('handles parking spot update error', async () => {
    sessionStorage.setItem('loggedInUser', JSON.stringify({ id: 1, firstName: 'John' }));

    const mockParkingSpots = [
      { id: 1, spotNumber: '101', occupied: false, type: 'regular' },
    ];
    const mockGates = [];

    global.fetch.mockImplementation((url) => {
      if (url.includes('parkingSpots')) {
        if (url.endsWith('/1')) {
          return Promise.resolve({ ok: false });
        }
        return Promise.resolve({ json: () => Promise.resolve(mockParkingSpots) });
      }
      if (url.includes('gates')) {
        return Promise.resolve({ json: () => Promise.resolve(mockGates) });
      }
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <BrowserRouter>
        <EmployeeDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      const parkingButton = screen.getByText('101');
      fireEvent.click(parkingButton);
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to update parking spot.');

    consoleSpy.mockRestore();
  });

  test('handles different types of parking spots', async () => {
    sessionStorage.setItem('loggedInUser', JSON.stringify({ id: 1, firstName: 'John', hasHandicapPlacard: true, hasEv: true }));

    const mockParkingSpots = [
      { id: 1, spotNumber: '101', occupied: false, type: 'regular' },
      { id: 2, spotNumber: '102', occupied: false, type: 'handicap' },
      { id: 3, spotNumber: '103', occupied: false, type: 'ev' },
      { id: 4, spotNumber: '104', occupied: true, userId: 1, type: 'regular' }, // Ensure userId matches logged-in user
    ];
    const mockGates = [];

    global.fetch.mockImplementation((url) => {
      if (url.includes('parkingSpots')) {
        return Promise.resolve({ json: () => Promise.resolve(mockParkingSpots) });
      }
      if (url.includes('gates')) {
        return Promise.resolve({ json: () => Promise.resolve(mockGates) });
      }
    });

    render(
      <BrowserRouter>
        <EmployeeDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      const regularSpot = screen.getByTestId('parking-spot-101');
      const handicapSpot = screen.getByTestId('parking-spot-102');
      const evSpot = screen.getByTestId('parking-spot-103');
      const userSpot = screen.getByTestId('parking-spot-104'); // Now spot 104 is the user's spot

      expect(regularSpot).toHaveClass('ParkingButton blue');
      expect(handicapSpot).toHaveClass('ParkingButton blue');
      expect(evSpot).toHaveClass('ParkingButton blue');
      expect(userSpot).toHaveClass('ParkingButton green'); // Expect green because it is occupied by the user
    });
  });

  test('handles leaving a parking spot', async () => {
    sessionStorage.setItem('loggedInUser', JSON.stringify({ id: 1, firstName: 'John' }));

    const mockParkingSpots = [
      { id: 1, spotNumber: '101', occupied: true, userId: 1, type: 'regular' },
    ];
    const mockGates = [];

    global.fetch.mockImplementation((url) => {
      if (url.includes('parkingSpots')) {
        if (url.endsWith('/1')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
        }
        return Promise.resolve({ json: () => Promise.resolve(mockParkingSpots) });
      }
      if (url.includes('gates')) {
        return Promise.resolve({ json: () => Promise.resolve(mockGates) });
      }
    });

    render(
      <BrowserRouter>
        <EmployeeDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      const leaveButton = screen.getByTestId('leave-button');
      fireEvent.click(leaveButton);
    });

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/api/parkingSpots/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ occupied: false, userId: null }),
    });
  });

  test('displays gate status correctly', async () => {
    sessionStorage.setItem('loggedInUser', JSON.stringify({ id: 1, firstName: 'John' }));

    const mockParkingSpots = [];
    const mockGates = [
      { id: 1, gateName: 'Gate A', operational: true },
      { id: 2, gateName: 'Gate B', operational: false },
    ];

    global.fetch.mockImplementation((url) => {
      if (url.includes('parkingSpots')) {
        return Promise.resolve({ json: () => Promise.resolve(mockParkingSpots) });
      }
      if (url.includes('gates')) {
        return Promise.resolve({ json: () => Promise.resolve(mockGates) });
      }
    });

    render(
      <BrowserRouter>
        <EmployeeDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      const gateAStatus = screen.getByText('Gate A (Open)');
      const gateBStatus = screen.getByText('Gate B (Closed)');

      expect(gateAStatus).toBeInTheDocument();
      expect(gateBStatus).toBeInTheDocument();

      const gateAIcon = gateAStatus.previousSibling;
      const gateBIcon = gateBStatus.previousSibling;

      expect(gateAIcon).toHaveClass('GateIcon gate-open');
      expect(gateBIcon).toHaveClass('GateIcon gate-closed');
    });
  });
});
