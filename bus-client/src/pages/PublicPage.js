import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Loader from '../components/Loader';

const socket = io('https://controle-passagens.onrender.com');

export default function PublicPage() {
    const [buses, setBuses] = useState([]);
     const [carregando, setCarregando] = useState(true);
    useEffect(() => {
        // Carrega dados inicialmente
        setCarregando(true)
        axios.get('https://controle-passagens.onrender.com/buses').then(res => {setBuses(res.data);setCarregando(false);});

        // Atualiza automaticamente quando o servidor emitir
        socket.on('buses', (data) => {
            setBuses(data); 
        });

        return () => socket.off('buses');
       
    }, []);
    if(carregando) return <Loader texto="Buscando Ônibus"/>;
    return (
        <div>
            <h2>Consulta Pública</h2>
            {buses.map(bus => {
                const total = (bus.reserved?.elderly || 0) + (bus.reserved?.teen || 0) + (bus.reserved?.common || 0);
                return (
                    <div key={bus._id} className="card p-3 mb-2">
                        <h5>{bus.name}</h5>
                        <p>Total de Vagas: {bus.totalSeats}</p>
                        <p>Vagas Ocupadas: {total}</p>
                        <p>Vagas Disponíveis: {bus.totalSeats - total}</p>
                        <p>Vagas Idosos disponivel: {bus.limits.elderly - bus.reserved.elderly  }</p>
                    </div>
                );
            })}
        </div>
    );
}
