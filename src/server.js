const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// 

// Database Schema
const UserSchema = new mongoose.Schema({
    collegeId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' }
});

const User = mongoose.model('User', UserSchema);

// SECURE REGISTER (Run once to create your Admin)
app.post('/api/register', async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({ 
        collegeId: req.body.collegeId, 
        password: hashedPassword, 
        role: req.body.role 
    });
    await newUser.save();
    res.json({ message: "User Created" });
});

// HARDENED LOGIN
app.post('/api/login', async (req, res) => {
    const user = await User.findOne({ collegeId: req.body.collegeId });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Password" });

    const token = jwt.sign({ id: user._id, role: user.role }, 'SECRET_KEY', { expiresIn: '1h' });
    res.json({ token, role: user.role });
});

app.listen(5000, () => console.log("Server running on port 5000"));