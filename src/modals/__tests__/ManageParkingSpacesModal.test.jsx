import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ManageParkingSpacesModal from '../ManageParkingSpacesModal';

describe('ManageParkingSpacesModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn((url) => {
      if (url.startsWith('http://localhost:8080/api/users/')) {
        const userId = url.split('/').pop();
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              id: userId,
              firstName: `First${userId}`,
              lastName: `Last${userId}`,
            }),
        });
      } else if (url.startsWith('http://localhost:8080/api/parkingSpots')) {
        return Promise.resolve({
          json: () =>
            Promise.resolve([
              { id: '1', spotNumber: '1A', type: 'reserved', status: 'Occupied', userId: '1' },
              { id: '2', spotNumber: '2B', type: 'general', status: 'Available', userId: '2' },
              { id: '3', spotNumber: '3C', type: 'ev', status: 'Available' },
              { id: '4', spotNumber: '4D', type: 'handicap', status: 'Occupied', userId: '2' },
            ]),
        });
      }
    });

    // Mock SockJS and Stomp
    const mockStompClient = {
      connect: jest.fn((headers, callback) => callback()),
      subscribe: jest.fn(),
      disconnect: jest.fn(),
    };

    global.SockJS = jest.fn().mockImplementation(() => ({}));
    global.Stomp = {
      over: jest.fn().mockImplementation(() => mockStompClient),
    };

    render(<ManageParkingSpacesModal onClose={mockOnClose} />);
  });

  test('renders the modal with correct title', () => {
    const title = screen.getByText('Manage Parking Spaces');
    expect(title).toBeInTheDocument();
  });

  test('renders filter buttons', () => {
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Occupied')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  test('close button works correctly', () => {
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('sets parking spots and user map correctly', async () => {
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/api/parkingSpots');
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/api/users/1');
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/api/users/2');
    });

    // Verify the parking spots are set
    const spot1 = screen.getByText('1A');
    const spot2 = screen.getByText('2B');
    const spot3 = screen.getByText('3C');
    const spot4 = screen.getByText('4D');
    expect(spot1).toBeInTheDocument();
    expect(spot2).toBeInTheDocument();
    expect(spot3).toBeInTheDocument();
    expect(spot4).toBeInTheDocument();

    // Verify the user map is set correctly
    await waitFor(() => {
      const user1 = screen.getByText('First1 Last1');
      const user2 = screen.getByText('First2 Last2');
      expect(user1).toBeInTheDocument();
      expect(user2).toBeInTheDocument();
    });
  });

  test('handles WebSocket connections and updates spots correctly', async () => {
    const mockMessage = {
      body: JSON.stringify({
        id: '1',
        spotNumber: '1A',
        type: 'reserved',
        occupied: false,
        userId: null,
      }),
    };

    await waitFor(() => {
      expect(global.Stomp.over).toHaveBeenCalled();
      expect(global.SockJS).toHaveBeenCalledWith('http://localhost:8080/ws');
    });

    const stompClient = global.Stomp.over.mock.results[0].value;
    expect(stompClient.subscribe).toHaveBeenCalledWith('/topic/parkingSpots', expect.any(Function));

    // Simulate receiving a message from WebSocket
    const callback = stompClient.subscribe.mock.calls[0][1];
    callback(mockMessage);

    await waitFor(() => {
      const spot1 = screen.getByText('1A');
      expect(spot1).toBeInTheDocument();
      expect(screen.getByText('Available')).toBeInTheDocument();
    });
  });

  test('handles removing user from a spot', async () => {
    const spotId = '1';
    const removeButton = screen.getAllByText('Remove')[0];

    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: spotId, spotNumber: '1A', type: 'reserved', occupied: false, userId: null }),
      })
    );

    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`http://localhost:8080/api/parkingSpots/${spotId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ occupied: false, userId: null }),
      });
      expect(screen.getByText('Available')).toBeInTheDocument();
    });
  });

  test('renders correct icons for spot types', () => {
    const spot1Icon = screen.getByText('1A').nextSibling;
    const spot3Icon = screen.getByText('3C').nextSibling;
    const spot4Icon = screen.getByText('4D').nextSibling;

    expect(spot1Icon).toBeInstanceOf(SVGElement); // Default icon (LocalParkingIcon)
    expect(spot3Icon).toBeInstanceOf(SVGElement); // EV icon (EvStationIcon)
    expect(spot4Icon).toBeInstanceOf(SVGElement); // Handicap icon (AccessibleIcon)
  });

  test('filters parking spots correctly', async () => {
    const occupiedButton = screen.getByText('Occupied');
    fireEvent.click(occupiedButton);

    await waitFor(() => {
      expect(screen.getByText('1A')).toBeInTheDocument();
      expect(screen.getByText('4D')).toBeInTheDocument();
      expect(screen.queryByText('2B')).not.toBeInTheDocument();
      expect(screen.queryByText('3C')).not.toBeInTheDocument();
    });

    const availableButton = screen.getByText('Available');
    fireEvent.click(availableButton);

    await waitFor(() => {
      expect(screen.queryByText('1A')).not.toBeInTheDocument();
      expect(screen.queryByText('4D')).not.toBeInTheDocument();
      expect(screen.getByText('2B')).toBeInTheDocument();
      expect(screen.getByText('3C')).toBeInTheDocument();
    });

    const allButton = screen.getByText('All');
    fireEvent.click(allButton);

    await waitFor(() => {
      expect(screen.getByText('1A')).toBeInTheDocument();
      expect(screen.getByText('2B')).toBeInTheDocument();
      expect(screen.getByText('3C')).toBeInTheDocument();
      expect(screen.getByText('4D')).toBeInTheDocument();
    });
  });
});
