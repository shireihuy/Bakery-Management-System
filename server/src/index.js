const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

const path = require('path');
const pool = require('./config/db');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 3000;

// Store io in global for controllers
global.io = io;

app.use(cors());
app.use(express.json());

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join:user', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`Socket ${socket.id} joined room user_${userId}`);
  });

  socket.on('join:admin', () => {
    socket.join('admin_support');
    console.log(`Socket ${socket.id} joined admin_support room`);
  });

  socket.on('message:send', async (data) => {
    const { sender_id, receiver_id, message } = data;
    try {
      const result = await pool.query(
        'INSERT INTO chat_messages (sender_id, receiver_id, message) VALUES ($1, $2, $3) RETURNING *',
        [sender_id, receiver_id, message]
      );
      const newMessage = result.rows[0];

      // Emit to receiver's private room
      if (receiver_id) {
        io.to(`user_${receiver_id}`).emit('message:receive', newMessage);
      }
      
      // Emit back to sender's private room (sync across tabs)
      io.to(`user_${sender_id}`).emit('message:receive', newMessage);

      // Also broadcast to all admins monitoring support
      io.to('admin_support').emit('message:receive', newMessage);
      
    } catch (err) {
      console.error('Socket message error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Global logger to debug requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.send('Bakery Management System API is running');
});

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const reportRoutes = require('./routes/reportRoutes');
const aiRoutes = require('./routes/aiRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const couponRoutes = require('./routes/couponRoutes');
const systemRoutes = require('./routes/systemRoutes');
const cartRoutes = require('./routes/cartRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const flashSaleRoutes = require('./routes/flashSaleRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/flash-sales', flashSaleRoutes);
app.use('/api/chat', chatRoutes);


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
