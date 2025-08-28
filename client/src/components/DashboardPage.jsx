// src/components/DashboardPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { AddProductForm, Earnings, TransactionHistory, ProductCard } from './dashboard';
import { ConfirmationModal, Toast, Button, Icon, Card } from './ui';

import { BACKEND_URL } from '../config';

const DashboardPage = ({ initialUser, onLogout }) => {
    const [user, setUser] = useState(initialUser);
    const [products, setProducts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [activeView, setActiveView] = useState('dashboard');
    const [toast, setToast] = useState(null);
    const [modal, setModal] = useState(null);

    const showToast = (message, type = 'success') => setToast({ message, type });
    const showModal = (title, message, onConfirm) => setModal({ title, message, onConfirm });
    const [isLoading, setIsLoading] = useState(true); // Start as true

    // --- THE FIX IS HERE ---
    // The useCallback hook now depends on user.id, which is a stable value
    // after the user logs in. This prevents the function from being recreated unnecessarily.
    const fetchAllData = useCallback(async () => {
        if (!user || !user.id) return;
        setIsLoading(true); 
        try {
            const [userRes, productsRes, transactionsRes] = await Promise.all([
                fetch(`${BACKEND_URL}/get_user/${user.id}`),
                fetch(`${BACKEND_URL}/get_products/${user.id}`),
                fetch(`${BACKEND_URL}/get_transactions/${user.id}`)
            ]);
            if (!userRes.ok || !productsRes.ok || !transactionsRes.ok) throw new Error('Could not fetch user data.');
            
            const userData = await userRes.json();
            setUser(userData);
            localStorage.setItem('loggedInUser', JSON.stringify(userData));

            setProducts(await productsRes.json());
            setTransactions(await transactionsRes.json());
        } catch (error) {
            showToast(error.message, 'error');
        }
        finally {
        setIsLoading(false); // Set loading to false after fetch succeeds or fails
    }
    }, [user?.id]); // Note the dependency on user.id

    // This effect now runs only when the fetchAllData function is (re)created,
    // which will now only happen when the user.id changes (i.e., never, after login).
    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const handleProductAdded = (newProduct) => {
        setProducts(prevProducts => [newProduct, ...prevProducts]);
    };

    const handleDeleteProduct = (productId) => {
        showModal(
            'Delete Product?',
            'This action cannot be undone. Are you sure you want to delete this product?',
            async () => {
                try {
                    const response = await fetch(`${BACKEND_URL}/delete_product/${productId}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user.id })
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error);
                    showToast(data.message);
                    setProducts(products.filter(p => p.id !== productId));
                } catch (error) {
                    showToast(error.message, 'error');
                }
            }
        );
    };

    const NavButton = ({ view, children }) => (
        <button 
            onClick={() => setActiveView(view)}
            className={`nav-button ${activeView === view ? 'active' : ''} text-gray-300 font-semibold py-2 px-6 rounded-full transition-colors duration-300`}
        >
            {children}
        </button>
    );

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-7xl">
            {toast && <Toast message={toast.message} type={toast.type} onHide={() => setToast(null)} />}
            {modal && <ConfirmationModal {...modal} onConfirm={() => { modal.onConfirm(); setModal(null); }} onCancel={() => setModal(null)} />}

            <header className="flex justify-between items-center mb-12">
                <div className="text-left">
                    <h1 className="text-5xl font-bold text-gray-100 tracking-tight">Influencer <span className="text-gold">Dashboard</span></h1>
                    <p className="text-gray-400 mt-2 text-lg">Welcome back, {user.username}!</p>
                </div>
                <Button onClick={onLogout} variant="secondary" className="flex items-center">
                    <Icon name="logout" className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </header>

            <div className="flex justify-center mb-8 nav-button-container p-2 rounded-full shadow-inner w-full sm:w-auto mx-auto">
                <NavButton view="dashboard">Dashboard</NavButton>
                <NavButton view="showcase">My Showcase</NavButton>
                <NavButton view="tracking">Tracking</NavButton>
            </div>

            <main>
                {activeView === 'dashboard' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <AddProductForm userId={user.id} onProductAdded={handleProductAdded} showToast={showToast} />
                            <Earnings user={user} onUpdate={fetchAllData} showToast={showToast} showModal={showModal} />
                        </div>
                        <TransactionHistory transactions={transactions} onRefresh={fetchAllData} />
                    </div>
                )}
                {activeView === 'showcase' && (
                    <div>
                        <div className="text-center mb-10">
                            <h2 className="text-4xl font-bold text-gray-100">My <span className="text-gold">Curated Products</span></h2>
                            <p className="text-gray-400 mt-2">Products I love and recommend.</p>
                            <p className="text-gray-300 mt-4">Your public showcase link:</p>
                            <a href={`${BACKEND_URL}/showcase/${user.username}`} target="_blank" rel="noopener noreferrer" className="text-gold font-semibold hover:underline">
                                {`${BACKEND_URL}/showcase/${user.username}`}
                            </a>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {products.map(product => (
                                <ProductCard key={product.id} product={product} onDelete={handleDeleteProduct} />
                            ))}
                        </div>
                    </div>
                )}
                {activeView === 'tracking' && (
                    <Card className="text-center">
                        <Icon name="barChart" className="mx-auto h-16 w-16 text-gold" />
                        <h2 className="text-3xl font-bold text-gray-100 mt-4">Tracking Dashboard</h2>
                        <p className="text-gray-400 mt-2 text-lg">This feature is coming soon!</p>
                    </Card>
                )}
            </main>
        </div>
    );
};

export default DashboardPage;