// src/pages/TicketManagerPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function TicketManagerPage() {
    const [tickets, setTickets] = useState([]);

    const carregarTickets = () => {
        axios.get('http://localhost:5001/tickets')
            .then(res => setTickets(res.data))
            .catch(() => alert('Erro ao carregar tickets'));
    };

    useEffect(() => {
        carregarTickets();
    }, []);

    const cancelarTicket = async (ticketId) => {
        const confirmar = window.confirm('Tem certeza que deseja cancelar este ticket?');
        if (!confirmar) return;

        try {
            await axios.post('http://localhost:5001/cancel', { ticketId });
            carregarTickets(); // atualiza lista
        } catch (err) {
            alert('Erro ao cancelar ticket');
        }
    };

    const confirmarTicket = async (ticketId) => {
        const confirmar = window.confirm('Confirmar embarque deste passageiro? Isso removerá o ticket.');
        if (!confirmar) return;

        try {
            await axios.delete(`http://localhost:5001/confirm-ticket/${ticketId}`);
            carregarTickets(); // atualiza lista
        } catch (err) {
            alert('Erro ao confirmar ticket');
        }
    };

    return (
        <div className="container mt-4">
            <h2>Gerenciar Tickets</h2>
            {tickets.length === 0 && <p>Nenhum ticket disponível.</p>}

            {tickets.map(ticket => (
                <div key={ticket._id} className="card p-3 mb-2">
                    <p><strong>Código:</strong> {ticket.code}</p>
                    <p><strong>Tipo:</strong> {ticket.type}</p>
                    <div>
                        <button className="btn btn-danger btn-sm me-2" onClick={() => cancelarTicket(ticket._id)}>Cancelar</button>
                        <button className="btn btn-success btn-sm" onClick={() => confirmarTicket(ticket._id)}>Confirmar</button>
                    </div>
                </div>
            ))}
        </div>
    );
}
