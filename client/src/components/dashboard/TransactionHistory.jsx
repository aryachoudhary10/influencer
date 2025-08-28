// import React from 'react';
// import { Card, Button, Icon } from '../ui';

// const TransactionItem = ({ tx }) => { /* ... same as before ... */ };

// export const TransactionHistory = ({ transactions, onRefresh }) => (
//     <Card>
//         <div className="flex justify-between items-center mb-6">
//             <h2 className="text-2xl font-bold text-gold flex items-center"><Icon name="history" className="mr-3 lucide-gold" />Transaction History</h2>
//             <Button onClick={onRefresh} variant="secondary" className="p-2 rounded-full"><Icon name="refresh" className="h-4 w-4" /></Button>
//         </div>
//         <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
//             {transactions.length === 0 
//                 ? <p className="text-gray-500 text-center">No transactions yet.</p>
//                 : transactions.map(tx => <TransactionItem key={tx.id} tx={tx} />)
//             }
//         </div>
//     </Card>
// );
import React from 'react';
import { format } from 'date-fns'; // Recommended for date formatting: npm install date-fns
import { Card, Button, Icon } from '../ui';

// --- Helper Component for a single transaction ---
// This component contains the detailed view for one item in the history.

const TransactionItem = ({ tx }) => {
    // Determine styles and content based on the transaction type
    const isEarned = tx.type === 'Earned';
    const iconName = isEarned ? 'ArrowUpCircle' : 'ArrowDownCircle';
    const iconClass = isEarned ? 'text-green-500' : 'text-red-500';
    const pointsClass = isEarned ? 'text-green-400' : 'text-red-400';
    const sign = isEarned ? '+' : '-';
    
    // Determine the detail text based on the transaction type
    const detailText = isEarned 
        ? `From: ${tx.product || tx.reason || 'Sale'}` 
        : `To: ${tx.gpayId}`;

    // Helper function to render the correct status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending_approval':
                return (
                    <span className="text-xs font-semibold text-yellow-400 bg-yellow-900/50 px-2 py-1 rounded-full">
                        Pending
                    </span>
                );
            case 'completed':
                return (
                    <span className="text-xs font-semibold text-green-400 bg-green-900/50 px-2 py-1 rounded-full">
                        Completed
                    </span>
                );
            default:
                return null; // Don't render a badge if status is unknown
        }
    };

    return (
        <div className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-800/50 transition-colors duration-200">
            {/* Icon Column */}
            <div className="mt-1">
                <Icon name={iconName} className={iconClass} />
            </div>
            {/* Details Column */}
            <div className="flex-1">
                <div className="flex justify-between items-center">
                    <p className="font-semibold text-gray-200">{tx.type}</p>
                    <p className={`font-bold ${pointsClass}`}>{sign}{tx.points}</p>
                </div>
                <p className="text-gray-400 text-sm">{detailText}</p>
                <div className="flex justify-between items-center mt-1">
                    <p className="text-gray-500 text-xs">
                        {/* Format the date for readability */}
                        {format(new Date(tx.createdAt), 'MMM d, yyyy')}
                    </p>
                    {getStatusBadge(tx.status)}
                </div>
            </div>
        </div>
    );
};


// --- Main Transaction History Component ---
// This is the main component that you will import into your Dashboard.

export const TransactionHistory = ({ transactions, onRefresh, isLoading }) => {
    return (
        <Card>
            {/* Card Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gold flex items-center"><Icon name="history" className="mr-3 lucide-gold" />Transaction History</h2>
                <Button onClick={onRefresh} variant="secondary" className="p-2 rounded-full"><Icon name="refresh" className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}  /></Button>
            </div>

            {/* Transaction List */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {/* Conditional Rendering Logic */}
                {isLoading && transactions.length === 0 ? (
                    // 1. Show loading state on initial load
                    <p className="text-gray-500 text-center py-8">Loading history...</p>
                ) : !isLoading && transactions.length === 0 ? (
                    // 2. Show empty state if not loading and no transactions
                    <p className="text-gray-500 text-center py-8">No transactions yet.</p>
                ) : (
                    // 3. Render the list of transactions
                    transactions.map(tx => <TransactionItem key={tx.id} tx={tx} />)
                )}
            </div>
        </Card>
    );
};
