// Backend - Node.js + Express + Socket.IO + MongoDB
require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
//Adicionando Cloudinary
const { CloudinaryStorage } = require('multer-storage-cloudinary'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Reserva = require('./models/Reserva');
const Ticket = require('./models/Ticket');
const { v4: uuidv4 } = require('uuid');
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'documentos',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    public_id: (req, file) => Date.now() + '-' + file.originalname
  }
});

const upload = multer({ storage });

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Token não enviado' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, 'segredo123');
        req.userId = decoded.id;
        next();
    } catch {
        return res.status(401).json({ message: 'Token inválido' });
    }
};

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

// Schemas do MongoDB
// const ticketSchema = new mongoose.Schema({
//     busId: mongoose.Schema.Types.ObjectId,
//     code: String,
//     type: String ,
//     compradoPor: String
// });

const busSchema = new mongoose.Schema({
    name: String,
    totalSeats: { type: Number, default: 30 }, // Sempre 30 vagas
    reserved: { 
        idoso: { type: Number, default: 0 }, 
        passeLivre: { type: Number, default: 0 }, 
        comum: { type: Number, default: 0 } 
    },
    limits: { 
        idoso: { type: Number, default: 2 }, 
        passeLivre: { type: Number, default: 4 }, 
        comum: { type: Number, default: 25 } 
    }
});

const Bus = mongoose.model('Bus', busSchema);

io.on('connection', async (socket) => {
    console.log('Novo cliente conectado');
    socket.emit('buses', await Bus.find());
    socket.emit('tickets', await Ticket.find());
});

// Rota para obter todos os ônibus
app.get('/buses', async (req, res) => {
    res.json(await Bus.find());
});

// Rota para obter todos os tickets
app.get('/tickets', async (req, res) => {
    res.json(await Ticket.find());
});

// Rota para reservar assento
app.post('/reserve', async (req, res) => {
    const { busId, type, name } = req.body;
    let bus = await Bus.findById(busId);
    if (!bus) return res.status(404).send('Ônibus não encontrado');

    // Verifica se ainda há vagas no total de 30
    const totalReserved = bus.reserved.idoso + bus.reserved.passeLivre + bus.reserved.comum;
    if (totalReserved >= bus.totalSeats) {
        return res.status(400).json({ success: false, message: 'Todas as vagas foram ocupadas!' });
    }

    // Verifica se há vagas para o tipo solicitado
    if (bus.reserved[type] < bus.limits[type]) {
        bus.reserved[type]++;
        await bus.save();

        const ticket = new Ticket({ busId, code: uuidv4(), type, compradoPor: name });
        await ticket.save();

        io.emit('buses', await Bus.find());
        io.emit('tickets', await Ticket.find());
        return res.json({ success: true, message: 'Reserva feita!', ticket });
    } else {
        return res.status(400).json({ success: false, message: 'Limite para esse tipo de vaga foi atingido!' });
    }
});
app.post('/add-bus', async (req, res) => {
    const newBus = new Bus(req.body);
    await newBus.save();
    res.json({ success: true, message: 'Ônibus criado' });
});

// Rota para cancelar reserva
app.post('/cancel', async (req, res) => {
    const { ticketId } = req.body;
    let ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).send('Ticket não encontrado');

    let bus = await Bus.findById(ticket.busId);
    if (!bus) return res.status(404).send('Ônibus não encontrado');

    bus.reserved[ticket.type]--;
    await bus.save();
    await Ticket.findByIdAndDelete(ticketId);

    io.emit('buses', await Bus.find());
    io.emit('tickets', await Ticket.find());
    return res.json({ success: true, message: 'Reserva cancelada!' });
});
app.put('/edit-bus/:id', async (req, res) => {
    await Bus.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        totalSeats: req.body.totalSeats,
        limits: req.body.limits
    });
    io.emit('buses', await Bus.find());
    res.json({ success: true });
});

app.delete('/delete-bus/:id', async (req, res) => {
    await Bus.findByIdAndDelete(req.params.id);
    await Ticket.deleteMany({ busId: req.params.id }); // remove tickets desse ônibus também
    io.emit('buses', await Bus.find());
    io.emit('tickets', await Ticket.find());
    res.json({ success: true });
});


// Modelo de usuário
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Pode ser vazio se usar login com Google depois
    name: { type: String, required: true },
    cpf: { type: String, required: true, unique: true  },
    documentNumber: { type: String, required: true },
    isElderly: { type: Boolean, default: false },
    isFreePass: {type: Boolean,default:false},
    documentImage: { type: String },
    documentImageId: { type: String },
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Usuário já existe' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    res.json({ message: 'Usuário registrado com sucesso' });
});
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Usuário não encontrado' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: 'Senha incorreta' });

    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, 'segredo123', { expiresIn: '2h' });
    res.json({ token });
});
// Servidor rodando na porta 5001
server.listen(5001, () => console.log('Servidor rodando na porta 5001'));

