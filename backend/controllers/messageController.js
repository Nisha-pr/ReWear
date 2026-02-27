const Message = require('../models/Message');
const Swap = require('../models/Swap');

// ─── Get Messages for a Swap ──────────────────────────────────────────────────
exports.getMessages = async (req, res, next) => {
  try {
    const swap = await Swap.findById(req.params.swapId);
    if (!swap) return res.status(404).json({ success: false, message: 'Swap not found' });

    // Verify participant
    const isParticipant =
      swap.requester.toString() === req.user._id.toString() ||
      swap.owner.toString() === req.user._id.toString();
    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const messages = await Message.find({ swap: req.params.swapId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { swap: req.params.swapId, sender: { $ne: req.user._id }, read: false },
      { read: true }
    );

    res.json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};

// ─── Send Message ─────────────────────────────────────────────────────────────
exports.sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    const swap = await Swap.findById(req.params.swapId);
    if (!swap) return res.status(404).json({ success: false, message: 'Swap not found' });

    const isParticipant =
      swap.requester.toString() === req.user._id.toString() ||
      swap.owner.toString() === req.user._id.toString();
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const message = await Message.create({
      swap: swap._id,
      sender: req.user._id,
      content,
    });

    await message.populate('sender', 'name avatar');

    // Emit via socket
    const io = req.app.get('io');
    if (io) {
      io.to(swap.chatRoomId).emit('message:new', message);
    }

    res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};
