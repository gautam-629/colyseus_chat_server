// File: routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

router.get('/search', auth, async (req, res) => {
    try {
        const { query } = req.query;
        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ],
            _id: { $ne: req.userId }
        }).select('-password');
        res.json(users);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
