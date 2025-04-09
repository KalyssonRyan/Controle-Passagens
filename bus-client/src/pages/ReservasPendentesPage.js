import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../auth';
import Loader from '../components/Loader';
export default function ReservasPendentesPage() {
    const [reservas, setReservas] = useState([]);
    const [mensagem, setMensagem] = useState('');
    const [carregando, setCarregando] = useState(true);
    const buscarReservas = async () => {
        setCarregando(true);
        const res = await axios.get('https://controle-passagens.onrender.com/reservas-pendentes', {
            headers: { Authorization: `Bearer ${getToken()}` }
        });
        setReservas(res.data);
        setCarregando(false);
    };

    const confirmarReserva = async (id) => {
        try {
            const res = await axios.put(`https://controle-passagens.onrender.com/confirmar-reserva/${id}`, {}, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            setMensagem(res.data.message);
            buscarReservas();
        } catch (err) {
            setMensagem(err.response?.data?.message || 'Erro ao confirmar reserva');
        }
    };

    useEffect(() => {
        buscarReservas();
    }, []);
    if(carregando) return <Loader texto="Buscando Ônibus"/>;
    return (
        <div className="container mt-4">
            <h2>Reservas Pendentes</h2>
            {mensagem && <div className="alert alert-info">{mensagem}</div>}

            {reservas.length === 0 && <p>Nenhuma reserva pendente.</p>}

            {reservas.map(r => (
                <div key={r._id} className="card p-3 mb-2">
                    <p><strong>Passageiro:</strong> {r.userId?.name || '---'}</p>
                    <p><strong>Tipo:</strong> {r.type}</p>
                    <p><strong>Data:</strong> {r.date} - {r.time}</p>
                    <button onClick={() => confirmarReserva(r._id)} className="btn btn-success btn-sm">Confirmar</button>
                </div>
            ))}
        </div>
    );
}
