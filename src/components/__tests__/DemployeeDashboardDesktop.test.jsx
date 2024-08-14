import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EmployeeDashboardDesktop from '../EmployeeDashboardDesktop';
import { useNavigate } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

describe('EmployeeDashboardDesktop', () => {
  let mockNavigate;
  let user = { id: 1, firstName: 'John', parkingSpotId: 1 };

  beforeEach(() => {
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    sessionStorage.setItem('loggedInUser', JSON.stringify(user));
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  test('renders the dashboard with welcome message and logo', () => {
    render(<EmployeeDashboardDesktop user={user} parkingSpots={[]} gates={[]} selectedFloor="1" handleFloorChange={() => {}} handleParking={() => {}} getButtonClass={() => {}} getIconForSpot={() => {}} handleLogout={() => {}} />);

    expect(screen.getByTestId('lowes-logo')).toBeInTheDocument();
    expect(screen.getByTestId('welcome-message')).toHaveTextContent('Welcome, John');
  });

  test('renders floor selection and handles floor change', () => {
    const handleFloorChange = jest.fn();

    render(<EmployeeDashboardDesktop user={user} parkingSpots={[]} gates={[]} selectedFloor="1" handleFloorChange={handleFloorChange} handleParking={() => {}} getButtonClass={() => {}} getIconForSpot={() => {}} handleLogout={() => {}} />);

    fireEvent.change(screen.getByTestId('floor-select'), { target: { value: '2' } });
    expect(handleFloorChange).toHaveBeenCalledWith(expect.anything());
  });

  test('renders parking spots and handles parking button click', () => {
    const handleParking = jest.fn();
    const parkingSpots = [{ id: 1, spotNumber: '1A', occupied: false, type: 'regular' }];

    render(<EmployeeDashboardDesktop user={user} parkingSpots={parkingSpots} gates={[]} selectedFloor="1" handleFloorChange={() => {}} handleParking={handleParking} getButtonClass={() => 'blue'} getIconForSpot={() => <span>🚗</span>} handleLogout={() => {}} />);

    const parkingButton = screen.getByTestId('parking-button-1A');
    fireEvent.click(parkingButton);
    expect(handleParking).toHaveBeenCalledWith(parkingSpots[0]);
  });

  test('renders gate status correctly', () => {
    const gates = [{ id: 1, gateName: 'Main Gate', operational: true }];

    render(<EmployeeDashboardDesktop user={user} parkingSpots={[]} gates={gates} selectedFloor="1" handleFloorChange={() => {}} handleParking={() => {}} getButtonClass={() => {}} getIconForSpot={() => {}} handleLogout={() => {}} />);

    const gateStatus = screen.getByTestId('gate-status-1');
    expect(gateStatus).toBeInTheDocument();
    expect(screen.getByTestId('gate-icon-open-1')).toBeInTheDocument();
    expect(gateStatus).toHaveTextContent('Main Gate (Open)');
  });

  test('handles logout button click', () => {
    const handleLogout = jest.fn();

    render(<EmployeeDashboardDesktop user={user} parkingSpots={[]} gates={[]} selectedFloor="1" handleFloorChange={() => {}} handleParking={() => {}} getButtonClass={() => {}} getIconForSpot={() => {}} handleLogout={handleLogout} />);

    const logoutButton = screen.getByTestId('logout-button-desktop');
    fireEvent.click(logoutButton);
    expect(handleLogout).toHaveBeenCalled();
  });
});
