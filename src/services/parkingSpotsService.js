import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

export const fetchParkingSpotsData = async () => {
  const parkingSpotsResponse = await fetch('http://localhost:8080/api/parkingSpots');
  const parkingSpotsData = await parkingSpotsResponse.json();

  const userIds = [...new Set(parkingSpotsData.filter(spot => spot.userId).map(spot => spot.userId))];
  const userResponses = await Promise.all(userIds.map(id => fetch(`http://localhost:8080/api/users/${id}`)));
  const users = await Promise.all(userResponses.map(res => res.json()));
  const userMapData = users.reduce((map, user) => ({ ...map, [user.id]: `${user.firstName} ${user.lastName}` }), {});

  return { spotsData: parkingSpotsData, userMapData };
};

export const removeUserFromSpot = async (spotId) => {
  const response = await fetch(`http://localhost:8080/api/parkingSpots/${spotId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ occupied: false, userId: null }),
  });

  if (!response.ok) {
    throw new Error('Error removing user from spot.');
  }

  return await response.json();
};

export const setupWebSocketConnection = (onMessageReceived) => {
  const socket = new SockJS('http://localhost:8080/ws');
  const stompClient = Stomp.over(socket);

  stompClient.connect({}, () => {
    stompClient.subscribe('/topic/parkingSpots', (message) => {
      const updatedSpot = JSON.parse(message.body);
      onMessageReceived(updatedSpot);
    });
  });

  return stompClient;
};
