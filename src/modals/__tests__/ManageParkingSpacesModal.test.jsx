import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ManageParkingSpacesModal from '../ManageParkingSpacesModal';

describe('ManageParkingSpacesModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    render(<ManageParkingSpacesModal onClose={mockOnClose} />);
  });

  test('renders the modal with correct title', () => {
    const title = screen.getByText('Manage Parking Spaces');
    expect(title).toBeInTheDocument();
  });

  test('renders filter buttons', () => {
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Occupied')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  test('close button works correctly', () => {
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
