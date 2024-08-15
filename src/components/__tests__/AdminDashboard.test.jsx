import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import AdminDashboard from '../AdminDashboard';

// Wrap the component in a Router for testing
const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);

  return render(
    <Router>
      {ui}
    </Router>
  );
};

describe('AdminDashboard', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Mock console.error to avoid cluttering the test output
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const setup = () => {
    renderWithRouter(<AdminDashboard />);
  };

  test('renders Admin Dashboard title', () => {
    setup();
    const title = screen.getByTestId('dashboard-title');
    expect(title).toHaveTextContent('Admin Dashboard');
  });

  test('opens and closes Add User Modal', async () => {
    setup();
    const addUserButton = await waitFor(() => screen.getByTestId('add-user-button'));

    // Open the modal
    fireEvent.click(addUserButton);

    // Wait for the modal to appear in the DOM
    await waitFor(() => {
      expect(screen.queryByTestId('add-user-modal')).toBeInTheDocument();
    });

    // Close the modal
    fireEvent.click(screen.getByTestId('cancel-button'));

    // Ensure the modal is closed
    await waitFor(() => {
      expect(screen.queryByTestId('add-user-modal')).not.toBeInTheDocument();
    });
  });

  test('opens Manage Gates Modal when Manage Gates button is clicked', async () => {
    setup();
    const manageGatesButton = await waitFor(() => screen.getByTestId('manage-gates-button'));

    // Click the Manage Gates button
    fireEvent.click(manageGatesButton);

    // Wait for the modal to appear in the DOM
    await waitFor(() => {
      expect(screen.queryByTestId('manage-gates-modal')).toBeInTheDocument();
    });
  });

  test('opens Manage Parking Spaces Modal when Manage Parking Spaces button is clicked', async () => {
    setup();
    const manageParkingSpacesButton = await waitFor(() => screen.getByTestId('manage-parking-spaces-button'));

    // Click the Manage Parking Spaces button
    fireEvent.click(manageParkingSpacesButton);

    // Wait for the modal to appear in the DOM
    await waitFor(() => {
      expect(screen.queryByTestId('manage-parking-spaces-modal')).toBeInTheDocument();
    });
  });

  test('opens Manage Users Modal when Manage Users button is clicked', async () => {
    setup();
    const manageUsersButton = await waitFor(() => screen.getByTestId('manage-users-button'));

    // Click the Manage Users button
    fireEvent.click(manageUsersButton);

    // Wait for the modal to appear in the DOM
    await waitFor(() => {
      expect(screen.queryByTestId('manage-users-modal')).toBeInTheDocument();
    });
  });

  test('handles logout', async () => {
    setup();
    const logoutButton = await waitFor(() => screen.getByTestId('logout-button'));

    // Trigger logout
    fireEvent.click(logoutButton);

    // Verify that the navigation occurs
    await waitFor(() => {
      expect(window.location.pathname).toBe('/');
    });
  });
});
