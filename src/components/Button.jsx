import React from 'react';
import PropTypes from 'prop-types';
import '../styles/components/Button.css';  // Import the separated CSS file

const Button = ({ children, onClick, disabled, variant, dataTestId }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`btn ${variant}`}
    data-testid={dataTestId}
  >
    {children}
  </button>
);

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger']),
  dataTestId: PropTypes.string
};

Button.defaultProps = {
  onClick: () => {},
  disabled: false,
  variant: 'primary',
  dataTestId: ''
};

export default Button;
