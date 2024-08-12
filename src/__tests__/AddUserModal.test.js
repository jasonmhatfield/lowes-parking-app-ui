import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddUserModal from '../modals/AddUserModal';

describe('AddUserModal', () => {
  it('renders the AddUserModal component', () => {
    render(<AddUserModal open={true} onClose={jest.fn()} onSave={jest.fn()} />);

    expect(screen.getByText('Add User')).toBeInTheDocument();
  });

  it('handles input changes and save action', () => {
    const mockOnSave = jest.fn();
    render(<AddUserModal open={true} onClose={jest.fn()} onSave={mockOnSave} />);

    const firstNameInput = screen.getByLabelText('First Name');
    fireEvent.change(firstNameInput, { target: { value: 'John' } });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({ firstName: 'John' }));
  });
});
