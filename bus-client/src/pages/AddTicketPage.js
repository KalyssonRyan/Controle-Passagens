// src/pages/AddTicketPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AddTicketPage() {
    const [buses, setBuses] = useState([]);
    const [selectedBusId, setSelectedBusId] = useState('');
    const [type, setType] = useState('elderly');
    const [mensagem, setMensagem] = useState('');
    const [name, setName] = useState('');
    useEffect(() => {
        axios.get('https://controle-passagens.onrender.com/buses').then(res => setBuses(res.data));
    }, []);

    const adicionarPassagem = async () => {
        if (!selectedBusId) {
            setMensagem("Por favor, selecione um ônibus antes de continuar.");
            return;
        }
    
        try {
            const response = await axios.post('https://controle-passagens.onrender.com/reserve', {
                busId: selectedBusId,
                type,
                name
            });
            setMensagem(`Passagem registrada com sucesso! Código do ticket: ${response.data.ticket.code}`);
        } catch (err) {
            setMensagem(err.response?.data?.message || 'Erro ao registrar passagem');
        }
    };
    

    return (
        <div>
            <h2>Adicionar Passagem Manualmente</h2>

            <div className="mb-3">
                <label className="form-label">Selecione o Ônibus</label>
                <select className="form-select" value={selectedBusId} onChange={(e) => setSelectedBusId(e.target.value)}>
                    <option value="">-- Escolha um ônibus --</option>
                    {buses.map(bus => {
                        const totalReservado = bus.reserved.elderly + bus.reserved.teen + bus.reserved.common;
                        const vagasRestantes = bus.totalSeats - totalReservado;
                        return (
                            <option key={bus._id} value={bus._id}>
                                {bus.name} - {vagasRestantes} vagas disponíveis
                            </option>
                        );
                    })}
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">Tipo de Vaga</label>
                <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="elderly">Idoso</option>
                    <option value="teen">Adolescente</option>
                    <option value="common">Comum</option>
                </select>
            </div>
            <div className="mb-3">
                <label className="form-label">Nome: </label>
                <input name="name" placeholder="Nome" className="form-control mb-2" value={name} onChange={(e) => setName(e.target.value)}
/>
            </div>

            <button className="btn btn-success" onClick={adicionarPassagem}>Registrar Passagem</button>

            {mensagem && <div className="alert alert-info mt-3">{mensagem}</div>}
        </div>
    );
}
