import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import Alerts from '../components/Alerts';
import { act } from 'react';
import React from 'react';

jest.mock('axios');

describe('Alerts', () => {
  const mockUserEmail = 'test@example.com';
  const mockUserId = '12345';
  const mockAlerts = [{ message: 'Test Alert 1' }, { message: 'Test Alert 2' }];

  beforeEach(() => {
    axios.get.mockClear();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test('fetches and displays alerts', async () => {
    axios.get.mockResolvedValueOnce({ data: [{ email: mockUserEmail, userId: mockUserId }] });
    axios.get.mockResolvedValueOnce({ data: mockAlerts });

    await act(async () => {
      render(<Alerts userEmail={mockUserEmail} />);
    });

    const alertItems = await waitFor(() => screen.getAllByTestId('alert-item'));
    expect(alertItems).toHaveLength(mockAlerts.length);
  });

  test('handles error when fetching users', async () => {
    axios.get.mockRejectedValueOnce(new Error('Error fetching users'));

    await act(async () => {
      render(<Alerts userEmail={mockUserEmail} />);
    });

    const alertItems = await waitFor(() => screen.queryAllByTestId('alert-item'));
    expect(alertItems).toHaveLength(0);
  });

  test('handles error when fetching alerts', async () => {
    axios.get.mockResolvedValueOnce({ data: [{ email: mockUserEmail, userId: mockUserId }] });
    axios.get.mockRejectedValueOnce(new Error('Error fetching alerts'));

    await act(async () => {
      render(<Alerts userEmail={mockUserEmail} />);
    });

    const alertItems = await waitFor(() => screen.queryAllByTestId('alert-item'));
    expect(alertItems).toHaveLength(0);
  });
});
