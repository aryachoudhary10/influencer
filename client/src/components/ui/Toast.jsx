import React, { useEffect } from 'react';

export const Toast = ({ message, type, onHide }) => {
    useEffect(() => {
        const timer = setTimeout(onHide, 3000);
        return () => clearTimeout(timer);
    }, [onHide]);

    const styles = {
        success: { backgroundColor: '#FBBF24', color: '#121212' },
        error: { backgroundColor: '#DC2626', color: '#FFFFFF' },
        info: { backgroundColor: '#3B82F6', color: '#FFFFFF' },
    };

    return <div className="toast show" style={styles[type]}>{message}</div>;
};