import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from '../AdminDashboard';

describe('AdminDashboard', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
  });

  test('renders the AdminDashboard title and action buttons', () => {
    expect(screen.getByTestId('dashboard-title')).toBeInTheDocument();
    expect(screen.getByTestId('manage-gates-button')).toBeInTheDocument();
    expect(screen.getByTestId('manage-parking-spaces-button')).toBeInTheDocument();
    expect(screen.getByTestId('manage-users-button')).toBeInTheDocument();
    expect(screen.getByTestId('add-user-button')).toBeInTheDocument();
    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
  });

  test('handles "Manage Gates" modal visibility', async () => {
    fireEvent.click(screen.getByTestId('manage-gates-button'));
    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Close'));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  test('handles "Manage Parking Spaces" modal visibility', async () => {
    fireEvent.click(screen.getByTestId('manage-parking-spaces-button'));
    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Close'));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  test('handles "Manage Users" modal visibility', async () => {
    fireEvent.click(screen.getByTestId('manage-users-button'));
    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Close'));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  test('handles "Add User" modal visibility and cancel', async () => {
    fireEvent.click(screen.getByTestId('add-user-button'));
    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('cancel-button'));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  test('handles adding a user successfully and closing the modal', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    fireEvent.click(screen.getByTestId('add-user-button'));
    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);

    // Wait for the modal to close
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Ensure setShowAddUserModal(false) was called by checking that the modal is no longer in the document
    expect(screen.queryByTestId('add-user-button')).toBeInTheDocument();
  });

  test('handles adding a user with an error', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
      })
    );

    fireEvent.click(screen.getByTestId('add-user-button'));
    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);

    // Ensure modal does not close on error
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  test('handles logout button click and page navigation', async () => {
    fireEvent.click(screen.getByTestId('logout-button'));
    await waitFor(() => {
      expect(window.location.pathname).toBe('/');
    });
  });
});
