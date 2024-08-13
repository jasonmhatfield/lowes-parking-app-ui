import React from 'react';
import './Modal.css'; // Ensure this is included in every modal

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">{title}</div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button className="close-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
