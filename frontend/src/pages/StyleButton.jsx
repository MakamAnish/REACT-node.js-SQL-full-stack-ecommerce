import React, { useState } from "react";

const StyleButton = ({ label, onClick }) => {
    const [hovered , setHovered] = useState(false);
    
    const buttonStyle = {
        padding: '10px 20px',
        backgroundColor: hovered ? '#4CAF50' : '#2E8B57', 
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'background-color 0.3s ease, transform 0.2s ease',
        transform: hovered ? 'scale(1.05)' : 'scale(1)',
        boxShadow: hovered
          ? '0 4px 12px rgba(0, 0, 0, 0.2)'
          : '0 2px 6px rgba(0, 0, 0, 0.1)',
    };


    return(
        <button
            style={buttonStyle}
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {label}
        </button>
    );

};

export default StyleButton;