// src/components/dashboard/Earnings.jsx

import React, { useState } from 'react';
import { Card, Button, Input, Icon } from '../ui';
import { BACKEND_URL } from '../../config'; // Import from config

export const Earnings = ({ user, onUpdate, showToast, showModal }) => {
    const [gpayId, setGpayId] = useState('');
    const [pointsToAdd, setPointsToAdd] = useState('');

    const handleRedeem = () => {
        if (!gpayId) {
            showToast('Please enter your GPay ID.', 'error');
            return;
        }
        if (user.availablePoints < 500) {
            showToast('You need at least 500 points to redeem.', 'error');
            return;
        }
        showModal(
            `Redeem ${user.availablePoints} Points?`,
            `This will send a payout request for ₹${user.availablePoints} to ${gpayId}.`,
            async () => {
                try {
                    // This fetch call now correctly specifies the POST method
                    const response = await fetch(`${BACKEND_URL}/redeem`, {
                        method: 'POST', // <-- FIX IS HERE
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user.id, gpayId })
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error);
                    showToast(data.message);
                    onUpdate();
                } catch (error) {
                    showToast(error.message, 'error');
                }
            }
        );
    };

    // const handleAddPoints = async () => {
    //     const points = parseInt(pointsToAdd, 10);
    //     if (!points || points <= 0) {
    //         showToast('Please enter a valid number of points.', 'error');
    //         return;
    //     }
    //     try {
    //         // This fetch call also correctly specifies the POST method
    //         const response = await fetch(`${BACKEND_URL}/add_points`, {
    //             method: 'POST', // <-- FIX IS HERE
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({ userId: user.id, points, reason: 'Manual Test Credit' })
    //         });
    //         const data = await response.json();
    //         if (!response.ok) throw new Error(data.error);
    //         showToast(data.message);
    //         onUpdate();
    //         setPointsToAdd('');
    //     } catch (error) {
    //         showToast(error.message, 'error');
    //     }
    // };

    return (
        <Card>
            <h2 className="text-2xl font-bold text-gold mb-2 flex items-center"><Icon name="award" className="mr-3 lucide-gold" />My Earnings</h2>
            <div className="text-center mt-4">
                <p className="text-7xl font-extrabold points-display">{user.availablePoints || 0}</p>
                <p className="text-gray-400 font-medium">Available Points</p>
                <p className="text-gray-500 font-semibold mt-2 text-lg">Pending Payout: {user.pendingPoints || 0}</p>
            </div>
            <div className="mt-8">
                <h3 className="font-semibold text-lg text-gray-200 mb-4">Redeem Points</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Input placeholder="yourname@upi" value={gpayId} onChange={e => setGpayId(e.target.value)} />
                    <Button onClick={handleRedeem} className="flex-shrink-0">Redeem Now</Button>
                </div>
            </div>
            {/* <div className="mt-8 border-t border-gray-700 pt-6">
                <h3 className="font-semibold text-lg text-gray-400 mb-4">For Testing: Add Points</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Input type="number" placeholder="e.g., 500" value={pointsToAdd} onChange={e => setPointsToAdd(e.target.value)} />
                    <Button onClick={handleAddPoints} variant="secondary" className="flex-shrink-0">Add Test Points</Button>
                </div>
            </div> */}
        </Card>
    );
};