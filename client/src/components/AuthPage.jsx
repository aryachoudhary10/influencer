import React, { useState } from 'react';
import { Card, Button, Input, Toast } from './ui';

// --- Configuration ---
import { BACKEND_URL } from '../config';

// This component handles everything related to user authentication.
const AuthPage = ({ onLoginSuccess }) => {
    // State to toggle between Login and Sign Up forms
    const [isLoginView, setIsLoginView] = useState(true);
    
    // Controlled component state for form inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    
    // State for showing toast notifications
    const [toast, setToast] = useState(null);

    // Helper function to display a toast message
    const showToast = (message, type = 'success') => setToast({ message, type });

    // --- Event Handlers ---

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${BACKEND_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, username })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            showToast(data.message);
            setIsLoginView(true); // Switch to login view on success
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${BACKEND_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            onLoginSuccess(data.user);
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {toast && <Toast message={toast.message} type={toast.type} onHide={() => setToast(null)} />}
            <div className="max-w-md w-full">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-100 tracking-tight">Welcome to the <span className="text-gold">Platform</span></h1>
                    <p className="text-gray-400 mt-2">Login or create an account to manage your showcase.</p>
                </header>
                <Card>
                    <div className="flex border-b border-gray-700 mb-6">
                        <button onClick={() => setIsLoginView(true)} className={`flex-1 font-semibold pb-3 border-b-2 ${isLoginView ? 'border-gold text-gold' : 'border-transparent text-gray-400'}`}>Login</button>
                        <button onClick={() => setIsLoginView(false)} className={`flex-1 font-semibold pb-3 border-b-2 ${!isLoginView ? 'border-gold text-gold' : 'border-transparent text-gray-400'}`}>Sign Up</button>
                    </div>
                    
                    {isLoginView ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <Input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
                            <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                            <Button type="submit" className="w-full">Login</Button>
                        </form>
                    ) : (
                        <form onSubmit={handleSignup} className="space-y-4">
                            <Input type="text" placeholder="Choose a Username" value={username} onChange={e => setUsername(e.target.value)} required />
                            <Input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
                            <Input type="password" placeholder="Create Password" value={password} onChange={e => setPassword(e.target.value)} required />
                            <Button type="submit" className="w-full">Create Account</Button>
                        </form>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default AuthPage;
