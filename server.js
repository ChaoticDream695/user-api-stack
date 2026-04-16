const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const redis = require('redis');
const pool = require('./db_connection');
// const { redisClient, connectRedis } = require('./redis');
const redisClient  = require('./redis');

const app = express();

app.use(express.json());

console.log(pool);

(async () => {
  try {
    await redisClient.connect();
    console.log('Redis connected');
  } catch (err) {
    console.error('Redis connection error:', err);
  }
})();

// Get all users with redis
app.get('/api/users', async (req, res) => {
    try {
        // Vérifier cache Redis
        const cached = await redisClient.get('users:all');
        if (cached) {
            console.log('Cache HIT');
            return res.json(JSON.parse(cached));
        }
        // Cache MISS - Query database
        console.log('Cache MISS - Query DB');
        const result = await pool.query('SELECT * FROM users ORDER BY id');
        // Mettre en cache (expire après 60 secondes)
        await redisClient.setEx('users:all', 60, JSON.stringify(result.rows));
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get user with id
app.get('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Add user
app.post('/api/users', async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email required' });
        }
        const result = await pool.query(
            'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
            [name, email]
        );
        // Invalider cache Redis
        await redisClient.del('users:all');
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({ error: 'Email already exists' });
        }
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

//Health check
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        await redisClient.ping();
        res.json({
            status: 'OK',
            database: 'connected',
            cache: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({ status: 'ERROR', error: error.message });
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

