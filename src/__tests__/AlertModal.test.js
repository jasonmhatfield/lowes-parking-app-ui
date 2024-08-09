import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AlertModal from '../modals/AlertModal';

describe('AlertModal', () => {
  it('renders the AlertModal component', () => {
    render(<AlertModal open={true} onClose={jest.fn()} message="Test Alert" />);

    expect(screen.getByText('Alert')).toBeInTheDocument();
    expect(screen.getByText('Test Alert')).toBeInTheDocument();
  });

  it('calls onClose when OK button is clicked', () => {
    const mockOnClose = jest.fn();
    render(<AlertModal open={true} onClose={mockOnClose} message="Test Alert" />);

    const okButton = screen.getByText('OK');
    fireEvent.click(okButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
