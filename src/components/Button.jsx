import React from 'react';
import '../styles/styles.css';

const Button = ({ children, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled}>
    {children}
  </button>
);

export default Button;
