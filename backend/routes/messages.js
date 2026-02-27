const express = require('express');
const router = express.Router();
const { getMessages, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.get('/swap/:swapId', protect, getMessages);
router.post('/swap/:swapId', protect, sendMessage);

module.exports = router;
