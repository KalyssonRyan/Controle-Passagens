import { Navigate } from 'react-router-dom';
import { isAuthenticated, isAdmin } from '../auth';

export default function AdminRoute({ children }) {
    if (!isAuthenticated()) return <Navigate to="/login" />;
    if (!isAdmin()) return <Navigate to="/" />;
    return children;
}
