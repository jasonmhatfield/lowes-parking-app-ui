import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import LandingPage from '../components/LandingPage';
import { BrowserRouter } from 'react-router-dom';

jest.mock('axios');

describe('LandingPage', () => {
  const mockUsers = [
    { id: 1, firstName: 'John', lastName: 'Doe', role: 'employee' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', role: 'admin' },
  ];

  beforeEach(() => {
    axios.get.mockResolvedValueOnce({ data: mockUsers });
  });

  it('renders the LandingPage component', async () => {
    render(
      <BrowserRouter>
        <LandingPage onSelectUser={jest.fn()} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Select User to Log In')).toBeInTheDocument();
    });

    expect(screen.getByText('John Doe - employee')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith - admin')).toBeInTheDocument();
  });

  it('handles user selection', async () => {
    const mockOnSelectUser = jest.fn();
    render(
      <BrowserRouter>
        <LandingPage onSelectUser={mockOnSelectUser} />
      </BrowserRouter>
    );

    const userButton = await screen.findByText('John Doe - employee');
    fireEvent.click(userButton);

    expect(mockOnSelectUser).toHaveBeenCalledWith(mockUsers[0]);
  });
});
