const jwt = require('jsonwebtoken');
const User = require('../models/User');

const setupSocket = (io) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = await User.findById(decoded.id).select('-password');
      }
      next();
    } catch {
      // Allow unauthenticated connections (guest browsing)
      next();
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} | User: ${socket.user?.name || 'Guest'}`);

    // ─── Chat Room Events ──────────────────────────────────────────────────
    socket.on('room:join', (swapId) => {
      socket.join(swapId);
      console.log(`User ${socket.user?.name} joined room: ${swapId}`);
    });

    socket.on('room:leave', (swapId) => {
      socket.leave(swapId);
    });

    // ─── Chat Message ──────────────────────────────────────────────────────
    socket.on('message:send', async (data) => {
      const { swapId, content } = data;
      if (!socket.user) return;

      try {
        const Message = require('../models/Message');
        const Swap = require('../models/Swap');

        const swap = await Swap.findById(swapId);
        if (!swap) return;

        const isParticipant =
          swap.requester.toString() === socket.user._id.toString() ||
          swap.owner.toString() === socket.user._id.toString();
        if (!isParticipant) return;

        const message = await Message.create({
          swap: swapId,
          sender: socket.user._id,
          content,
        });

        await message.populate('sender', 'name avatar');

        // Broadcast to room
        io.to(swapId).emit('message:new', message);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // ─── Typing indicator ──────────────────────────────────────────────────
    socket.on('typing:start', ({ swapId }) => {
      socket.to(swapId).emit('typing:start', { user: socket.user?.name });
    });

    socket.on('typing:stop', ({ swapId }) => {
      socket.to(swapId).emit('typing:stop');
    });

    // ─── User online status ────────────────────────────────────────────────
    if (socket.user) {
      socket.broadcast.emit('user:online', { userId: socket.user._id });
    }

    socket.on('disconnect', () => {
      if (socket.user) {
        socket.broadcast.emit('user:offline', { userId: socket.user._id });
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSocket;
