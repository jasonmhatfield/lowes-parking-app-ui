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

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const setup = async () => {
    render(<ManageGatesModal onClose={mockOnClose} />);
    // Wait for the modal header to appear, which indicates that the modal is fully rendered
    await waitFor(() => screen.getByTestId('modal-header'));
    // Wait for the gate elements to appear in the DOM
    await waitFor(() => screen.getByTestId('gate-name-1'));
  };

  test('renders and fetches gates correctly', async () => {
    await setup();

    expect(screen.getByTestId('gate-name-1')).toHaveTextContent('Gate 1');
    expect(screen.getByTestId('gate-name-2')).toHaveTextContent('Gate 2');
  });

  test('toggles gate operational status when clicked', async () => {
    await setup();

    const gate1 = screen.getByTestId('gate-item-1');
    expect(gate1).toHaveStyle('background-color: rgb(76, 175, 80)'); // Initial state: green (operational)

    fireEvent.click(gate1);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/gates/1?isOperational=false',
        expect.any(Object)
      );
    });

    expect(screen.getByTestId('gate-item-1')).toHaveStyle('background-color: rgb(244, 67, 54)'); // Updated state: red (non-operational)
  });

  test('calls onClose when Close button is clicked', async () => {
    await setup();

    const closeButton = screen.getByTestId('close-button');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('handles fetch error when fetching gates', async () => {
    global.fetch.mockImplementationOnce(() => Promise.reject(new Error('Failed to fetch')));

    await setup();

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error fetching gates:', expect.any(Error));
    });
  });
});
