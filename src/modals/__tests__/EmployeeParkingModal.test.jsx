import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EmployeeParkingModal from '../EmployeeParkingModal';

describe('EmployeeParkingModal', () => {
  const mockHandleParking = jest.fn();
  const mockParkingSpots = [
    { id: 101, spotNumber: 1 },
    { id: 102, spotNumber: 2 },
  ];

  const setup = (userParkingSpotId) => {
    render(
      <EmployeeParkingModal
        open={true}
        userParkingSpotId={userParkingSpotId}
        parkingSpots={mockParkingSpots}
        handleParking={mockHandleParking}
      />
    );
  };

  test('renders modal with correct spot information', () => {
    setup(101);

    expect(screen.getByTestId('spot-display')).toHaveTextContent('You are currently parked in spot 1.');
  });

  test('renders correct message when no parking spot is provided', () => {
    setup(null);

    expect(screen.getByTestId('spot-display')).toHaveTextContent('You do not have a reserved parking spot.');
  });

  test('calls handleParking when Leave Spot button is clicked', () => {
    setup(101);

    fireEvent.click(screen.getByTestId('leave-button'));

    expect(mockHandleParking).toHaveBeenCalledWith({ id: 101, spotNumber: 1 });
  });

  test('Leave Spot button is clickable and correctly triggers event', () => {
    setup(101);

    const leaveButton = screen.getByTestId('leave-button');
    fireEvent.click(leaveButton);

    expect(mockHandleParking).toHaveBeenCalledTimes(1);
  });

  test('does not render Leave Spot button when no parking spot is provided', () => {
    setup(null);

    expect(screen.queryByTestId('leave-button')).toBeNull();
  });

  test('does not render anything when open is false', () => {
    render(
      <EmployeeParkingModal
        open={false}
        userParkingSpotId={101}
        parkingSpots={mockParkingSpots}
        handleParking={mockHandleParking}
      />
    );

    expect(screen.queryByTestId('spot-display')).toBeNull();
  });

});
