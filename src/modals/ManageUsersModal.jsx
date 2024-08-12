import React, { useState, useEffect } from 'react';
import EditUserModal from './EditUserModal';
import Modal from '../components/Modal';
import Button from '../components/Button';

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
      <div className="modal-header">Manage Users</div>
      <div className="modal-body">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        <div className="sort-buttons">
          <Button onClick={() => handleSort('firstName')} className="sort-button">Sort by First Name</Button>
          <Button onClick={() => handleSort('lastName')} className="sort-button">Sort by Last Name</Button>
        </div>
        <div className="scrollable-list">
          {filteredUsers.map(user => (
            <div
              key={user.id}
              className="display-item"
              onClick={() => handleEditUser(user)}
            >
              <span>{user.firstName} {user.lastName}</span>
            </div>
          ))}
        </div>

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
      </div>
      <div className="modal-footer">
        <Button className="close-button" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
};

export default ManageUsersModal;
