// import React, { useState, useEffect } from 'react';
// import AuthPage from './components/AuthPage';
// import DashboardPage from './components/DashboardPage';
// import { ShowcasePage } from './pages/ShowcasePage';    
// import './index.css'; // Make sure to import your main stylesheet

// // This is your main App component. Its only job is to determine
// // if a user is logged in and render the correct page.
// function App() {
//     const [user, setUser] = useState(null);

//     // This effect runs once on component mount to check for a 
//     // logged-in user in localStorage. This persists the session.
//     useEffect(() => {
//         try {
//             const savedUser = localStorage.getItem('loggedInUser');
//             if (savedUser) {
//                 setUser(JSON.parse(savedUser));
//             }
//         } catch (error) {
//             console.error("Failed to parse user from localStorage", error);
//             localStorage.removeItem('loggedInUser');
//         }
//     }, []);

//     // This function is passed down to the AuthPage. When login is
//     // successful, AuthPage calls this function to update the state here.
//     const handleLoginSuccess = (userData) => {
//         localStorage.setItem('loggedInUser', JSON.stringify(userData));
//         setUser(userData);
//     };

//     // Passed down to the DashboardPage to handle logging out.
//     const handleLogout = () => {
//         localStorage.removeItem('loggedInUser');
//         setUser(null);
//     };

//     return (
//         <div className="antialiased">
//             {/* This is conditional rendering. If a 'user' object exists in our state,
//                 we show the DashboardPage. Otherwise, we show the AuthPage. */}
//             {user ? (
//                 <DashboardPage initialUser={user} onLogout={handleLogout} />
//             ) : (
//                 <AuthPage onLoginSuccess={handleLoginSuccess} />
//             )}
//         </div>
//     );
// }

// export default App;



import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AuthPage from './components/AuthPage';
import DashboardPage from './components/DashboardPage';
import { ShowcasePage } from './pages/ShowcasePage';
import './index.css';

// Protects dashboard routes
const PrivateRoute = ({ user, children }) => {
  if (!user) return <Navigate to="/" replace />;
  return children;
};

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('loggedInUser');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('loggedInUser');
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('loggedInUser', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    setUser(null);
  };

  return (
    <div className="antialiased">
      <Routes>
        {/* Public showcase page, available without login */}
        <Route path="/showcase/:username" element={<ShowcasePage />} />

        {/* Protected dashboard page */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute user={user}>
              <DashboardPage initialUser={user} onLogout={handleLogout} />
            </PrivateRoute>
          } 
        />

        {/* Root: show AuthPage or redirect logged-in user */}
        <Route 
          path="/" 
          element={
            user 
              ? <Navigate to="/dashboard" replace /> 
              : <AuthPage onLoginSuccess={handleLoginSuccess} />
          } 
        />
      </Routes>
    </div>
  );
}

export default App;
