import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ManageParkingSpacesModal from '../ManageParkingSpacesModal';
import * as parkingSpotsService from '../../services/parkingSpotsService';

// Mock the Modal component
jest.mock('../../components/Modal', () => ({ children, onClose }) => (
  <div data-testid="modal">
    {children}
    <button onClick={onClose} data-testid="close-modal-button">Close Modal</button>
  </div>
));

// Mock the Button component
jest.mock('../../components/Button', () => ({ children, onClick, active, disabled, className }) => (
  <button onClick={onClick} disabled={disabled} className={className} data-active={active} data-testid={`button-${children.toLowerCase()}`}>
    {children}
  </button>
));

// Mock MUI icons
jest.mock('@mui/icons-material/DirectionsCar', () => () => <div data-testid="car-icon" />);
jest.mock('@mui/icons-material/EvStation', () => () => <div data-testid="ev-icon" />);
jest.mock('@mui/icons-material/Accessible', () => () => <div data-testid="handicap-icon" />);
jest.mock('@mui/icons-material/LocalParking', () => () => <div data-testid="parking-icon" />);

// Mock parkingSpotsService
jest.mock('../../services/parkingSpotsService');

describe('ManageParkingSpacesModal', () => {
  const mockParkingSpots = [
    { id: 1, spotNumber: 'A1', type: 'regular', occupied: false },
    { id: 2, spotNumber: 'A2', type: 'ev', occupied: true, userId: 1 },
    { id: 3, spotNumber: 'A3', type: 'handicap', occupied: false },
    { id: 4, spotNumber: 'A4', type: 'ev', occupied: false },
  ];

  const mockUserMap = {
    1: 'John Doe',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    parkingSpotsService.fetchParkingSpotsData.mockResolvedValue({
      spotsData: mockParkingSpots,
      userMapData: mockUserMap,
    });
    parkingSpotsService.setupWebSocketConnection.mockImplementation((callback) => {
      callback(mockParkingSpots[0]);
      return { disconnect: jest.fn() };
    });
  });

  test('renders ManageParkingSpacesModal and fetches data', async () => {
    await act(async () => {
      render(<ManageParkingSpacesModal onClose={() => {}} />);
    });

    expect(screen.getByText('Manage Parking Spaces')).toBeInTheDocument();
    expect(screen.getByText('A1')).toBeInTheDocument();
    expect(screen.getByText('A2')).toBeInTheDocument();
    expect(screen.getByText('A3')).toBeInTheDocument();
    expect(screen.getByText('A4')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('handles WebSocket updates', async () => {
    await act(async () => {
      render(<ManageParkingSpacesModal onClose={() => {}} />);
    });

    expect(parkingSpotsService.setupWebSocketConnection).toHaveBeenCalled();
  });

  test('filters parking spots', async () => {
    await act(async () => {
      render(<ManageParkingSpacesModal onClose={() => {}} />);
    });

    fireEvent.click(screen.getByTestId('button-occupied'));
    expect(screen.queryByText('A1')).not.toBeInTheDocument();
    expect(screen.getByText('A2')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('button-available'));
    expect(screen.getByText('A1')).toBeInTheDocument();
    expect(screen.queryByText('A2')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('button-all'));
    expect(screen.getByText('A1')).toBeInTheDocument();
    expect(screen.getByText('A2')).toBeInTheDocument();
  });

  test('removes user from spot', async () => {
    parkingSpotsService.removeUserFromSpot.mockResolvedValue({ ...mockParkingSpots[1], occupied: false, userId: null });

    await act(async () => {
      render(<ManageParkingSpacesModal onClose={() => {}} />);
    });

    const removeButton = screen.getByText('Remove');
    await act(async () => {
      fireEvent.click(removeButton);
    });

    expect(parkingSpotsService.removeUserFromSpot).toHaveBeenCalledWith(2);
  });

  test('handles remove user error', async () => {
    parkingSpotsService.removeUserFromSpot.mockRejectedValue(new Error('Failed to remove user'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      render(<ManageParkingSpacesModal onClose={() => {}} />);
    });

    const removeButton = screen.getByText('Remove');
    await act(async () => {
      fireEvent.click(removeButton);
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error removing user from spot:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  test('handles fetch data error', async () => {
    parkingSpotsService.fetchParkingSpotsData.mockRejectedValue(new Error('Failed to fetch data'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      render(<ManageParkingSpacesModal onClose={() => {}} />);
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error fetching data:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  test('closes the modal', async () => {
    const mockOnClose = jest.fn();

    await act(async () => {
      render(<ManageParkingSpacesModal onClose={mockOnClose} />);
    });

    fireEvent.click(screen.getByTestId('close-modal-button'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('renders correct icons for different spot types', async () => {
    await act(async () => {
      render(<ManageParkingSpacesModal onClose={() => {}} />);
    });

    expect(screen.getByTestId('car-icon')).toBeInTheDocument(); // For occupied spot
    expect(screen.getByTestId('ev-icon')).toBeInTheDocument(); // For EV spot
    expect(screen.getByTestId('handicap-icon')).toBeInTheDocument();
    expect(screen.getByTestId('parking-icon')).toBeInTheDocument(); // For regular available spot
  });

  test('handles updating state', async () => {
    parkingSpotsService.removeUserFromSpot.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ ...mockParkingSpots[1], occupied: false, userId: null }), 100)));

    await act(async () => {
      render(<ManageParkingSpacesModal onClose={() => {}} />);
    });

    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);

    expect(removeButton).toBeDisabled();

    await waitFor(() => {
      expect(removeButton).not.toBeInTheDocument();
    });
  });
});