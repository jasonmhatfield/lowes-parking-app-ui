import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ManageGatesModal from '../ManageGatesModal';

describe('ManageGatesModal', () => {
  const mockOnClose = jest.fn();
  const mockGates = [
    { id: 1, gateName: 'Gate 1', operational: true },
    { id: 2, gateName: 'Gate 2', operational: false },
  ];

  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url.endsWith('/api/gates')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGates),
        });
      } else if (url.includes('/api/gates/')) {
        return Promise.resolve({ ok: true });
      }
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const setup = () => {
    render(<ManageGatesModal onClose={mockOnClose} />);
  };

  test('renders and fetches gates correctly', async () => {
    setup();

    await waitFor(() => {
      expect(screen.getByTestId('gate-name-1')).toHaveTextContent('Gate 1');
      expect(screen.getByTestId('gate-name-2')).toHaveTextContent('Gate 2');
    });
  });

  test('toggles gate operational status when clicked', async () => {
    setup();

    // Initial state check
    const gate1 = await screen.findByTestId('gate-item-1');
    expect(gate1).toHaveStyle('background-color: rgb(76, 175, 80)'); // Initial state: green (operational)

    // Trigger toggle
    fireEvent.click(gate1);

    // Wait for the state to update and re-render
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/gates/1?isOperational=false',
        expect.any(Object)
      );
    });

    // Verify the updated state
    await waitFor(() => {
      expect(screen.getByTestId('gate-item-1')).toHaveStyle('background-color: rgb(244, 67, 54)'); // Updated state: red (non-operational)
    });
  });

  test('calls onClose when Close button is clicked', async () => {
    setup();

    const closeButton = screen.getByTestId('close-button');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
