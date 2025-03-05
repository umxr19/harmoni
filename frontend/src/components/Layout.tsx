import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { User } from '../types';

export const Layout: React.FC = () => {
    const navigate = useNavigate();
    const userString = localStorage.getItem('user');
    const user: User | null = userString ? JSON.parse(userString) : null;

    const handleLogout = () => {
        // @ts-ignore
        authService.logout();
        navigate('/login');
    };

    return (
        <div>
            <nav className="main-nav">
                <Link to="/">Home</Link>
                <Link to="/questions">Questions</Link>
                <Link to="/practice/sets">Practice</Link>
                {user ? (
                    <>
                        <Link to="/profile">Profile</Link>
                        <Link to="/questions/create">Create Question</Link>
                        <button onClick={handleLogout} className="logout-button">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </nav>
            <main>
                <Outlet />
            </main>
        </div>
    );
}; 