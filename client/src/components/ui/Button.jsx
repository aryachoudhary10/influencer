import React from 'react';

export const Button = ({ children, onClick, disabled = false, variant = 'primary', className = '' }) => {
    const baseClasses = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
    // Added cursor-pointer here, and cursor-not-allowed when disabled
    return (
        <button 
            onClick={onClick} 
            disabled={disabled} 
            className={`${baseClasses} ${className} cursor-pointer disabled:cursor-not-allowed`}
        >
            {children}
        </button>
    );
};
