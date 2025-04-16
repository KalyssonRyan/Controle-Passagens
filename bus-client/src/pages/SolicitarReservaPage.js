import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../auth';
import Loader from '../components/Loader';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Modal, Button } from 'react-bootstrap';
export default function SolicitarReservaPage() {
    const [buses, setBuses] = useState([]);
    const [form, setForm] = useState({
        busId: '',
        date: '',
        time: '',
        type: 'comum'
    });
    const [mensagem, setMensagem] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [minhasReservas, setMinhasReservas] = useState([]);
    const [reservaSelecionada, setReservaSelecionada] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);

    useEffect(() => {
        setCarregando(true);
        axios.get('https://controle-passagens.onrender.com/buses')
            .then(res => { setBuses(res.data); setCarregando(false) });
        buscarMinhasReservas();
    }, []);

    const buscarMinhasReservas = async () => {
        try {
            const res = await axios.get('https://controle-passagens.onrender.com/minhas-reservas', {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            setMinhasReservas(res.data);
        } catch (err) {
            console.error('Erro ao buscar reservas', err);
        }
    };
    const cancelarReserva = async (id) => {
        try {
            await axios.delete(`https://controle-passagens.onrender.com/cancelarReserva/${id}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });

            buscarMinhasReservas();
        } catch (erro) {
            console.error('Erro ao cancelar reserva:', erro);
        }

    }
    const confirmarCancelamento = (reserva) => {
        setReservaSelecionada(reserva);
        setMostrarModal(true);
    };
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
    if (carregando) return <Loader texto="Buscando Ônibus" />;
    return (
        <div className="container mt-4">
            <h2>Solicitar Reserva</h2>
            {mensagem && <div className="alert alert-info">{mensagem}</div>}

            <label>Ônibus</label>
            <select className="form-select mb-2" name="busId" value={form.busId} onChange={handleChange}>
                <option value="">Selecione</option>
                {buses.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>

            <div className="mb-3">
                <label>Escolha a Data no Calendário:</label>
                <Calendar
                    onChange={(date) => setForm(prev => ({
                        ...prev,
                        date: new Date(date).toISOString().split('T')[0]
                    }))}
                    tileClassName={({ date, view }) => {
                        if (view === 'month') {
                            const diasReservados = minhasReservas.map(r => r.date);
                            const hoje = date.toISOString().split('T')[0];
                            if (diasReservados.includes(hoje)) {
                                return 'bg-warning text-white'; // visual destaca o dia
                            }
                        }
                    }}
                />
                <small className="text-muted">Data selecionada: <strong>{form.date || 'Nenhuma'}</strong></small>
            </div>

            <label>Horário</label>
            <input type="time" className="form-control mb-2" name="time" value={form.time} onChange={handleChange} />

            <label>Tipo</label>
            <select className="form-select mb-2" name="type" value={form.type} onChange={handleChange}>
                <option value="comum">Comum</option>
                <option value="idoso">Idoso</option>
                <option value="passeLivre">Passe Livre</option>
            </select>

            <button onClick={handleSubmit} className="btn btn-primary">Enviar Solicitação</button>


            <h3>Minhas Reservas</h3>
            {minhasReservas.length === 0 ? (
                <p>Você ainda não fez nenhuma reserva.</p>
            ) : (
                minhasReservas.map(r => (
                    <div key={r._id} className="card p-3 mb-2">
                        <p><strong>Ônibus:</strong> {r.busId?.name}</p>
                        <p><strong>Data:</strong> {r.date}</p>
                        <p><strong>Horário:</strong> {r.time}</p>
                        <p><strong>Tipo:</strong> {r.type}</p>
                        <p><strong>Status:</strong> <span className={`badge bg-${r.status === 'confirmada' ? 'success' : r.status=== 'pendente' ? 'warning' : 'danger'}`}>{r.status}</span></p>

                        {r.status === 'pendente' && (
                            <button className="btn btn-danger btn-sm mt-2" onClick={() => confirmarCancelamento(r)}>Cancelar Reserva</button>
                        )}
                    </div>
                ))

            )}
            <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Cancelamento</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Tem certeza que deseja cancelar a reserva do dia <strong>{reservaSelecionada?.date}</strong> às <strong>{reservaSelecionada?.time}</strong>?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setMostrarModal(false)}>
                        Não, voltar
                    </Button>
                    <Button variant="danger" onClick={() => {
                        cancelarReserva(reservaSelecionada._id);
                        setMostrarModal(false);
                    }}>
                        Sim, cancelar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>


    );
}
