import React from 'react';

const DeleteUserModal = ({ user, onClose, onDelete }) => (
  <div className="modal">
    <div className="modal-content">
      <h2>Are you sure you want to delete {user.firstName} {user.lastName}?</h2>
      <button onClick={() => { onDelete(user.id); onClose(); }}>Delete</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  </div>
);

export default DeleteUserModal;
