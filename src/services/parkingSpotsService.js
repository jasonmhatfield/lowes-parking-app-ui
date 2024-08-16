import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

export const fetchParkingSpotsData = async () => {
  const parkingSpotsResponse = await fetch('http://localhost:8080/api/parkingSpots');
  const parkingSpotsData = await parkingSpotsResponse.json();

  const userIds = [...new Set(parkingSpotsData.filter(spot => spot.userId).map(spot => spot.userId))];
  const userResponses = await Promise.all(userIds.map(id => fetch(`http://localhost:8080/api/users/${id}`)));
  const users = await Promise.all(userResponses.map(res => res.json()));
  const userMapData = users.reduce((map, user) => ({ ...map, [user.id]: `${user.firstName} ${user.lastName}` }), {});

  return { spotsData: parkingSpotsData, userMapData }; // Return parking spots and user map data
};

export const removeUserFromSpot = async (spotId) => {
  const response = await fetch(`http://localhost:8080/api/parkingSpots/${spotId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ occupied: false, userId: null }), // Clear user from the spot
  });

  if (!response.ok) {
    throw new Error('Error removing user from spot.'); // Handle HTTP errors
  }

  return await response.json(); // Return the updated spot data
};

// Establish real-time communication using STOMP over WebSocket
export const setupWebSocketConnection = (onMessageReceived) => {
  const socket = new SockJS('http://localhost:8080/ws'); // Initialize SockJS client
  const stompClient = Stomp.over(socket); // Use Stomp over SockJS

  stompClient.connect({}, () => {
    stompClient.subscribe('/topic/parkingSpots', (message) => {
      const updatedSpot = JSON.parse(message.body); // Parse the message body
      onMessageReceived(updatedSpot); // Handle the received message
    });
  });

  return stompClient; // Return the Stomp client
};
