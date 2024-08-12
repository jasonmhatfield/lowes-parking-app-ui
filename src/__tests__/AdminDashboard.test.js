import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import AdminDashboard from '../../../../../../AppData/Roaming/JetBrains/IntelliJIdea2024.1/scratches/AdminDashboard';
import { AlertProvider } from '../../../../../../AppData/Roaming/JetBrains/IntelliJIdea2024.1/scratches/context/AlertContext';

jest.mock('axios');

describe('AdminDashboard', () => {
  const mockGates = [
    { id: 1, gateName: 'Gate 1', isOperational: true },
    { id: 2, gateName: 'Gate 2', isOperational: false },
  ];

  const mockUsers = [
    { id: 1, firstName: 'John', lastName: 'Doe', role: 'employee' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', role: 'employee' },
  ];

  beforeEach(() => {
    axios.get.mockResolvedValueOnce({ data: mockGates });
    axios.get.mockResolvedValueOnce({ data: mockUsers });
  });

  it('renders the AdminDashboard component', async () => {
    render(
      <AlertProvider>
        <AdminDashboard currentUser={{ firstName: 'Admin', lastName: 'User' }} />
      </AlertProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('Welcome, Admin User')).toBeInTheDocument();
    expect(screen.getByText('Gate 1: Open')).toBeInTheDocument();
    expect(screen.getByText('Gate 2: Closed')).toBeInTheDocument();
  });

  it('toggles the gate status', async () => {
    render(
      <AlertProvider>
        <AdminDashboard currentUser={{ firstName: 'Admin', lastName: 'User' }} />
      </AlertProvider>
    );

    const gateButton = await screen.findByText('Close Gate');
    fireEvent.click(gateButton);

    axios.patch.mockResolvedValueOnce({
      data: { id: 1, gateName: 'Gate 1', isOperational: false },
    });

    await waitFor(() => {
      expect(screen.getByText('Gate 1: Closed')).toBeInTheDocument();
    });
  });
});
