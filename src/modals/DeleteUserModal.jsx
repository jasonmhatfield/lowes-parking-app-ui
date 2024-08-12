import React, { useState } from 'react';
import '../styles/Modal.css';

const DeleteUserModal = ({ user, onClose, refreshUsers }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`http://localhost:8080/api/users/${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await refreshUsers(); // Refresh users after delete
        onClose();
      } else {
        console.error('Failed to delete user.');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">Confirm Deletion</div>
        <div className="modal-body">
          <p>Are you sure you want to delete {user.firstName} {user.lastName}?</p>
        </div>
        <div className="modal-footer">
          <button className="close-button" onClick={onClose} disabled={deleting}>
            Cancel
          </button>
          <button className="submit-button" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;
