import React from 'react';
import {render, screen, fireEvent, waitFor, within, act} from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EmployeeDashboard from '../../components/EmployeeDashboard';
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
      // Select the button by the spot number text
      const parkingButton = screen.getByRole('button', { name: /parking spot 101/i });
      fireEvent.click(parkingButton);
    });

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/api/parkingSpots/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ occupied: true, userId: 1 }),
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

    // Mock the fetch to simulate a network error
    global.fetch.mockImplementation((url) => {
      if (url.includes('parkingSpots')) {
        if (url.endsWith('/1')) {
          return Promise.reject(new Error('Network error')); // Simulate a network error
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
      const parkingButton = screen.getByRole('button', { name: /parking spot 101/i });
      fireEvent.click(parkingButton);
    });

    // Check that the error was logged
    expect(consoleSpy).toHaveBeenCalledWith('Failed to update parking spot.');

    consoleSpy.mockRestore();
  });

  test('handles different types of parking spots', async () => {
    sessionStorage.setItem('loggedInUser', JSON.stringify({ id: 1, firstName: 'John', hasHandicapPlacard: true, hasEv: true }));

    const mockParkingSpots = [
      { id: 1, spotNumber: '101', occupied: false, type: 'regular' },
      { id: 2, spotNumber: '102', occupied: false, type: 'handicap' },
      { id: 3, spotNumber: '103', occupied: false, type: 'ev' },
      { id: 4, spotNumber: '104', occupied: true, userId: 1, type: 'regular' },
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
      const regularSpot = screen.getByRole('button', { name: /parking spot 101/i });
      const handicapSpot = screen.getByRole('button', { name: /parking spot 102/i });
      const evSpot = screen.getByRole('button', { name: /parking spot 103/i });
      const userSpot = screen.getByRole('button', { name: /parking spot 104/i });

      expect(regularSpot).toHaveClass('ParkingButton blue');
      expect(handicapSpot).toHaveClass('ParkingButton blue');
      expect(evSpot).toHaveClass('ParkingButton blue');
      expect(userSpot).toHaveClass('ParkingButton green');
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

  test('calls handleParking only if canParkInSpot returns true', async () => {
    sessionStorage.setItem('loggedInUser', JSON.stringify({ id: 1, firstName: 'John' }));

    const mockParkingSpots = [
      { id: 1, spotNumber: '101', occupied: false, type: 'regular' },
      { id: 2, spotNumber: '102', occupied: true, type: 'regular' }, // Occupied spot, should not call handleParking
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
      const availableSpot = screen.getByText('101');
      fireEvent.click(availableSpot);

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/api/parkingSpots/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ occupied: true, userId: 1 }),
      });

      const occupiedSpot = screen.getByText('102');
      fireEvent.click(occupiedSpot);

      // handleParking should not be called for the occupied spot
      expect(global.fetch).not.toHaveBeenCalledWith('http://localhost:8080/api/parkingSpots/2', expect.anything());
    });
  });

  test('logs error when updating parking spot fails', async () => {
    sessionStorage.setItem('loggedInUser', JSON.stringify({ id: 1, firstName: 'John' }));

    const mockParkingSpots = [
      { id: 1, spotNumber: '101', occupied: false, type: 'regular' },
    ];
    const mockGates = [];

    global.fetch.mockImplementation((url) => {
      if (url.includes('parkingSpots')) {
        if (url.endsWith('/1')) {
          return Promise.resolve({ ok: false }); // Simulate an update failure
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

    // This assertion checks that the error was logged with the correct message and an error object
    expect(consoleSpy).toHaveBeenCalledWith('Failed to update parking spot.');

    consoleSpy.mockRestore();
  });

  test('toggles view mode and updates sessionStorage', async () => {
    sessionStorage.setItem('loggedInUser', JSON.stringify({ id: 1, firstName: 'John' }));
    sessionStorage.setItem('viewMode', 'desktop');

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([]),
      })
    );

    render(
      <BrowserRouter>
        <EmployeeDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      const toggleButton = screen.getByTestId('view-toggle');
      expect(toggleButton).toBeInTheDocument();
      fireEvent.click(toggleButton);
    });

    expect(sessionStorage.getItem('viewMode')).toBe('mobile');

    await waitFor(() => {
      const toggleButton = screen.getByTestId('view-toggle');
      expect(toggleButton).toBeInTheDocument();
      fireEvent.click(toggleButton);
    });

    expect(sessionStorage.getItem('viewMode')).toBe('desktop');
  });

  test('changes floor when select value changes', async () => {
    sessionStorage.setItem('loggedInUser', JSON.stringify({ id: 1, firstName: 'John' }));

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([]),
      })
    );

    render(
      <BrowserRouter>
        <EmployeeDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      const floorSelect = screen.getByLabelText('Select Floor:');
      fireEvent.change(floorSelect, { target: { value: '2' } });
    });

    expect(screen.getByLabelText('Select Floor:').value).toBe('2');
  });

  test('handles parking spot selection in mobile view', async () => {
    sessionStorage.setItem('loggedInUser', JSON.stringify({ id: 1, firstName: 'John' }));
    sessionStorage.setItem('viewMode', 'mobile');

    const mockParkingSpots = [
      { id: 1, spotNumber: '101', occupied: false, type: 'regular' },
      { id: 2, spotNumber: '102', occupied: false, type: 'regular' },
      { id: 3, spotNumber: '103', occupied: false, type: 'regular' },
    ];

    const mockGates = [
      { id: 1, gateName: 'Gate A', operational: false },
      { id: 2, gateName: 'Gate B', operational: false },
    ];

    global.fetch = jest.fn((url) => {
      if (url.includes('parkingSpots')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockParkingSpots),
          ok: true,
        });
      }
      if (url.includes('gates')) {
        return Promise.resolve({ json: () => Promise.resolve(mockGates) });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });

    await act(async () => {
      render(
        <BrowserRouter>
          <EmployeeDashboard />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      const parkingSpotButtons = screen.getAllByText(/Spot 10[123]/);
      expect(parkingSpotButtons).toHaveLength(3);

      // Click on the first parking spot
      fireEvent.click(parkingSpotButtons[0]);
    });

    // Verify that the fetch call was made with the correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/parkingSpots/1',
      expect.objectContaining({
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ occupied: true, userId: 1 }),
      })
    );

    // Wait for the component to update
    await waitFor(() => {
      // The clicked spot should no longer be available (should not be in the list)
      const remainingSpots = screen.getAllByText(/Spot 10[23]/);
      expect(remainingSpots).toHaveLength(2);
    });
  });
});
