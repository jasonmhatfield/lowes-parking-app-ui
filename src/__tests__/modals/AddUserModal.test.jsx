import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddUserModal from '../../modals/AddUserModal'; // Adjust the path as necessary

describe('AddUserModal Component', () => {
  it('renders the modal content with all input fields', () => {
    render(<AddUserModal onClose={() => {}} onSave={() => {}} />);

    expect(screen.getByTestId('modal-header')).toHaveTextContent('Add New User');
    expect(screen.getByTestId('first-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('last-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('handicap-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('ev-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
    expect(screen.getByTestId('save-button')).toBeInTheDocument();
  });

  it('calls onClose when the cancel button is clicked', () => {
    const handleClose = jest.fn();
    render(<AddUserModal onClose={handleClose} onSave={() => {}} />);

    fireEvent.click(screen.getByTestId('cancel-button'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onSave with the correct user data when the save button is clicked', () => {
    const handleSave = jest.fn();
    render(<AddUserModal onClose={() => {}} onSave={handleSave} />);

    fireEvent.change(screen.getByTestId('first-name-input'), { target: { value: 'John' } });
    fireEvent.change(screen.getByTestId('last-name-input'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'john.doe@example.com' } });
    fireEvent.click(screen.getByTestId('handicap-toggle'));
    fireEvent.click(screen.getByTestId('ev-toggle'));
    fireEvent.click(screen.getByTestId('save-button'));

    expect(handleSave).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      hasHandicapPlacard: true,
      hasEv: true,
      role: 'employee',
    });
  });

  it('toggles handicap and ev fields correctly', () => {
    render(<AddUserModal onClose={() => {}} onSave={() => {}} />);

    const handicapToggle = screen.getByTestId('handicap-toggle');
    const evToggle = screen.getByTestId('ev-toggle');

    expect(handicapToggle).not.toHaveClass('active');
    expect(evToggle).not.toHaveClass('active');

    fireEvent.click(handicapToggle);
    fireEvent.click(evToggle);

    expect(handicapToggle).toHaveClass('active');
    expect(evToggle).toHaveClass('active');
  });
});
