import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { User } from '../types';

export const Layout: React.FC = () => {
    const navigate = useNavigate();
    const userString = localStorage.getItem('user');
    const user: User | null = userString ? JSON.parse(userString) : null;

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <div>
            <nav>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/questions">Questions</Link></li>
                    
                    {/* Teacher/Admin only */}
                    {user?.role === 'teacher' || user?.role === 'admin' ? (
                        <li><Link to="/questions/create">Create Question</Link></li>
                    ) : null}
                    
                    {/* Admin only */}
                    {user?.role === 'admin' && (
                        <li><Link to="/admin">Admin Dashboard</Link></li>
                    )}
                    
                    {user ? (
                        <>
                            <li><Link to="/profile">Profile</Link></li>
                            <li><button onClick={handleLogout}>Logout</button></li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/login">Login</Link></li>
                            <li><Link to="/register">Register</Link></li>
                        </>
                    )}
                </ul>
            </nav>
            <main>
                <Outlet />
            </main>
        </div>
    );
}; 