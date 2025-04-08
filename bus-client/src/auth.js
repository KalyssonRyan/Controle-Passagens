// src/auth.js
export const login = (token) => {
    localStorage.setItem('token', token);
    const payload = JSON.parse(atob(token.split('.')[1]));
    localStorage.setItem('isAdmin', payload.isAdmin);
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
};

export const getToken = () => {
    return localStorage.getItem('token');
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};
export const isAdmin = () => localStorage.getItem('isAdmin') === 'true';
