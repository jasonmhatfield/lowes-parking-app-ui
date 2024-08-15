import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ManageGatesModal from '../../modals/ManageGatesModal';

// Mock the Modal component
jest.mock('../../components/Modal', () => ({ children, onClose }) => (
  <div data-testid="modal">
    {children}
    <button onClick={onClose}>Close Modal</button>
  </div>
));

// Mock MUI icons
jest.mock('@mui/icons-material/LockOpen', () => () => <div data-testid="lock-open-icon" />);
jest.mock('@mui/icons-material/Lock', () => () => <div data-testid="lock-icon" />);

// Mock fetch globally
global.fetch = jest.fn();

describe('ManageGatesModal', () => {
  const mockGates = [
    { id: 1, gateName: 'Gate 1', operational: true },
    { id: 2, gateName: 'Gate 2', operational: false },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  test('renders ManageGatesModal and fetches gates', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockGates),
    });

    await act(async () => {
      render(<ManageGatesModal onClose={() => {}} />);
    });

    expect(screen.getByText('Manage Gates')).toBeInTheDocument();
    expect(screen.getByText('Gate 1')).toBeInTheDocument();
    expect(screen.getByText('Gate 2')).toBeInTheDocument();
    expect(screen.getByTestId('lock-open-icon')).toBeInTheDocument();
    expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
  });

  test('handles fetch gates error', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      render(<ManageGatesModal onClose={() => {}} />);
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error fetching gates:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  test('handles gate toggle', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGates),
      })
      .mockResolvedValueOnce({
        ok: true,
      });

    await act(async () => {
      render(<ManageGatesModal onClose={() => {}} />);
    });

    const gate1 = screen.getByText('Gate 1').closest('.gate-item');
    await act(async () => {
      fireEvent.click(gate1);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/gates/1?isOperational=false',
      expect.any(Object)
    );
  });

  test('handles toggle gate error', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGates),
      })
      .mockResolvedValueOnce({
        ok: false,
      });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      render(<ManageGatesModal onClose={() => {}} />);
    });

    const gate1 = screen.getByText('Gate 1').closest('.gate-item');
    await act(async () => {
      fireEvent.click(gate1);
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error updating gate status:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  test('closes the modal', async () => {
    const mockOnClose = jest.fn();
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockGates),
    });

    await act(async () => {
      render(<ManageGatesModal onClose={mockOnClose} />);
    });

    fireEvent.click(screen.getByText('Close Modal'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});