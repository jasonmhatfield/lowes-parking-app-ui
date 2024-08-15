import React, { useState, useEffect } from 'react';
import EditUserModal from './EditUserModal';
import Modal from '../components/Modal';
import Button from '../components/Button';
import './ManageUsersModal.css';

const ManageUsersModal = ({ onClose }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await fetchUsers();
    setUsers(data);
    setFilteredUsers(data);
  };

  const handleSearch = (e) => {
    const search = e.target.value.toLowerCase();
    setSearchTerm(search);
    setFilteredUsers(filterAndSortUsers(search, sortField));
  };

  const handleSort = (field) => {
    const newSortField = sortField === field ? null : field;
    setSortField(newSortField);
    setFilteredUsers(filterAndSortUsers(searchTerm, newSortField));
  };

  const filterAndSortUsers = (search, sort) => {
    return users
      .filter(user =>
        user.firstName.toLowerCase().includes(search) ||
        user.lastName.toLowerCase().includes(search)
      )
      .sort((a, b) => (sort ? a[sort].localeCompare(b[sort]) : 0));
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setShowEditModal(true);
  };

  const handleSaveUser = async (editedUser) => {
    try {
      await updateUser(editedUser);
      await loadUsers();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating user');
    }
  };

  return (
    <Modal open onClose={onClose}>
      <div className="modal-content">
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
            <Button onClick={() => handleSort('firstName')}>Sort by First Name</Button>
            <Button onClick={() => handleSort('lastName')}>Sort by Last Name</Button>
          </div>
          <div className="scrollable-list">
            {filteredUsers.map(user => (
              <div key={user.id} className="display-item" onClick={() => handleEditUser(user)}>
                {user.firstName} {user.lastName}
              </div>
            ))}
          </div>
          {showEditModal && (
            <EditUserModal
              user={currentUser}
              onClose={() => setShowEditModal(false)}
              onSave={handleSaveUser}
            />
          )}
        </div>
        <div className="modal-footer">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ManageUsersModal;
