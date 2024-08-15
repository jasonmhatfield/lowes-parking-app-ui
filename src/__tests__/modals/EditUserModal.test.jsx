import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditUserModal from '../../modals/EditUserModal';

describe('EditUserModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn().mockResolvedValue(true);
  const mockUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    hasHandicapPlacard: true,
    hasEv: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    render(<EditUserModal user={mockUser} onClose={mockOnClose} onSave={mockOnSave} />);
  });

  test('renders the modal with correct initial values', () => {
    expect(screen.getByTestId('edit-user-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-header')).toHaveTextContent('Edit User');
    expect(screen.getByTestId('first-name-input')).toHaveValue(mockUser.firstName);
    expect(screen.getByTestId('last-name-input')).toHaveValue(mockUser.lastName);
    expect(screen.getByTestId('email-input')).toHaveValue(mockUser.email);

    // Check the style applied for active state instead of class
    expect(screen.getByTestId('handicap-toggle')).toHaveStyle('background-color: #4caf50');
    expect(screen.getByTestId('ev-toggle')).toHaveStyle('background-color: #555573');
  });

  test('handles input changes correctly', () => {
    fireEvent.change(screen.getByTestId('first-name-input'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByTestId('last-name-input'), { target: { value: 'Smith' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'jane.smith@example.com' } });

    expect(screen.getByTestId('first-name-input')).toHaveValue('Jane');
    expect(screen.getByTestId('last-name-input')).toHaveValue('Smith');
    expect(screen.getByTestId('email-input')).toHaveValue('jane.smith@example.com');
  });

  test('toggles button states correctly', () => {
    fireEvent.click(screen.getByTestId('handicap-toggle'));
    expect(screen.getByTestId('handicap-toggle')).toHaveStyle('background-color: #555573');

    fireEvent.click(screen.getByTestId('ev-toggle'));
    expect(screen.getByTestId('ev-toggle')).toHaveStyle('background-color: #4caf50');
  });

  test('calls onSave with correct data when save button is clicked', async () => {
    fireEvent.change(screen.getByTestId('first-name-input'), { target: { value: 'Jane' } });
    fireEvent.click(screen.getByTestId('ev-toggle'));
    fireEvent.click(screen.getByTestId('save-button'));

    await waitFor(() => expect(mockOnSave).toHaveBeenCalledWith({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      hasHandicapPlacard: true,
      hasEv: true,
    }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('disables buttons while saving', async () => {
    fireEvent.click(screen.getByTestId('save-button'));

    expect(screen.getByTestId('save-button')).toBeDisabled();
    expect(screen.getByTestId('cancel-button')).toBeDisabled();

    await waitFor(() => expect(mockOnSave).toHaveBeenCalled());
  });

  test('calls onClose when cancel button is clicked', () => {
    fireEvent.click(screen.getByTestId('cancel-button'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('handles save error correctly', async () => {
    console.error = jest.fn(); // Mock console.error
    const errorMessage = 'Failed to save user';
    mockOnSave.mockRejectedValueOnce(new Error(errorMessage));

    fireEvent.click(screen.getByTestId('save-button'));

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error saving user:', new Error(errorMessage));
      expect(screen.getByTestId('save-button')).not.toBeDisabled();
      expect(screen.getByTestId('cancel-button')).not.toBeDisabled();
    });
  });
});

