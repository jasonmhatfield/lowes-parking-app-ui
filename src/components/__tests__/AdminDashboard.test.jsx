import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import AdminDashboard from '../AdminDashboard';

describe('AdminDashboard', () => {
  const renderComponent = () =>
    render(
      <Router>
        <AdminDashboard />
      </Router>
    );

  it('renders Admin Dashboard title', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId('dashboard-title')).toHaveTextContent('Admin Dashboard');
  });

  it('opens and closes Add User Modal', async () => {
    const { getByTestId, queryByTestId } = renderComponent();

    // Open the modal
    await act(async () => {
      fireEvent.click(getByTestId('add-user-button'));
    });

    // Wait for the modal to appear in the DOM
    await waitFor(() => {
      expect(queryByTestId('add-user-modal')).toBeInTheDocument();
    });

    // Close the modal
    await act(async () => {
      fireEvent.click(getByTestId('cancel-button'));
    });

    // Wait for the modal to be removed from the DOM
    await waitFor(() => {
      expect(queryByTestId('add-user-modal')).not.toBeInTheDocument();
    });
  });

  it('handles logout', async () => {
    const { getByTestId } = renderComponent();

    await act(async () => {
      fireEvent.click(getByTestId('logout-button'));
    });

    expect(window.location.pathname).toBe('/');
  });
});
