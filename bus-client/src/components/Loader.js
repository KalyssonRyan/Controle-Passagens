// src/components/Loader.js
import React from 'react';

export default function Loader({ texto = "Carregando..." }) {
    return (
        <div className="d-flex flex-column justify-content-center align-items-center mt-5">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">{texto}</span>
            </div>
            <p className="mt-3">{texto}</p>
        </div>
    );
}
