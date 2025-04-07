// src/pages/RegisterPage.js
import React, { useState } from 'react';
import axios from 'axios';

export default function RegisterPage() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        cpf: '',
        documentNumber: '',
        isElderly: false
    });

    const [mensagem, setMensagem] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async () => {
        try {
            const res = await axios.post('https://controle-passagens.onrender.com/register-client', form);
            setMensagem(res.data.message);
        } catch (err) {
            setMensagem(err.response?.data?.message || 'Erro ao registrar');
        }
    };

    return (
        <div className="container mt-4">
            <h2>Cadastro de Cliente</h2>
            <input name="name" placeholder="Nome Completo" className="form-control mb-2" onChange={handleChange} />
            <input name="email" type="email" placeholder="Email" className="form-control mb-2" onChange={handleChange} />
            <input name="password" type="password" placeholder="Senha" className="form-control mb-2" onChange={handleChange} />
            <input name="cpf" placeholder="CPF" className="form-control mb-2" onChange={handleChange} />
            <input name="documentNumber" placeholder="Nº do Documento" className="form-control mb-2" onChange={handleChange} />
            <div className="form-check mb-3">
                <input className="form-check-input" type="checkbox" name="isElderly" onChange={handleChange} />
                <label className="form-check-label">Sou idoso</label>
            </div>
            <button className="btn btn-success" onClick={handleSubmit}>Cadastrar</button>
            {mensagem && <div className="alert alert-info mt-3">{mensagem}</div>}
        </div>
    );
}
