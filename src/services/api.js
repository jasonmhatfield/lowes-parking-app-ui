import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export const simulateParking = (dayOfWeek, hourOfDay) => {
  return axios.post(`${API_URL}/simulation/load`, null, {
    params: { dayOfWeek, hourOfDay }
  });
};

export const getAlerts = (userId) => {
  return axios.get(`${API_URL}/alerts`, {
    params: { userId }
  });
};
