// File: routes/messages.js
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const auth = require('../middleware/auth');

router.post('/conversations', auth, async (req, res) => {
    try {
        const { participantId } = req.body;
        let conversation = await Conversation.findOne({
            participants: { $all: [req.userId, participantId] }
        });

        if (!conversation) {
            conversation = new Conversation({
                participants: [req.userId, participantId]
            });
            await conversation.save();
        }

        res.json(conversation);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/conversations', auth, async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.userId
        })
            .populate('participants', 'username email')
            .populate('lastMessage');
        res.json(conversations);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/conversations/:conversationId/messages', auth, async (req, res) => {
    try {
        const messages = await Message.find({
            conversation: req.params.conversationId
        })
            .populate('sender', 'username')
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(messages.reverse());
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;