import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import AdminDashboard from '../AdminDashboard';

// Helper to render with Router
const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(
    <Router>
      {ui}
    </Router>
  );
};

describe('AdminDashboard', () => {
  const setup = () => {
    renderWithRouter(<AdminDashboard />);
  };

  test('renders Admin Dashboard title and buttons, and handles modals correctly', async () => {
    setup();

    // Check for title and main buttons
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage Gates' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage Parking Spaces' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage Users' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();

    // Manage Gates Modal
    fireEvent.click(screen.getByRole('button', { name: 'Manage Gates' }));
    const gatesModalHeader = screen.getAllByText('Manage Gates')[1]; // Select the modal header, which should be the second occurrence
    expect(gatesModalHeader).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close'));
    await waitFor(() => expect(gatesModalHeader).not.toBeInTheDocument());

    // Manage Parking Spaces Modal
    fireEvent.click(screen.getByRole('button', { name: 'Manage Parking Spaces' }));
    const parkingModalHeader = screen.getAllByText('Manage Parking Spaces')[1]; // Select the modal header
    expect(parkingModalHeader).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close'));
    await waitFor(() => expect(parkingModalHeader).not.toBeInTheDocument());

    // Manage Users Modal
    fireEvent.click(screen.getByRole('button', { name: 'Manage Users' }));
    const usersModalHeader = screen.getAllByText('Manage Users')[1]; // Select the modal header
    expect(usersModalHeader).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close'));
    await waitFor(() => expect(usersModalHeader).not.toBeInTheDocument());
  });

  test('opens and closes Add User Modal and handles Add User action with error handling', async () => {
    setup();

    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    };

    global.fetch = jest.fn().mockResolvedValueOnce(mockResponse);

    fireEvent.click(screen.getByRole('button', { name: 'Add User' }));
    expect(screen.getByText('Add New User')).toBeInTheDocument(); // Confirm the Add User modal is present

    // Fill in the form fields
    fireEvent.change(screen.getByTestId('first-name-input'), { target: { value: 'John' } });
    fireEvent.change(screen.getByTestId('last-name-input'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'johndoe@example.com' } });

    // Debugging: Log the input values to ensure they are being updated correctly
    console.log('First Name Input Value:', screen.getByTestId('first-name-input').value);
    console.log('Last Name Input Value:', screen.getByTestId('last-name-input').value);
    console.log('Email Input Value:', screen.getByTestId('email-input').value);

    fireEvent.click(screen.getByTestId('save-button')); // Trigger the save action

    // Debugging: Check if fetch is being called
    console.log('Fetch function called:', global.fetch.mock.calls.length > 0);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          email: 'johndoe@example.com',
          hasHandicapPlacard: false,
          hasEv: false,
          role: 'employee',
        }),
      });
    });

    expect(mockResponse.json).toHaveBeenCalled();

    // Error handling when the response is not ok
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: false });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    fireEvent.click(screen.getByTestId('save-button'));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error adding user');
    });

    // Error handling for a fetch error
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));

    fireEvent.click(screen.getByTestId('save-button'));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error adding user:', new Error('Network error'));
    });

    consoleErrorSpy.mockRestore();
  });

  test('handles logout', () => {
    setup();

    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));

    expect(window.location.pathname).toBe('/'); // Assuming Logout redirects to home
  });
});
