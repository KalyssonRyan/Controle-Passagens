// src/pages/RegisterPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { login } from '../auth';
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
        documentImage: null 
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
    
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('email', form.email);
        formData.append('password', form.password);
        formData.append('cpf', form.cpf);
        formData.append('documentNumber', form.documentNumber);
        formData.append('isElderly', form.isElderly);
        formData.append('isFreePass', form.isFreePass);
        
        if (form.documentImage) {
            formData.append('documentImage', form.documentImage); // só se tiver imagem
        }
    
        try {
            const res = await axios.post(
                'https://controle-passagens.onrender.com/register-client',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            if (res.data.token) {
                login(res.data.token);
            }
        
            setMensagem(res.data.message);
            
            // Redirecionar direto pra página de conta
            window.location.href = '/minha-conta';
        
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
            <label className="label">Anexar imagem da carteirinha (opcional)</label>
<input
    type="file"
    name="documentImage"
    className="form-control mb-3"
    accept="image/*"
    onChange={(e) =>
        setForm((prev) => ({
            ...prev,
            documentImage: e.target.files[0], // pega o arquivo da imagem
})) }
/>
            <label name="documentNumber" className="label">Número da Carteirinha</label>
            <input name="documentNumber" placeholder="Digite o Nº do Documento" className="form-control mb-2" onChange={handleChange} />
            
            <button className="btn btn-success" onClick={handleSubmit}>Cadastrar</button>
            {mensagem && <div className="alert alert-info mt-3">{mensagem}</div>}
        </div>
    );
}
