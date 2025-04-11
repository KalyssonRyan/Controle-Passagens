// src/pages/AdminPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';

export default function AdminPage() {
    const [buses, setBuses] = useState([]);
    const [newBus, setNewBus] = useState({ 
        name: '',
        totalSeats: 30,
        limits: { 
          idoso: 2, 
          passeLivre: 3, 
          comum: 30 
        } 
      });
    const [editingBusId, setEditingBusId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [busToDelete, setBusToDelete] = useState(null);

    const fetchBuses = () => {
        axios.get('https://controle-passagens.onrender.com/buses')
            .then(res => setBuses(res.data));
    };

    useEffect(() => {
        fetchBuses();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewBus(prev => ({ ...prev, [name]: value }));
    };

    const addOrUpdateBus = async () => {
        const payload = {
            name: newBus.name,
            totalSeats: Number(newBus.totalSeats),
            reserved: { idoso: 0, passeLivre: 0, comum: 0 },
            limits: {
                idoso: Number(newBus.idoso),
                passeLivre: Number(newBus.passeLivre),
                comum: Number(newBus.comum),
            },
        };

        if (editingBusId) {
            await axios.put(`https://controle-passagens.onrender.com/edit-bus/${editingBusId}`, payload);
            setEditingBusId(null);
        } else {
            await axios.post('https://controle-passagens.onrender.com/add-bus', payload);
        }

        setNewBus({ name: '', totalSeats: 30, idoso: 2, passeLivre: 3, comum: 25 });
        fetchBuses();
    };

    const startEditing = (bus) => {
        setNewBus({
            name: bus.name,
            totalSeats: bus.totalSeats,
            idoso: bus.limits.idoso,
            passeLivre: bus.limits.passeLivre,
            comum: bus.limits.comum
        });
        setEditingBusId(bus._id);
    };

    const deleteBus = async (busId) => {
        await axios.delete(`https://controle-passagens.onrender.com/delete-bus/${busId}`);
        fetchBuses();
    };

    const handleShowModal = (bus) => {
        setBusToDelete(bus);
        setShowModal(true);
    };

    const handleConfirmDelete = async () => {
        if (busToDelete) {
            await deleteBus(busToDelete._id);
            setShowModal(false);
        }
    };

    return (
        <div>
            <h2>Painel do Administrador</h2>

            <div className="card p-3 mb-4">
                <h5>{editingBusId ? 'Editar Ônibus' : 'Novo Ônibus'}</h5>
                <label className="label">Nome</label>
                <input name="name" placeholder="Nome" className="form-control mb-2" value={newBus.name} onChange={handleChange} />
                <label className="label">Total de Vagas</label>
                <input name="totalSeats" type="number" placeholder="Total de Vagas" className="form-control mb-2" value={newBus.totalSeats} onChange={handleChange} />
                <label className="label">Vagas para Idosos</label>
                <input name="idoso" type="number" placeholder="Vagas para Idosos" className="form-control mb-2" value={newBus.idoso} onChange={handleChange} />
                <label className="label">Vagas para Adolescentes</label>
                <input name="passeLivre" type="number" placeholder="Vagas para Adolescentes" className="form-control mb-2" value={newBus.passeLivre} onChange={handleChange} />
                <label className="label">Vagas Comuns</label>
                <input name="comum" type="number" placeholder="Vagas Comuns" className="form-control mb-2" value={newBus.totalSeats - newBus.idoso - newBus.passeLivre} onChange={handleChange} />

                <button onClick={addOrUpdateBus} className="btn btn-primary">
                    {editingBusId ? 'Salvar Alterações' : 'Adicionar Ônibus'}
                </button>
            </div>

            <h4>Ônibus Cadastrados</h4>
            {buses.map(bus => (
                <div key={bus._id} className="card mb-3 p-3">
                    <h5>{bus.name}</h5>
                    <p><strong>Total de Vagas:</strong> {bus.totalSeats}</p>
                    <p>Idosos: {bus.reserved.idoso}/{bus.limits.idoso}</p>
                    <p>Adolescentes: {bus.reserved.passeLivre}/{bus.limits.passeLivre}</p>
                    <p>Comum: {bus.reserved.comum}/{bus.limits.comum}</p>

                    <div className="mt-2">
                        <button onClick={() => startEditing(bus)} className="btn btn-warning btn-sm me-2">Editar</button>
                        <button onClick={() => handleShowModal(bus)} className="btn btn-danger btn-sm">Excluir</button>
                    </div>
                </div>
            ))}

            {/* Modal de confirmação (fora do map) */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Exclusão</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Tem certeza que deseja excluir o ônibus <strong>{busToDelete?.name}</strong>?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
                    <Button variant="danger" onClick={handleConfirmDelete}>Confirmar Exclusão</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
