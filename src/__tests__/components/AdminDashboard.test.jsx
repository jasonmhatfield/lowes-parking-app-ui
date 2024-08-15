import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import AdminDashboard from '../../components/AdminDashboard';

// Mock the react-router-dom's useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the modal components
jest.mock('../../modals/ManageGatesModal', () => ({ onClose }) => (
  <div data-testid="manage-gates-modal">
    Manage Gates Modal
    <button onClick={onClose}>Close</button>
  </div>
));

jest.mock('../../modals/ManageParkingSpacesModal', () => ({ onClose }) => (
  <div data-testid="manage-parking-spaces-modal">
    Manage Parking Spaces Modal
    <button onClick={onClose}>Close</button>
  </div>
));

jest.mock('../../modals/ManageUsersModal', () => ({ onClose }) => (
  <div data-testid="manage-users-modal">
    Manage Users Modal
    <button onClick={onClose}>Close</button>
  </div>
));

jest.mock('../../modals/AddUserModal', () => ({ onClose, onSave }) => (
  <div data-testid="add-user-modal">
    Add User Modal
    <button onClick={() => onSave({ name: 'Test User' })}>Save</button>
    <button onClick={onClose}>Close</button>
  </div>
));

// Mock fetch globally
global.fetch = jest.fn();

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
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  test('renders AdminDashboard with all buttons', () => {
    renderWithRouter(<AdminDashboard />);
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage Gates' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage Parking Spaces' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage Users' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
  });

  test('opens and closes Manage Gates Modal', async () => {
    renderWithRouter(<AdminDashboard />);
    fireEvent.click(screen.getByRole('button', { name: 'Manage Gates' }));
    expect(screen.getByTestId('manage-gates-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(screen.queryByTestId('manage-gates-modal')).not.toBeInTheDocument();
    });
  });

  test('opens and closes Manage Parking Spaces Modal', async () => {
    renderWithRouter(<AdminDashboard />);
    fireEvent.click(screen.getByRole('button', { name: 'Manage Parking Spaces' }));
    expect(screen.getByTestId('manage-parking-spaces-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(screen.queryByTestId('manage-parking-spaces-modal')).not.toBeInTheDocument();
    });
  });

  test('opens and closes Manage Users Modal', async () => {
    renderWithRouter(<AdminDashboard />);
    fireEvent.click(screen.getByRole('button', { name: 'Manage Users' }));
    expect(screen.getByTestId('manage-users-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(screen.queryByTestId('manage-users-modal')).not.toBeInTheDocument();
    });
  });

  test('opens and closes Add User Modal', async () => {
    renderWithRouter(<AdminDashboard />);
    fireEvent.click(screen.getByRole('button', { name: 'Add User' }));
    expect(screen.getByTestId('add-user-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(screen.queryByTestId('add-user-modal')).not.toBeInTheDocument();
    });
  });

  test('handles logout', () => {
    renderWithRouter(<AdminDashboard />);
    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('handles adding a user successfully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    renderWithRouter(<AdminDashboard />);
    fireEvent.click(screen.getByRole('button', { name: 'Add User' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/api/users', expect.any(Object));
      expect(screen.queryByTestId('add-user-modal')).not.toBeInTheDocument();
    });
  });

  test('handles adding a user with API error', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderWithRouter(<AdminDashboard />);
    fireEvent.click(screen.getByRole('button', { name: 'Add User' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/api/users', expect.any(Object));
      expect(consoleSpy).toHaveBeenCalledWith('Error adding user');
      expect(screen.getByTestId('add-user-modal')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  test('handles adding a user with network error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderWithRouter(<AdminDashboard />);
    fireEvent.click(screen.getByRole('button', { name: 'Add User' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/api/users', expect.any(Object));
      expect(consoleSpy).toHaveBeenCalledWith('Error adding user:', expect.any(Error));
      expect(screen.getByTestId('add-user-modal')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });
});