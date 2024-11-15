const express = require('express');
const validator = require('express-validator')
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs')
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./authMiddleware');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Database Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Connection error', err.stack));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

app.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.send(`Server is running. Database time: ${result.rows[0].now}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database connection error');
    }
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const result = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
            [username, email, hashedPassword]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (user.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// Create a new gift
app.post('/gifts', authenticateToken, async (req, res) => {
    const { recipient_name, gift_name, status, link } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO gifts (user_id, recipient_name, gift_name, status, link) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.user.userId, recipient_name, gift_name, status, link]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get all gifts for a user
app.get('/gifts', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM gifts WHERE user_id = $1',
            [req.user.userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Update a gift
app.patch('/gifts/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { recipient_name, gift_name, status, link } = req.body;
    try {
        const result = await pool.query(
            'UPDATE gifts SET recipient_name = $1, gift_name = $2, status = $3, link = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
            [recipient_name, gift_name, status, link, id, req.user.userId]
        );
        if (result.rows.length === 0) return res.status(404).send('Gift not found');
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Delete a gift
app.delete('/gifts/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM gifts WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.user.userId]
        );
        if (result.rows.length === 0) return res.status(404).send('Gift not found');
        res.sendStatus(204); // No Content
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
