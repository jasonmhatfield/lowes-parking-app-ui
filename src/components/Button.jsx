import React from 'react';
import styled from 'styled-components';

const Button = ({ children, onClick, disabled, className = 'primary', testId }) => (
  <StyledButton
    onClick={onClick}
    disabled={disabled}
    className={className}
    data-testid={testId}
  >
    {children}
  </StyledButton>
);

const StyledButton = styled.button`
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease;
    font-size: 1rem;
    color: white;

    &.primary {
        background-color: #0072ce;

        &:hover {
            background-color: #00509e;
            transform: translateY(-2px);
        }

        &:active {
            background-color: #003d7a;
            transform: translateY(0);
        }
    }

    &.secondary {
        background-color: #6c757d;

        &:hover {
            background-color: #5a6268;
            transform: translateY(-2px);
        }

        &:active {
            background-color: #494e52;
            transform: translateY(0);
        }
    }

    &.success {
        background-color: #28a745;

        &:hover {
            background-color: #218838;
            transform: translateY(-2px);
        }

        &:active {
            background-color: #1e7e34;
            transform: translateY(0);
        }
    }

    &.danger {
        background-color: #dc3545;

        &:hover {
            background-color: #c82333;
            transform: translateY(-2px);
        }

        &:active {
            background-color: #bd2130;
            transform: translateY(0);
        }
    }

    &:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
        transform: none;
    }
`;

export default Button;
