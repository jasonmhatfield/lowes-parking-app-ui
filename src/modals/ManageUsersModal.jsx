import React, { useEffect, useState } from 'react';
import EditUserModal from './EditUserModal';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { fetchUsers, updateUser } from '../services/userService';

const ManageUsersModal = ({ onClose }) => {
  const [users, setUsers] = useState([]); // State to hold the list of users
  const [filteredUsers, setFilteredUsers] = useState([]); // State to hold the filtered list of users
  const [searchTerm, setSearchTerm] = useState(''); // State to hold the search term
  const [sortField, setSortField] = useState(null); // State to hold the current sort field
  const [showEditModal, setShowEditModal] = useState(false); // State to control EditUserModal visibility
  const [currentUser, setCurrentUser] = useState(null); // State to hold the currently selected user

  useEffect(() => {
    loadUsers(); // Load users when component mounts
  }, []);

  const loadUsers = async () => {
    const data = await fetchUsers(); // Fetch users from the server
    setUsers(data); // Set the fetched users
    setFilteredUsers(data); // Set the filtered users to the fetched users
  };

  const handleSearch = (e) => {
    const search = e.target.value.toLowerCase();
    setSearchTerm(search); // Update the search term
    setFilteredUsers(filterAndSortUsers(search, sortField)); // Filter and sort users based on the search term
  };

  const handleSort = (field) => {
    const newSortField = sortField === field ? null : field;
    setSortField(newSortField); // Update the sort field
    setFilteredUsers(filterAndSortUsers(searchTerm, newSortField)); // Filter and sort users based on the new sort field
  };

  const filterAndSortUsers = (search, sort) => {
    return users
      .filter(user =>
        user.firstName.toLowerCase().includes(search) ||
        user.lastName.toLowerCase().includes(search)
      ) // Filter users based on the search term
      .sort((a, b) => (sort ? a[sort].localeCompare(b[sort]) : 0)); // Sort users based on the sort field
  };

  const handleEditUser = (user) => {
    setCurrentUser(user); // Set the selected user as the current user
    setShowEditModal(true); // Show the EditUserModal
  };

  const handleSaveUser = async (editedUser) => {
    try {
      await updateUser(editedUser); // Save the edited user to the server
      await loadUsers(); // Reload users after saving
      setShowEditModal(false); // Close the EditUserModal
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
                {user.firstName} {user.lastName} {/* Display user names */}
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
          <Button onClick={onClose}>Close</Button> {/* Button to close the modal */}
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
