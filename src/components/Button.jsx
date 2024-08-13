import React from 'react';
import '../styles/Button.css';

const Button = ({ children, onClick, disabled, className = 'primary' }) => (
  <button onClick={onClick} disabled={disabled} className={`button ${className}`}>
    {children}
  </button>
);

export default Button;
