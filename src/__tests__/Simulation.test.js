import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import Simulation from '../components/Simulation';

jest.mock('axios');

describe('Simulation', () => {
  const mockParkingSpaces = [
    { spaceId: '1', spaceNumber: 'A1', occupied: false, floor: 1, type: '' },
    { spaceId: '2', spaceNumber: 'A2', occupied: true, floor: 1, type: 'handicap' },
    { spaceId: '3', spaceNumber: 'A3', occupied: false, floor: 2, type: 'ev' },
  ];

  beforeEach(() => {
    axios.post.mockClear();
  });

  test('loads and displays simulation data', async () => {
    axios.post.mockResolvedValueOnce({ data: mockParkingSpaces });

    await act(async () => {
      render(<Simulation />);
    });

    const spaceElements = await waitFor(() => screen.getAllByTestId('parking-space'));
    expect(spaceElements).toHaveLength(mockParkingSpaces.length);
  });

  test('updates simulation data on slider change', async () => {
    axios.post.mockResolvedValueOnce({ data: mockParkingSpaces });

    await act(async () => {
      render(<Simulation />);
    });

    axios.post.mockResolvedValueOnce({ data: mockParkingSpaces });

    const slider = screen.getByTestId('hour-of-day-slider');
    fireEvent.change(slider, { target: { value: '8' } });

    const spaceElements = await waitFor(() => screen.getAllByTestId('parking-space'));
    expect(spaceElements).toHaveLength(mockParkingSpaces.length);
  });

  test('handles error during simulation load', async () => {
    axios.post.mockRejectedValueOnce(new Error('Error loading simulation'));

    await act(async () => {
      render(<Simulation />);
    });

    const errorMessage = await waitFor(() => screen.getByTestId('error-message'));
    expect(errorMessage).toBeInTheDocument();
  });
});
