import React, { useState } from 'react';
import axios from 'axios';
import { login } from '../auth';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');


    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost:5001/login', { email, password });
            login(response.data.token);
            window.location.href = '/admin';

        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao fazer login');
        }
    };

    return (
        <div className="container mt-5">
            <h2>Login</h2>
            <input
                type="email"
                className="form-control mb-2"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                className="form-control mb-2"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleLogin}>Entrar</button>
            {error && <div className="alert alert-danger mt-2">{error}</div>}
        </div>
    );
}
