import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import UserDashboard from '../../../../../../AppData/Roaming/JetBrains/IntelliJIdea2024.1/scratches/UserDashboard';
import { AlertProvider } from '../context/AlertContext';

jest.mock('axios');

describe('UserDashboard', () => {
  const mockGates = [
    { id: 1, gateName: 'Gate 1', isOperational: true },
  ];

  const mockParkingSpots = [
    { id: 1, spotNumber: 'A1', isOccupied: false, type: 'regular' },
    { id: 2, spotNumber: 'A2', isOccupied: true, type: 'regular', userId: 2 },
  ];

  beforeEach(() => {
    axios.get.mockResolvedValueOnce({ data: mockGates });
    axios.get.mockResolvedValueOnce({ data: mockParkingSpots });
  });

  it('renders the UserDashboard component', async () => {
    render(
      <AlertProvider>
        <UserDashboard currentUser={{ id: 1, firstName: 'John', lastName: 'Doe' }} />
      </AlertProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('User Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('Gate 1: Open')).toBeInTheDocument();
    expect(screen.getByText('A1 - Available')).toBeInTheDocument();
    expect(screen.getByText('A2 - Occupied')).toBeInTheDocument();
  });

  it('handles parking and leaving', async () => {
    render(
      <AlertProvider>
        <UserDashboard currentUser={{ id: 1, firstName: 'John', lastName: 'Doe' }} />
      </AlertProvider>
    );

    const parkButton = await screen.findByText('A1 - Available');
    fireEvent.click(parkButton);

    axios.patch.mockResolvedValueOnce({
      data: { id: 1, spotNumber: 'A1', isOccupied: true, userId: 1 },
    });

    await waitFor(() => {
      expect(screen.getByText('Parked successfully.')).toBeInTheDocument();
      expect(screen.getByText('A1 - Occupied')).toBeInTheDocument();
    });
  });
});
