import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EmployeeParkingModal from '../EmployeeParkingModal';

describe('EmployeeParkingModal', () => {
  const mockHandleParking = jest.fn();
  const mockParkingSpots = [
    { id: 101, floor: 1, number: 1 },
    { id: 102, floor: 1, number: 2 },
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

  test('renders modal with correct floor and spot information', () => {
    setup(101);

    expect(screen.getByTestId('floor-display')).toHaveTextContent('Floor 1');
    expect(screen.getByTestId('spot-display')).toHaveTextContent('Spot 1');
  });

  test('renders "Floor" and "Spot" when no parking spot is provided', () => {
    setup(null);

    expect(screen.getByTestId('floor-display')).toHaveTextContent('Floor');
    expect(screen.getByTestId('spot-display')).toHaveTextContent('Spot');
  });

  test('calls handleParking when Leave Spot button is clicked', () => {
    setup(101);

    fireEvent.click(screen.getByTestId('leave-button'));

    expect(mockHandleParking).toHaveBeenCalledWith({ id: 101, floor: 1, number: 1 });
  });

  test('Leave Spot button is clickable and correctly triggers event', () => {
    setup(101);

    const leaveButton = screen.getByTestId('leave-button');
    fireEvent.click(leaveButton);

    expect(mockHandleParking).toHaveBeenCalledTimes(1);
  });
});
