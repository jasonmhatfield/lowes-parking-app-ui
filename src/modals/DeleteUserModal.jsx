import React, { useState } from 'react';
import Modal from '../components/Modal';
import Button from '../components/Button';

const DeleteUserModal = ({ user, onClose, refreshUsers }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`http://localhost:8080/api/users/${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await refreshUsers();
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
    <Modal open={true} onClose={onClose}>
      <div className="modal-header">Confirm Deletion</div>
      <div className="modal-body">
        <p>Are you sure you want to delete {user.firstName} {user.lastName}?</p>
      </div>
      <div className="modal-footer">
        <Button className="close-button" onClick={onClose} disabled={deleting}>
          Cancel
        </Button>
        <Button className="submit-button" onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteUserModal;
