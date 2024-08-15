import React from 'react';
import PropTypes from 'prop-types';

const Button = ({ children, onClick, disabled, variant, dataTestId, style }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      ...styles.btn,
      ...(variant === 'primary' && styles.primary),
      ...(variant === 'secondary' && styles.secondary),
      ...(variant === 'success' && styles.success),
      ...(variant === 'danger' && styles.danger),
      ...(disabled && styles.disabled),
      ...style, // Apply additional styles passed from parent component
    }}
    data-testid={dataTestId}
  >
    {children}
  </button>
);

const styles = {
  btn: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.3s ease',
    fontSize: '1rem',
    color: 'white',
  },
  primary: {
    backgroundColor: '#0072ce',
  },
  primaryHover: {
    backgroundColor: '#00509e',
    transform: 'translateY(-2px)',
  },
  primaryActive: {
    backgroundColor: '#003d7a',
    transform: 'translateY(0)',
  },
  secondary: {
    backgroundColor: '#6c757d',
  },
  secondaryHover: {
    backgroundColor: '#5a6268',
    transform: 'translateY(-2px)',
  },
  secondaryActive: {
    backgroundColor: '#494e52',
    transform: 'translateY(0)',
  },
  success: {
    backgroundColor: '#28a745',
  },
  successHover: {
    backgroundColor: '#218838',
    transform: 'translateY(-2px)',
  },
  successActive: {
    backgroundColor: '#1e7e34',
    transform: 'translateY(0)',
  },
  danger: {
    backgroundColor: '#dc3545',
  },
  dangerHover: {
    backgroundColor: '#c82333',
    transform: 'translateY(-2px)',
  },
  dangerActive: {
    backgroundColor: '#bd2130',
    transform: 'translateY(0)',
  },
  disabled: {
    backgroundColor: '#cccccc',
    cursor: 'not-allowed',
    transform: 'none',
  },
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger']),
  dataTestId: PropTypes.string,
};

Button.defaultProps = {
  onClick: () => {},
  disabled: false,
  variant: 'primary',
  dataTestId: '',
};

export default Button;
