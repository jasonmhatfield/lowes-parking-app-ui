import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../Modal'; // Adjust the path as necessary

describe('Modal Component', () => {
  it('renders the modal content when open', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <h1 data-testid="modal-title">Test Modal</h1>
      </Modal>
    );

    expect(screen.getByTestId('modal-title')).toBeInTheDocument();
  });

  it('does not render the modal content when closed', () => {
    render(
      <Modal open={false} onClose={() => {}}>
        <h1 data-testid="modal-title">Test Modal</h1>
      </Modal>
    );

    expect(screen.queryByTestId('modal-title')).not.toBeInTheDocument();
  });

  it('calls onClose when clicking on the overlay', () => {
    const handleClose = jest.fn();

    render(
      <Modal open={true} onClose={handleClose}>
        <h1 data-testid="modal-title">Test Modal</h1>
      </Modal>
    );

    fireEvent.click(screen.getByTestId('modal-overlay'));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not close the modal when clicking inside the content', () => {
    const handleClose = jest.fn();

    render(
      <Modal open={true} onClose={handleClose}>
        <h1 data-testid="modal-title">Test Modal</h1>
      </Modal>
    );

    fireEvent.click(screen.getByTestId('modal-title'));

    expect(handleClose).not.toHaveBeenCalled();
  });
});
