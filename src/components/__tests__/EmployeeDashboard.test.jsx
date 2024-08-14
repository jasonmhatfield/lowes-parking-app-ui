import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import EmployeeDashboard from '../EmployeeDashboard';
import { MemoryRouter } from 'react-router-dom';

jest.mock('sockjs-client');
jest.mock('@stomp/stompjs', () => ({
  Stomp: {
    over: () => ({
      connect: (headers, callback) => callback(),
      subscribe: (topic, callback) => {
        if (topic === '/topic/gates') {
          const message = {
            body: JSON.stringify({ id: 1, gateName: 'Gate 1', operational: false }),
          };
          callback(message);
        }
      },
      disconnect: jest.fn(),
    }),
  },
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('EmployeeDashboard', () => {
  let originalLocation;

  beforeAll(() => {
    originalLocation = window.location;
    delete window.location;
    window.location = {
      ...originalLocation,
      assign: jest.fn(),
      pathname: '/dashboard',
      href: '',
      search: '',
      hash: ''
    };
  });

  beforeEach(() => {
    const mockParkingSpots = [
      { id: 1, spotNumber: '101', type: 'regular', occupied: false, userId: null },
      { id: 2, spotNumber: '102', type: 'handicap', occupied: true, userId: 2 },
    ];

    const mockGates = [
      { id: 1, gateName: 'Gate 1', operational: true },
      { id: 2, gateName: 'Gate 2', operational: false },
    ];

    global.fetch = jest.fn((url) => {
      if (url.includes('/parkingSpots')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockParkingSpots),
        });
      }
      if (url.includes('/gates')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGates),
        });
      }
    });

    const mockSessionStorage = (() => {
      let store = {};

      return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => {
          store[key] = value.toString();
        },
        clear: () => {
          store = {};
        },
        removeItem: (key) => {
          delete store[key];
        }
      };
    })();

    Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });
    window.sessionStorage.setItem('loggedInUser', JSON.stringify({ id: 1, firstName: 'John', hasHandicapPlacard: true, hasEv: true }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    window.location = originalLocation;
  });

  test('renders the EmployeeDashboard with user data', async () => {
    render(
      <MemoryRouter>
        <EmployeeDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Welcome, John/i)).toBeInTheDocument();
    expect(screen.getByAltText("Lowe's Logo")).toBeInTheDocument();
  });

  test('successfully fetches and sets parking spots and gates data', async () => {
    render(
      <MemoryRouter>
        <EmployeeDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/api/parkingSpots');
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/api/gates');
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /101/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /102/i })).toBeInTheDocument();
    });
  });

  test('sets user parking spot ID and opens modal if user has a parking spot', async () => {
    // Update mock data to include a parking spot for the logged-in user
    const mockParkingSpotsWithUser = [
      { id: 1, spotNumber: '101', type: 'regular', occupied: false, userId: 1 }, // Spot assigned to the logged-in user
      { id: 2, spotNumber: '102', type: 'handicap', occupied: true, userId: 2 },
    ];

    global.fetch.mockImplementation((url) => {
      if (url.includes('/parkingSpots')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockParkingSpotsWithUser),
        });
      }
      if (url.includes('/gates')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
    });

    render(
      <MemoryRouter>
        <EmployeeDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Verify that the modal is open by checking for the modal content
      expect(screen.getByText(/Parking Spot Details/i)).toBeInTheDocument(); // Check that the modal title is present
      expect(screen.getByText(/You are currently parked in spot 101/i)).toBeInTheDocument(); // Check that the modal content is present
    });
  });

  test('does not set user parking spot ID or open modal if user does not have a parking spot', async () => {
    // Update mock data to exclude a parking spot for the logged-in user
    const mockParkingSpotsWithoutUser = [
      { id: 1, spotNumber: '101', type: 'regular', occupied: false, userId: null },
      { id: 2, spotNumber: '102', type: 'handicap', occupied: true, userId: 2 },
    ];

    global.fetch.mockImplementation((url) => {
      if (url.includes('/parkingSpots')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockParkingSpotsWithoutUser),
        });
      }
      if (url.includes('/gates')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
    });

    render(
      <MemoryRouter>
        <EmployeeDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Verify that the modal does not open by ensuring the modal content is not present
      expect(screen.queryByText(/Parking Spot Details/i)).not.toBeInTheDocument(); // Modal title should not be present
      expect(screen.queryByText(/You are currently parked in spot/i)).not.toBeInTheDocument(); // Modal content should not be present
    });
  });

  test('handles errors during data fetching', async () => {
    // Mock fetch to reject and simulate a network error
    global.fetch.mockImplementation(() =>
      Promise.reject(new Error('Network error'))
    );

    // Spy on console.error to check if the error is logged
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <MemoryRouter>
        <EmployeeDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Ensure that console.error was called with the expected error message
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching data:', expect.any(Error));
    });

    // Clean up
    consoleErrorSpy.mockRestore();
  });

  test('redirects to login page if user is not logged in', async () => {
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);

    // Clear the sessionStorage to simulate no user being logged in
    window.sessionStorage.clear();

    render(
      <MemoryRouter>
        <EmployeeDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Verify that navigate('/') was called to redirect the user
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('updates gate state when a gate update message is received', async () => {
    const mockGates = [
      { id: 1, gateName: 'Gate 1', operational: true },
      { id: 2, gateName: 'Gate 2', operational: true },
    ];

    global.fetch = jest.fn((url) => {
      if (url.includes('/gates')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGates),
        });
      }
    });

    render(
      <MemoryRouter>
        <EmployeeDashboard />
      </MemoryRouter>
    );

    // Debugging: Check the DOM immediately after rendering
    screen.debug();

    // Wait for the element with data-testid="gate-1" to appear
    const gateElement = await screen.findByTestId('gate-1');

    // Ensure the element is rendered and check its initial state
    expect(gateElement).toBeInTheDocument();
    expect(gateElement).toHaveTextContent('Gate 1 (Open)');

    // Simulate a WebSocket message to update the gate status
    const socketMessage = { body: JSON.stringify({ id: 1, gateName: 'Gate 1', operational: false }) };
    const { subscribe } = require('@stomp/stompjs').Stomp.over();
    subscribe.mock.calls[0][1](socketMessage);

    // Debugging: Check the DOM after the WebSocket message is received
    screen.debug();

    // Wait for the gate element to update its status
    await waitFor(() => {
      expect(screen.getByTestId('gate-1')).toHaveTextContent('Gate 1 (Closed)');
    });
  });

});
