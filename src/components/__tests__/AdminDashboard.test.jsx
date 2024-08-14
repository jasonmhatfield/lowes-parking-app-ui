import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from '../AdminDashboard';

test('renders AdminDashboard and handles modals visibility', async () => {
  render(
    <BrowserRouter>
      <AdminDashboard />
    </BrowserRouter>
  );

  // Check if the title is rendered
  expect(screen.getByTestId('dashboard-title')).toBeInTheDocument();

  // Check if the action buttons are rendered
  expect(screen.getByTestId('manage-gates-button')).toBeInTheDocument();
  expect(screen.getByTestId('manage-parking-spaces-button')).toBeInTheDocument();
  expect(screen.getByTestId('manage-users-button')).toBeInTheDocument();
  expect(screen.getByTestId('add-user-button')).toBeInTheDocument();
  expect(screen.getByTestId('logout-button')).toBeInTheDocument();

  // Simulate clicking on "Manage Gates" button and wait for the modal to be shown
  fireEvent.click(screen.getByTestId('manage-gates-button'));
  await waitFor(() => {
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });

  // Close the modal by clicking the close button inside the modal
  fireEvent.click(screen.getByText('Close'));

  // Simulate clicking on "Manage Parking Spaces" button and wait for the modal to be shown
  fireEvent.click(screen.getByTestId('manage-parking-spaces-button'));
  await waitFor(() => {
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });

  // Close the modal by clicking the close button inside the modal
  fireEvent.click(screen.getByText('Close'));

  // Simulate clicking on "Manage Users" button and wait for the modal to be shown
  fireEvent.click(screen.getByTestId('manage-users-button'));
  await waitFor(() => {
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });

  // Close the modal by clicking the close button inside the modal
  fireEvent.click(screen.getByText('Close'));

  // Simulate clicking on "Add User" button and wait for the modal to be shown
  fireEvent.click(screen.getByTestId('add-user-button'));
  await waitFor(() => {
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });
});
