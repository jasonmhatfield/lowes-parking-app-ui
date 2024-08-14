import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EmployeeDashboardMobile from '../../components/EmployeeDashboardMobile';
import { useNavigate } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

describe('EmployeeDashboardMobile', () => {
  let mockNavigate;
  let user = { id: 1, firstName: 'John' };

  beforeEach(() => {
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    sessionStorage.setItem('loggedInUser', JSON.stringify(user));
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  test('renders the mobile dashboard with welcome message and logo', () => {
    render(<EmployeeDashboardMobile user={user} parkingSpots={[]} selectedFloor="1" handleFloorChange={() => {}} handleParking={() => {}} getIconForSpot={() => {}} handleLogout={() => {}} />);

    expect(screen.getByTestId('lowes-logo-mobile')).toBeInTheDocument();
    expect(screen.getByTestId('welcome-message-mobile')).toHaveTextContent('Welcome, John');
  });

  test('renders floor selection and handles floor change', () => {
    const handleFloorChange = jest.fn();

    render(<EmployeeDashboardMobile user={user} parkingSpots={[]} selectedFloor="1" handleFloorChange={handleFloorChange} handleParking={() => {}} getIconForSpot={() => {}} handleLogout={() => {}} />);

    fireEvent.change(screen.getByTestId('floor-select-mobile'), { target: { value: '2' } });
    expect(handleFloorChange).toHaveBeenCalledWith(expect.anything());
  });

  test('renders available parking spots and handles parking spot click', () => {
    const handleParking = jest.fn();
    const parkingSpots = [{ id: 1, spotNumber: '1A', occupied: false, type: 'regular' }];

    render(<EmployeeDashboardMobile user={user} parkingSpots={parkingSpots} selectedFloor="1" handleFloorChange={() => {}} handleParking={handleParking} getIconForSpot={() => <span>🚗</span>} handleLogout={() => {}} />);

    const parkingSpot = screen.getByTestId('parking-spot-1A');
    fireEvent.click(parkingSpot);
    expect(handleParking).toHaveBeenCalledWith(parkingSpots[0]);
  });

  test('displays a message when no parking spots are available', () => {
    render(<EmployeeDashboardMobile user={user} parkingSpots={[]} selectedFloor="1" handleFloorChange={() => {}} handleParking={() => {}} getIconForSpot={() => {}} handleLogout={() => {}} />);

    expect(screen.getByTestId('no-spots-message')).toHaveTextContent('No available spots on this floor.');
  });

  test('handles logout button click', () => {
    const handleLogout = jest.fn();

    render(<EmployeeDashboardMobile user={user} parkingSpots={[]} selectedFloor="1" handleFloorChange={() => {}} handleParking={() => {}} getIconForSpot={() => {}} handleLogout={handleLogout} />);

    const logoutButton = screen.getByTestId('logout-button-mobile');
    fireEvent.click(logoutButton);
    expect(handleLogout).toHaveBeenCalled();
  });
});
