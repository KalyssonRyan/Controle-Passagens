const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
  reservaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reserva' },
  code: { type: String, required: true },
  type: String,
  date: String,
  time: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ticket', ticketSchema);