// src/pages/RegisterPage.js
import React, { useState } from 'react';
import axios from 'axios';

export default function RegisterPage() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        cpf: '',
        documentNumber: '',
        isElderly: false,
        isFreePass: false,
    });

    const [mensagem, setMensagem] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async () => {
        if (form.password !== form.confirmPassword) {
            setMensagem('As senhas não coincidem!');
            return;
        }
        try {
            const res = await axios.post('https://controle-passagens.onrender.com/register-client', form);
            setMensagem(res.data.message);
        } catch (err) {
            setMensagem(err.response?.data?.message || 'Erro ao registrar');
        }
    };

    return (
        <div className="container mt-4">
            <h2>Faça o seu cadastro</h2>
            <label name="name" className="label">Nome Completo</label>
            <input name="name" placeholder="Digite o seu Nome Completo" className="form-control mb-2" onChange={handleChange} />
            <label name="email" className="label">Email</label>
            <input name="email" type="email" placeholder="Digite o seu Email" className="form-control mb-2" onChange={handleChange} />
            <label name="password" className="label">Senha</label>
            <input name="password" type="password" placeholder="Digite a sua Senha" className="form-control mb-2" onChange={handleChange} />
            <label className="label">Confirme a Senha</label>
            <input name="confirmPassword" type="password" placeholder="Digite novamente sua senha" className="form-control mb-2" onChange={handleChange}/>
            <label name="cpf" className="label">CPF</label>
            <input name="cpf" placeholder="Digite o seu CPF" className="form-control mb-2" onChange={handleChange} />
            <div className="form-check mb-3">
                <input className="form-check-input" type="checkbox" name="isElderly" onChange={handleChange} />
                <label className="form-check-label">Sou idoso</label>
                
            </div>
            <div className="form-check mb-3">
                <input className="form-check-input" type="checkbox" name="isFreePass" onChange={handleChange} />
                <label className="form-check-label">Sou passe livre</label>
            </div>
            <label name="documentNumber" className="label">Número da Carteirinha</label>
            <input name="documentNumber" placeholder="Digite o Nº do Documento" className="form-control mb-2" onChange={handleChange} />
            
            <button className="btn btn-success" onClick={handleSubmit}>Cadastrar</button>
            {mensagem && <div className="alert alert-info mt-3">{mensagem}</div>}
        </div>
    );
}
