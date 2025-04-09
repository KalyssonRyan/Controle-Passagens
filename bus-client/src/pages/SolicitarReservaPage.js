import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../auth';
import Loader from '../components/Loader';
export default function SolicitarReservaPage() {
    const [buses, setBuses] = useState([]);
    const [form, setForm] = useState({
        busId: '',
        date: '',
        time: '',
        type: 'common'
    });
    const [mensagem, setMensagem] = useState('');
const [carregando, setCarregando] = useState(true);
    useEffect(() => {
        setCarregando(true);
        axios.get('https://controle-passagens.onrender.com/buses')
            .then(res => {setBuses(res.data);setCarregando(false)});
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            const res = await axios.post('https://controle-passagens.onrender.com/reservar', form, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            setMensagem(res.data.message);
        } catch (err) {
            setMensagem(err.response?.data?.message || 'Erro ao solicitar reserva');
        }
    };
    if(carregando) return <Loader texto="Buscando Ônibus"/>;
    return (
        <div className="container mt-4">
            <h2>Solicitar Reserva</h2>
            {mensagem && <div className="alert alert-info">{mensagem}</div>}

            <label>Ônibus</label>
            <select className="form-select mb-2" name="busId" value={form.busId} onChange={handleChange}>
                <option value="">Selecione</option>
                {buses.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>

            <label>Data</label>
            <input type="date" className="form-control mb-2" name="date" value={form.date} onChange={handleChange} />

            <label>Horário</label>
            <input type="time" className="form-control mb-2" name="time" value={form.time} onChange={handleChange} />

            <label>Tipo</label>
            <select className="form-select mb-2" name="type" value={form.type} onChange={handleChange}>
                <option value="common">Comum</option>
                <option value="elderly">Idoso</option>
                <option value="freepass">Passe Livre</option>
            </select>

            <button onClick={handleSubmit} className="btn btn-primary">Enviar Solicitação</button>
        </div>
    );
}
