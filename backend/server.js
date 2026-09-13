require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');
const { startSimulator } = require('./simulator');

const app = express();

const allowedOrigins = [
  'https://callthebluff.us',
  'https://www.callthebluff.us',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.warn('Pool connection dropped, will reconnect on next query:', err.message);
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Fraud dashboard backend is running' });
});

app.get('/transactions/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const result = await pool.query(
      `SELECT * FROM transactions ORDER BY created_at DESC LIMIT $1`,
      [limit]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

app.get('/accounts/:id/history', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM transactions WHERE account_id = $1 ORDER BY created_at DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch account history' });
  }
});

app.get('/stats/summary', async (req, res) => {
  try {
    const [customers, accounts, transactions] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM customers'),
      pool.query('SELECT COUNT(*) FROM accounts'),
      pool.query('SELECT COUNT(*) FROM transactions'),
    ]);
    res.json({
      customers: parseInt(customers.rows[0].count),
      accounts: parseInt(accounts.rows[0].count),
      transactions: parseInt(transactions.rows[0].count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

io.on('connection', (socket) => {
  console.log('Frontend connected via WebSocket:', socket.id);
  socket.on('disconnect', () => {
    console.log('Frontend disconnected:', socket.id);
  });
});

const PORT = Number(process.env.PORT) || 3001;

const startServer = (port) => {
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.warn(`Port ${port} is busy. Retrying on ${nextPort}...`);
      startServer(nextPort);
      return;
    }

    throw err;
  });

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    startSimulator(io, pool);
  });
};

startServer(PORT);

module.exports = { app, io, pool };
