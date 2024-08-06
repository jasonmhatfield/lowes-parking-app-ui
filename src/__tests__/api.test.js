import axios from 'axios';
import { simulateParking, getAlerts } from '../services/api';

jest.mock('axios');

describe('API Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('simulateParking should call the correct API endpoint', async () => {
    const dayOfWeek = 'Monday';
    const hourOfDay = 9;
    const mockResponse = { data: [] };
    axios.post.mockResolvedValue(mockResponse);

    const response = await simulateParking(dayOfWeek, hourOfDay);

    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:8080/api/simulation/load',
      null,
      {
        params: { dayOfWeek, hourOfDay },
      }
    );
    expect(response).toEqual(mockResponse);
  });

  test('getAlerts should call the correct API endpoint', async () => {
    const userId = '12345';
    const mockResponse = { data: [] };
    axios.get.mockResolvedValue(mockResponse);

    const response = await getAlerts(userId);

    expect(axios.get).toHaveBeenCalledWith(
      'http://localhost:8080/api/alerts',
      {
        params: { userId },
      }
    );
    expect(response).toEqual(mockResponse);
  });
});
