import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Modal from '../../components/Modal'; // Adjust the path as necessary

jest.useFakeTimers();

describe('Modal Component', () => {
  test('renders the modal content when open', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <h1 data-testid="modal-title">Test Modal</h1>
      </Modal>
    );

    expect(screen.getByTestId('modal-title')).toBeInTheDocument();
  });

  test('does not render the modal content when closed', () => {
    render(
      <Modal open={false} onClose={() => {}}>
        <h1 data-testid="modal-title">Test Modal</h1>
      </Modal>
    );

    expect(screen.queryByTestId('modal-title')).not.toBeInTheDocument();
  });

  test('does not close the modal when clicking inside the content', () => {
    const handleClose = jest.fn();

    render(
      <Modal open={true} onClose={handleClose}>
        <h1 data-testid="modal-title">Test Modal</h1>
      </Modal>
    );

    fireEvent.click(screen.getByTestId('modal-title'));

    expect(handleClose).not.toHaveBeenCalled();
  });

  test('animates in when opened', () => {
    const { rerender } = render(
      <Modal open={false} onClose={() => {}}>
        <h1 data-testid="modal-title">Test Modal</h1>
      </Modal>
    );

    rerender(
      <Modal open={true} onClose={() => {}}>
        <h1 data-testid="modal-title">Test Modal</h1>
      </Modal>
    );

    expect(screen.getByTestId('modal-overlay')).toHaveStyle('display: none');

    act(() => {
      jest.advanceTimersByTime(10);
    });

    expect(screen.getByTestId('modal-overlay')).toHaveStyle('display: flex');
  });

  test('animates out when closed', () => {
    const { rerender } = render(
      <Modal open={true} onClose={() => {}}>
        <h1 data-testid="modal-title">Test Modal</h1>
      </Modal>
    );

    rerender(
      <Modal open={false} onClose={() => {}}>
        <h1 data-testid="modal-title">Test Modal</h1>
      </Modal>
    );

    expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(600);
    });

    expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
  });

  test('applies correct accessibility attributes', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <h1 id="modal-title">Test Modal</h1>
        <p id="modal-description">This is a test modal</p>
      </Modal>
    );

    const modalContent = screen.getByTestId('modal-content');
    expect(modalContent).toHaveAttribute('role', 'dialog');
    expect(modalContent).toHaveAttribute('aria-modal', 'true');
    expect(modalContent).toHaveAttribute('aria-labelledby', 'modal-title');
    expect(modalContent).toHaveAttribute('aria-describedby', 'modal-description');
  });
});