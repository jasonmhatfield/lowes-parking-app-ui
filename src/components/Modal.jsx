import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';

const Modal = ({ open, children, overlayStyle }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (open) {
      setIsMounted(true);
      setTimeout(() => setShouldAnimate(true), 10);
    } else {
      setShouldAnimate(false);
      setTimeout(() => setIsMounted(false), 600);
    }
  }, [open]);

  if (!isMounted) return null;

  return (
    <ModalOverlay
      data-testid="modal-overlay"
      shouldAnimate={shouldAnimate}
      style={overlayStyle}
    >
      <ModalContent
        data-testid="modal-content"
        shouldAnimate={shouldAnimate}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
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
    background: rgba(0, 0, 0, 0.3);  /* Default background */
    display: ${({ shouldAnimate }) => (shouldAnimate ? 'flex' : 'none')};
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: ${({ shouldAnimate }) =>
            shouldAnimate
                    ? css`
                        ${fadeIn} 300ms ease-in-out forwards
                    `
                    : css`
                        ${fadeOut} 600ms ease-in-out forwards
                    `};
`;

const ModalContent = styled.div`
    background-color: #1e1e2f;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
    animation: ${({ shouldAnimate }) =>
            shouldAnimate
                    ? css`
                        ${fadeIn} 300ms ease-in-out forwards
                    `
                    : css`
                        ${fadeOut} 600ms ease-in-out forwards
                    `};
`;

export default Modal;