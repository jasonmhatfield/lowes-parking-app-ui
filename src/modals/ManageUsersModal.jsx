import React, { useState, useEffect } from 'react';
import EditUserModal from './EditUserModal';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { fetchUsers, updateUser } from '../services/userService';

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
      console.error('Error saving user:', error);
    }
  };

  return (
    <Modal open onClose={onClose}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>Manage Users</div>
        <div style={styles.modalBody}>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
            style={styles.searchInput}
          />
          <div style={styles.sortButtons}>
            <Button onClick={() => handleSort('firstName')}>Sort by First Name</Button>
            <Button onClick={() => handleSort('lastName')}>Sort by Last Name</Button>
          </div>
          <div style={styles.scrollableList}>
            {filteredUsers.map(user => (
              <div key={user.id} style={styles.displayItem} onClick={() => handleEditUser(user)}>
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
        <div style={styles.modalFooter}>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
};

const styles = {
  modalContent: {
    backgroundColor: '#1e1e2f',
    padding: '20px',
    borderRadius: '12px',
    width: '400px',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.5)',
  },
  modalHeader: {
    fontSize: '1.8rem',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: '20px',
  },
  modalBody: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  searchInput: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #555573',
    backgroundColor: '#3c3c5e',
    color: '#ffffff',
    fontSize: '16px',
    marginBottom: '15px',
  },
  sortButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: '15px',
  },
  scrollableList: {
    height: '300px',
    width: '100%',
    overflowY: 'auto',
    marginBottom: '15px',
  },
  displayItem: {
    backgroundColor: '#33334d',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '10px',
    cursor: 'pointer',
    textAlign: 'center',
    color: '#ffffff',
    transition: 'background-color 0.3s ease',
  },
  displayItemHover: {
    backgroundColor: '#4a4a6a',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'center',
  },
};

export default ManageUsersModal;