app.delete('/confirm-ticket/:id', async (req, res) => {
    const ticketId = req.params.id;
    await Ticket.findByIdAndDelete(ticketId); // apenas remove
    io.emit('tickets', await Ticket.find());
    res.json({ success: true });
});
app.post('/register-client', upload.single('documentImage'), async (req, res) => {
    const { email, password, name, cpf, documentNumber, isElderly } = req.body;
    const documentImage = req.file ? req.file.path : null;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email,
            password: hashedPassword,
            name,
            cpf,
            documentNumber,
            isElderly,
            documentImage
        });

        await newUser.save();

        // 👇 Gera token automaticamente após o registro
        const token = jwt.sign({ id: newUser._id }, 'segredo123', { expiresIn: '2h' });

        res.json({ message: 'Cliente cadastrado com sucesso!', token }); // 👈 Envia token também

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao cadastrar cliente' });
    }
});

// rota para editar dados
app.get('/me', authMiddleware, async (req, res) => {
    console.log('[ME] Requisição autenticada de ID:', req.userId);

    const user = await User.findById(req.userId).select('-password');
    if (!user) {
        console.log('[ME] Usuário não encontrado');
        return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    console.log('[ME] Dados enviados:', user);
    res.json(user);
});
app.put('/me', authMiddleware, upload.single('documentImage'), async (req, res) => {
    const { name, cpf, documentNumber, isElderly, isFreePass } = req.body;
    const user = await User.findById(req.userId);
    const updateData = { name, cpf, documentNumber, isElderly, isFreePass };

    if (req.file) {
        const documentImage = req.file.path;
        const documentImageId = req.file.filename; // filename é o public_id

        // Se já havia imagem, deletar do Cloudinary
        if (user.documentImageId) {
            await cloudinary.uploader.destroy(user.documentImageId);
        }

        updateData.documentImage = documentImage;
        updateData.documentImageId = documentImageId;
    }

    await User.findByIdAndUpdate(req.userId, updateData);
    res.json({ message: 'Dados atualizados com sucesso' });
});

app.post('/reservar', authMiddleware, async (req, res) => {
    const { busId, date, time, type } = req.body;
  
    if (!busId || !date || !time || !type) {
      return res.status(400).json({ message: 'Dados incompletos para reserva' });
    }
  
    try {
      const reserva = new Reserva({
        userId: req.userId,
        busId,
        date,
        time,
        type,
        status: 'pendente'
      });
  
      await reserva.save();
      res.json({ success: true, message: 'Reserva solicitada com sucesso! Aguarde confirmação.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao criar reserva' });
    }
  });

  app.get('/reservas-confirmadas', async (req, res) => {
    const { busId, date, time } = req.query;
  
    if (!busId || !date || !time) {
      return res.status(400).json({ message: 'Parâmetros obrigatórios não informados' });
    }
  
    try {
      const reservas = await Reserva.find({
        busId,
        date,
        time,
        status: 'confirmada'
      });
  
      // Conta por tipo
      const contagem = {
        comum: 0,
        idoso: 0,
        passeLivre: 0
      };
  
      reservas.forEach((reserva) => {
        contagem[reserva.type]++;
      });
  
      res.json(contagem);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao buscar reservas confirmadas' });
    }
  });

  app.put('/confirmar-reserva/:id', async (req, res) => {
    const reserva = await Reserva.findById(req.params.id).populate('busId userId');
    
    if (!reserva) return res.status(404).json({ message: 'Reserva não encontrada' });
  
    // Verifica limite por tipo
    const tipo = reserva.type;
    const bus = reserva.busId;
    const data = reserva.date;
    const hora = reserva.time;
  
    const totalConfirmadas = await Reserva.countDocuments({
      busId: bus._id,
      type: tipo,
      date: data,
      time: hora,
      status: 'confirmada'
    });
  
    const limite = bus.limits[tipo];
    if (totalConfirmadas >= limite) {
      return res.status(400).json({ message: 'Limite de reservas atingido para este tipo e horário' });
    }
  
    // Atualiza reserva
    
    bus.reserved[tipo]++;
    await bus.save();
    reserva.status = 'confirmada';
    await reserva.save();
  
    // Cria ticket automaticamente
    const novoTicket = await Ticket.create({
      userId: reserva.userId._id,
      busId: bus._id,
      reservaId: reserva._id,
      code: uuidv4(),
      type: tipo,
      date: data,
      time: hora,
      compradoPor: reserva.userId.name
    });
  
    return res.json({
      message: 'Reserva confirmada e passagem emitida!',
      ticket: novoTicket
    });
  });

  app.get('/reservas-pendentes', authMiddleware, async (req, res) => {
    const pendentes = await Reserva.find({ status: 'pendente' }).populate('userId', 'name');
    res.json(pendentes);
});

app.get('/minhas-reservas', authMiddleware, async (req, res) => {
    try {
      const reservas = await Reserva.find({ userId: req.userId }).populate('busId', 'name');
      res.json(reservas);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao buscar suas reservas' });
    }
  });