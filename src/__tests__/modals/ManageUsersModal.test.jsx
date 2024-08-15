import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';
import ManageUsersModal from '../../modals/ManageUsersModal';

fetchMock.enableMocks();

const mockUsers = [
  { id: 1, firstName: 'John', lastName: 'Doe', role: 'employee' },
  { id: 2, firstName: 'Jane', lastName: 'Smith', role: 'employee' },
  { id: 3, firstName: 'Admin', lastName: 'User', role: 'admin' },
];

const setup = (props = {}) => {
  return render(<ManageUsersModal {...props} />);
};

describe('ManageUsersModal', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify(mockUsers));
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Mock console.error to avoid cluttering the test output
  });

  afterEach(() => {
    console.error.mockRestore(); // Restore original console.error after each test
  });

  test('filters users based on search input', async () => {
    setup();
    await screen.findByText(/John\s*Doe/);

    fireEvent.change(screen.getByPlaceholderText('Search users...'), { target: { value: 'Jane' } });

    expect(screen.queryByText(/John\s*Doe/)).not.toBeInTheDocument();
    expect(screen.getByText(/Jane\s*Smith/)).toBeInTheDocument();
  });

  test('sorts users by first name', async () => {
    setup();
    await screen.findByText(/John\s*Doe/);

    fireEvent.click(screen.getByText('Sort by First Name'));

    const userItems = screen.getAllByText(/(Doe|Smith)/);
    expect(userItems[0]).toHaveTextContent(/Jane\s*Smith/);
    expect(userItems[1]).toHaveTextContent(/John\s*Doe/);
  });

  test('sorts users by last name', async () => {
    setup();
    await screen.findByText(/John\s*Doe/);

    fireEvent.click(screen.getByText('Sort by Last Name'));

    const userItems = screen.getAllByText(/(Doe|Smith)/);
    expect(userItems[0]).toHaveTextContent(/John\s*Doe/);
    expect(userItems[1]).toHaveTextContent(/Jane\s*Smith/);
  });

  test('opens EditUserModal when a user is clicked and saves edited user', async () => {
    setup();
    await screen.findByText(/John\s*Doe/);

    fireEvent.click(screen.getByText(/John\s*Doe/));
    expect(screen.getByText('Edit User')).toBeInTheDocument();

    const firstNameInput = screen.getByTestId('first-name-input');
    fireEvent.change(firstNameInput, { target: { value: 'Johnny' } });

    fetchMock.mockResponseOnce(JSON.stringify({ ...mockUsers[0], firstName: 'Johnny' }));

    fireEvent.click(screen.getByTestId('save-button'));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/api/users/1', expect.anything()));
    await waitFor(() => expect(screen.queryByText('Edit User')).not.toBeInTheDocument());
  });

  test('closes modal on close button click', async () => {
    const onCloseMock = jest.fn();
    setup({ onClose: onCloseMock });
    await screen.findByText(/John\s*Doe/);

    fireEvent.click(screen.getByText('Close'));

    expect(onCloseMock).toHaveBeenCalled();
  });

  test('handles save user error correctly', async () => {
    setup();
    await screen.findByText(/John\s*Doe/);

    fireEvent.click(screen.getByText(/John\s*Doe/));
    expect(screen.getByText('Edit User')).toBeInTheDocument();

    fetchMock.mockRejectOnce(new Error('Failed to save user'));

    fireEvent.click(screen.getByTestId('save-button'));

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error saving user:', expect.any(Error));
    });
  });

  // New test to ensure coverage of `console.error('Error saving user');`
  test('logs an error when response is not ok', async () => {
    setup();
    await screen.findByText(/John\s*Doe/);

    fireEvent.click(screen.getByText(/John\s*Doe/));
    expect(screen.getByText('Edit User')).toBeInTheDocument();

    // Simulate a response with status 400
    fetchMock.mockResponseOnce(JSON.stringify({}), { status: 400 });

    fireEvent.click(screen.getByTestId('save-button'));

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error saving user:', expect.anything());
    });
  });
});
