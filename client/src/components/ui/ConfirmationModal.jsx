import React from 'react';

export const ConfirmationModal = ({ title, message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-sm w-full shadow-xl border border-yellow-500/30">
            <h3 className="text-xl font-bold text-gold">{title}</h3>
            <p className="text-gray-300 mt-2">{message}</p>
            <div className="mt-6 flex justify-end space-x-4">
                <button onClick={onCancel} className="btn-secondary">Cancel</button>
                <button onClick={onConfirm} className="bg-red-600 text-white py-2 px-4 rounded-lg font-semibold">Confirm</button>
            </div>
        </div>
    </div>
);
