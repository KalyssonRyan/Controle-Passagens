import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../auth'; // ou onde você guarda o token

export default function MinhaContaPage() {
    const [form, setForm] = useState({
        name: '',
        cpf: '',
        documentNumber: '',
        isElderly: false,
        isFreePass: false,
        documentImage: '',      // URL da imagem atual
        newImageFile: null      // novo arquivo selecionado
    });
    const [preview, setPreview] = useState(null);
    const [mensagem, setMensagem] = useState('');

    const carregarUsuario = async () => {
        try {
            const res = await axios.get('https://controle-passagens.onrender.com/me', {
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            const dados = res.data;

            setForm({
                name: dados.name || '',
                cpf: dados.cpf || '',
                documentNumber: dados.documentNumber || '',
                isElderly: dados.isElderly || false,
                isFreePass: dados.isFreePass || false,
                documentImage: dados.documentImage || '',
                newImageFile: null
            });

            setPreview(null); // não mostra preview se ainda não alterou imagem

        } catch (err) {
            console.error('Erro ao carregar dados do usuário:', err);
        }
    };

    carregarUsuario();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('cpf', form.cpf);
        formData.append('documentNumber', form.documentNumber);
        formData.append('isElderly', form.isElderly);
        formData.append('isFreePass', form.isFreePass);
    
        if (form.newImageFile) {
            formData.append('documentImage', form.newImageFile);
        }
    
        try {
            const res = await axios.put('https://controle-passagens.onrender.com/me', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${getToken()}`
                }
            });
            setMensagem(res.data.message);
        } catch (err) {
            setMensagem('Erro ao atualizar dados');
        }
    };

    return (
        <div className="container mt-4">
            <h2>Minha Conta</h2>
            <label>Nome</label>
            <input name="name" className="form-control mb-2" value={form.name} onChange={handleChange} />
            <label>CPF</label>
            <input name="cpf" className="form-control mb-2" value={form.cpf} onChange={handleChange} />
            <label>Nº da Carteirinha</label>
            <input name="documentNumber" className="form-control mb-2" value={form.documentNumber} onChange={handleChange} />
            <div className="form-check mb-2">
                <input className="form-check-input" type="checkbox" name="isElderly" checked={form.isElderly} onChange={handleChange} />
                <label className="form-check-label">Sou idoso</label>
            </div>
            <div className="form-check mb-3">
                <input className="form-check-input" type="checkbox" name="isFreePass" checked={form.isFreePass} onChange={handleChange} />
                <label className="form-check-label">Sou passe livre</label>
            </div>
            {preview && (
    <div className="mb-3">
        <p>Pré-visualização da nova imagem:</p>
        <img src={preview} alt="Preview" width="200" />
    </div>
)}
{form.documentImage && !preview && (
    <div className="mb-3">
        <p>Imagem atual:</p>
        <img src={form.documentImage} alt="Imagem atual" width="200" />
    </div>
)}
<label>Trocar imagem da carteirinha:</label>
<input
    type="file"
    name="newImageFile"
    accept="image/*"
    className="form-control mb-3"
    onChange={(e) => {
        const file = e.target.files[0];
        setForm(prev => ({ ...prev, newImageFile: file }));

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    }}
/>
            <button className="btn btn-primary" onClick={handleSubmit}>Salvar Alterações</button>
            {mensagem && <div className="alert alert-info mt-3">{mensagem}</div>}
        </div>
    );
}
