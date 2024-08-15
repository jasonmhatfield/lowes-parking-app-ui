import fetchMock from 'jest-fetch-mock';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { fetchParkingSpotsData, removeUserFromSpot, setupWebSocketConnection } from '../parkingSpotsService';

jest.mock('sockjs-client');
jest.mock('@stomp/stompjs');

fetchMock.enableMocks();

describe('parkingSpotsService', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    jest.clearAllMocks();
  });

  describe('fetchParkingSpotsData', () => {
    it('fetches parking spots and associated users', async () => {
      const mockParkingSpots = [
        { id: 1, spotNumber: 'A1', userId: 1 },
        { id: 2, spotNumber: 'A2', userId: null },
        { id: 3, spotNumber: 'A3', userId: 2 },
      ];

      const mockUsers = [
        { id: 1, firstName: 'John', lastName: 'Doe' },
        { id: 2, firstName: 'Jane', lastName: 'Smith' },
      ];

      fetchMock.mockResponses(
        [JSON.stringify(mockParkingSpots), { status: 200 }],
        [JSON.stringify(mockUsers[0]), { status: 200 }],
        [JSON.stringify(mockUsers[1]), { status: 200 }],
      );

      const { spotsData, userMapData } = await fetchParkingSpotsData();

      expect(spotsData).toEqual(mockParkingSpots);
      expect(userMapData).toEqual({
        1: 'John Doe',
        2: 'Jane Smith',
      });

      expect(fetchMock).toHaveBeenCalledTimes(3);
      expect(fetchMock).toHaveBeenNthCalledWith(1, 'http://localhost:8080/api/parkingSpots');
      expect(fetchMock).toHaveBeenNthCalledWith(2, 'http://localhost:8080/api/users/1');
      expect(fetchMock).toHaveBeenNthCalledWith(3, 'http://localhost:8080/api/users/2');
    });

    it('handles error when fetching parking spots', async () => {
      fetchMock.mockRejectOnce(new Error('Failed to fetch parking spots'));

      await expect(fetchParkingSpotsData()).rejects.toThrow('Failed to fetch parking spots');
    });
  });

  describe('removeUserFromSpot', () => {
    it('removes user from parking spot successfully', async () => {
      const mockResponse = { id: 1, spotNumber: 'A1', userId: null, occupied: false };
      fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

      const result = await removeUserFromSpot(1);

      expect(result).toEqual(mockResponse);
      expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/api/parkingSpots/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ occupied: false, userId: null }),
      });
    });

    it('throws error when removing user fails', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({}), { status: 500 });

      await expect(removeUserFromSpot(1)).rejects.toThrow('Error removing user from spot.');
    });
  });

  describe('setupWebSocketConnection', () => {
    it('sets up WebSocket connection and handles incoming messages', () => {
      const mockStompClient = {
        connect: jest.fn((headers, callback) => callback()),
        subscribe: jest.fn(),
      };

      Stomp.over.mockReturnValue(mockStompClient);

      const onMessageReceived = jest.fn();

      setupWebSocketConnection(onMessageReceived);

      expect(SockJS).toHaveBeenCalledWith('http://localhost:8080/ws');
      expect(Stomp.over).toHaveBeenCalledWith(expect.any(SockJS));
      expect(mockStompClient.connect).toHaveBeenCalled();
      expect(mockStompClient.subscribe).toHaveBeenCalledWith('/topic/parkingSpots', expect.any(Function));
    });

    it('handles incoming WebSocket messages', () => {
      const mockStompClient = {
        connect: jest.fn((headers, callback) => callback()),
        subscribe: jest.fn((topic, callback) => {
          const mockMessage = { body: JSON.stringify({ id: 1, spotNumber: 'A1', occupied: true }) };
          callback(mockMessage);
        }),
      };

      Stomp.over.mockReturnValue(mockStompClient);

      const onMessageReceived = jest.fn();

      setupWebSocketConnection(onMessageReceived);

      expect(onMessageReceived).toHaveBeenCalledWith({ id: 1, spotNumber: 'A1', occupied: true });
    });
  });
});
