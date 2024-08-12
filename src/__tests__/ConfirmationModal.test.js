import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmationModal from '../modals/ConfirmationModal';

describe('ConfirmationModal', () => {
  it('renders the ConfirmationModal component', () => {
    render(<ConfirmationModal open={true} onClose={jest.fn()} onConfirm={jest.fn()} message="Are you sure?" />);

    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('calls onConfirm when Confirm button is clicked', () => {
    const mockOnConfirm = jest.fn();
    render(<ConfirmationModal open={true} onClose={jest.fn()} onConfirm={mockOnConfirm} message="Are you sure?" />);

    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalled();
  });
});
