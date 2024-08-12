import React from 'react';
import '../styles/Tooltip.css';

const Tooltip = ({ children, style }) => {
  return (
    <div className="tooltip" style={style}>
      {children}
    </div>
  );
};

export default Tooltip;
