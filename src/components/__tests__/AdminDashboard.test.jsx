import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EmployeeDashboard from '../EmployeeDashboard';

// Mocking SockJS and StompJS
jest.mock('sockjs-client');
jest.mock('@stomp/stompjs', () => ({
  Stomp: {
    over: () => ({
      connect: (headers, callback) => callback(),
      subscribe: (topic, callback) => {},
      disconnect: jest.fn(),
    }),
  },
}));

describe('EmployeeDashboard', () => {
  beforeEach(() => {
    // Mock fetch to return empty arrays for parking spots and gates
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    // Mocking sessionStorage methods
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

  test('renders the EmployeeDashboard with user data', async () => {
    render(
      <BrowserRouter>
        <EmployeeDashboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/Welcome, John/i)).toBeInTheDocument();
    expect(screen.getByAltText("Lowe's Logo")).toBeInTheDocument();
  });

  test('handles floor selection', async () => {
    render(
      <BrowserRouter>
        <EmployeeDashboard />
      </BrowserRouter>
    );

    const floorSelect = screen.getByLabelText(/Select Floor/i);
    fireEvent.change(floorSelect, { target: { value: '2' } });
    expect(floorSelect.value).toBe('2');
  });

  test('opens and closes parking modal based on parking spot selection', async () => {
    // Mock fetch to return parking spots
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: 1, spotNumber: '101', type: 'regular', occupied: false, userId: null },
          { id: 2, spotNumber: '102', type: 'handicap', occupied: false, userId: null },
        ]),
      })
    );

    render(
      <BrowserRouter>
        <EmployeeDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      const parkingButtons = screen.getAllByRole('button', { name: /101|102/ });
      fireEvent.click(parkingButtons[0]); // Select first spot
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      fireEvent.click(parkingButtons[1]); // Select another spot
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  test('logs out user on logout button click', async () => {
    render(
      <BrowserRouter>
        <EmployeeDashboard />
      </BrowserRouter>
    );

    const logoutButton = screen.getByText(/Logout/i);
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(window.sessionStorage.getItem('loggedInUser')).toBe(null);
      expect(window.location.pathname).toBe('/');
    });
  });
});
