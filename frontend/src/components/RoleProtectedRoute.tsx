import { Navigate, useLocation } from 'react-router-dom';
import { User } from '../types';

interface RoleProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    const location = useLocation();
    
    if (!token || !userString) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const user: User = JSON.parse(userString);
    
    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
}; 