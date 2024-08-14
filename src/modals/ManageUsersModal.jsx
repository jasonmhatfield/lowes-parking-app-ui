import React, { useState, useEffect } from 'react';
import EditUserModal from './EditUserModal';
import Modal from '../components/Modal';
import Button from '../components/Button';
import styled from 'styled-components';

const ManageUsersModal = ({ onClose }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users');
      const data = await response.json();
      setUsers(data.filter(user => user.role !== 'admin'));
      setFilteredUsers(data.filter(user => user.role !== 'admin'));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    filterUsers(e.target.value, sortField);
  };

  const handleSort = (field) => {
    const newSortField = sortField === field ? null : field;
    setSortField(newSortField);
    filterUsers(searchTerm, newSortField);
  };

  const filterUsers = (search, sort) => {
    let filtered = users.filter(user =>
      user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      user.lastName.toLowerCase().includes(search.toLowerCase())
    );

    if (sort) {
      filtered.sort((a, b) => a[sort].localeCompare(b[sort]));
    }

    setFilteredUsers(filtered);
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setShowEditModal(true);
  };

  return (
    <Modal open={true} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Manage Users</ModalHeader>
        <ModalBody>
          <SearchInput
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <SortButtons>
            <Button onClick={() => handleSort('firstName')}>Sort by First Name</Button>
            <Button onClick={() => handleSort('lastName')}>Sort by Last Name</Button>
          </SortButtons>
          <ScrollableList>
            {filteredUsers.map(user => (
              <DisplayItem key={user.id} onClick={() => handleEditUser(user)}>
                <span>{user.firstName} {user.lastName}</span>
              </DisplayItem>
            ))}
          </ScrollableList>

          {showEditModal && (
            <EditUserModal
              user={currentUser}
              onClose={() => setShowEditModal(false)}
              onSave={async (editedUser) => {
                try {
                  const response = await fetch(`http://localhost:8080/api/users/${editedUser.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editedUser),
                  });

                  if (response.ok) {
                    await fetchUsers();
                    setShowEditModal(false);
                  } else {
                    console.error('Error saving user');
                  }
                } catch (error) {
                  console.error('Error saving user:', error);
                }
              }}
            />
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const ModalContent = styled.div`
  background-color: #1e1e2f;
  padding: 20px;
  border-radius: 12px;
  width: 400px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
`;

const ModalHeader = styled.div`
  font-size: 1.8rem;
  color: #ffffff;
  text-align: center;
  margin-bottom: 20px;
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #555573;
  background-color: #3c3c5e;
  color: #ffffff;
  font-size: 16px;
  margin-bottom: 15px;
`;

const SortButtons = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 15px;
`;

const ScrollableList = styled.div`
  height: 300px;
  width: 100%;
  overflow-y: auto;
  margin-bottom: 15px;
`;

const DisplayItem = styled.div`
  background-color: #33334d;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  text-align: center;
  color: #ffffff;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #4a4a6a;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: center;
`;

export default ManageUsersModal;
