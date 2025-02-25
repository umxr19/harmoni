import React from 'react';
import { Link } from 'react-router-dom';

export const Unauthorized: React.FC = () => {
    return (
        <div>
            <h1>Unauthorized Access</h1>
            <p>You don't have permission to access this page.</p>
            <Link to="/">Return to Home</Link>
        </div>
    );
}; 