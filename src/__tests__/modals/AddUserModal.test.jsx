import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddUserModal from '../../modals/AddUserModal';

describe('AddUserModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    render(<AddUserModal onClose={mockOnClose} onSave={mockOnSave} />);
  });

  test('renders the modal with correct elements', () => {
    expect(screen.getByTestId('add-user-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-header')).toHaveTextContent('Add New User');
    expect(screen.getByTestId('first-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('last-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('handicap-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('ev-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
    expect(screen.getByTestId('save-button')).toBeInTheDocument();
  });

  test('handles input changes correctly', () => {
    fireEvent.change(screen.getByTestId('first-name-input'), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByTestId('last-name-input'), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'john.doe@example.com' },
    });

    expect(screen.getByTestId('first-name-input')).toHaveValue('John');
    expect(screen.getByTestId('last-name-input')).toHaveValue('Doe');
    expect(screen.getByTestId('email-input')).toHaveValue('john.doe@example.com');
  });

  test('handles toggle button clicks correctly', () => {
    fireEvent.click(screen.getByTestId('handicap-toggle'));
    expect(screen.getByTestId('handicap-toggle')).toHaveClass('active');

    fireEvent.click(screen.getByTestId('ev-toggle'));
    expect(screen.getByTestId('ev-toggle')).toHaveClass('active');
  });

  test('calls onSave with correct data when save button is clicked', () => {
    fireEvent.change(screen.getByTestId('first-name-input'), {
      target: { value: 'Jane' },
    });
    fireEvent.change(screen.getByTestId('last-name-input'), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'jane.doe@example.com' },
    });
    fireEvent.click(screen.getByTestId('handicap-toggle'));
    fireEvent.click(screen.getByTestId('ev-toggle'));

    fireEvent.click(screen.getByTestId('save-button'));

    expect(mockOnSave).toHaveBeenCalledWith({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      hasHandicapPlacard: true,
      hasEv: true,
      role: 'employee',
    });
  });

  test('calls onClose when cancel button is clicked', () => {
    fireEvent.click(screen.getByTestId('cancel-button'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
