import React from 'react';
import '../styles/Tooltip.css';

const Tooltip = ({ children }) => {
  return (
    <div className="tooltip">
      {children}
    </div>
  );
};

export default Tooltip;
