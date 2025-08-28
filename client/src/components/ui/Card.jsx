import React from 'react';

export const Card = ({ children, className = '' }) => (
    <div className={`card p-8 ${className}`}>
        {children}
    </div>
);
