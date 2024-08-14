// src/modals/ManageUsersModal.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';
import ManageUsersModal from '../ManageUsersModal';

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
  });

  it('filters users based on search input', async () => {
    setup();
    await waitFor(() => expect(screen.getByText(/John\s*Doe/)).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText('Search users...'), { target: { value: 'Jane' } });

    expect(screen.queryByText(/John\s*Doe/)).not.toBeInTheDocument();
    expect(screen.getByText(/Jane\s*Smith/)).toBeInTheDocument();
  });

  it('sorts users by first name', async () => {
    setup();
    await waitFor(() => expect(screen.getByText(/John\s*Doe/)).toBeInTheDocument());

    fireEvent.click(screen.getByText('Sort by First Name'));

    const userItems = screen.getAllByText(/(Doe|Smith)/);
    expect(userItems[0]).toHaveTextContent(/Jane\s*Smith/);
    expect(userItems[1]).toHaveTextContent(/John\s*Doe/);
  });

  it('sorts users by last name', async () => {
    setup();
    await waitFor(() => expect(screen.getByText(/John\s*Doe/)).toBeInTheDocument());

    fireEvent.click(screen.getByText('Sort by Last Name'));

    const userItems = screen.getAllByText(/(Doe|Smith)/);
    expect(userItems[0]).toHaveTextContent(/John\s*Doe/);
    expect(userItems[1]).toHaveTextContent(/Jane\s*Smith/);
  });

  it('opens EditUserModal when a user is clicked and saves edited user', async () => {
    setup();
    await waitFor(() => expect(screen.getByText(/John\s*Doe/)).toBeInTheDocument());

    fireEvent.click(screen.getByText(/John\s*Doe/));
    expect(screen.getByText('Edit User')).toBeInTheDocument();

    const firstNameInput = screen.getByTestId('first-name-input');
    fireEvent.change(firstNameInput, { target: { value: 'Johnny' } });

    fetchMock.mockResponseOnce(JSON.stringify({ ...mockUsers[0], firstName: 'Johnny' }));

    fireEvent.click(screen.getByTestId('save-button'));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/api/users/1', expect.anything()));
    await waitFor(() => expect(screen.queryByText('Edit User')).not.toBeInTheDocument());
  });

  it('closes modal on close button click', async () => {
    const onCloseMock = jest.fn();
    setup({ onClose: onCloseMock });
    await waitFor(() => expect(screen.getByText(/John\s*Doe/)).toBeInTheDocument());

    fireEvent.click(screen.getByText('Close'));

    expect(onCloseMock).toHaveBeenCalled();
  });
});
