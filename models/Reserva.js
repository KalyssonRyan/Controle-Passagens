const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  date: { type: String, required: true }, // Ex: '2025-04-10'
  time: { type: String, required: true }, // Ex: '08:00'
  type: { type: String, enum: ['comum', 'idoso', 'passeLivre'], required: true },
  status: { type: String, enum: ['pendente', 'confirmada', 'rejeitada'], default: 'pendente' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reserva', reservaSchema);