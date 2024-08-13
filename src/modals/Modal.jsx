import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';

const Modal = ({ open, onClose, children }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setIsMounted(true);
      requestAnimationFrame(() => setIsVisible(true)); // Ensure fade-in starts in the next frame
    } else {
      setIsVisible(false);
      setTimeout(() => setIsMounted(false), 300); // Delay unmounting until fade-out completes
    }
  }, [open]);

  if (!isMounted) return null;

  return (
    <ModalOverlay isVisible={isVisible} onClick={onClose}>
      <ModalContent isVisible={isVisible} onClick={(e) => e.stopPropagation()}>
        {children}
      </ModalContent>
    </ModalOverlay>
  );
};

const fadeIn = keyframes`
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

const fadeOut = keyframes`
    from {
        opacity: 1;
        transform: translateY(0);
    }
    to {
        opacity: 0;
        transform: translateY(-10px);
    }
`;

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    ${({ isVisible }) =>
            isVisible
                    ? css`
          animation: ${fadeIn} 300ms ease-in-out forwards;
        `
                    : css`
          animation: ${fadeOut} 300ms ease-in-out forwards;
        `}
`;

const ModalContent = styled.div`
    background-color: #1e1e2f;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
    ${({ isVisible }) =>
            isVisible
                    ? css`
          animation: ${fadeIn} 300ms ease-in-out forwards;
        `
                    : css`
          animation: ${fadeOut} 300ms ease-in-out forwards;
        `}
    opacity: 0; /* Ensure it starts hidden */
`;

export default Modal;
