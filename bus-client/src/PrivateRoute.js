// src/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from './auth';

export default function PrivateRoute({ children }) {
    return isAuthenticated() ? children : <Navigate to="/login" />;
}
