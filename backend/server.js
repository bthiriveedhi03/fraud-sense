const path = require('path');
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');
const { startSimulator } = require('./simulator');

const app = express();

  app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
  }));

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
  cors: { origin: 'http://localhost:3000' },
});

io.on('connection', (socket) => {
  console.log('Frontend connected via WebSocket:', socket.id);
  socket.on('disconnect', () => {
    console.log('Frontend disconnected:', socket.id);
  });
});

app.post('/transactions/:id/flag', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, analyst } = req.body;

    if (!action) {
      return res.status(400).json({ error: 'action is required (flag, clear, or escalate)' });
    }

    const statusMap = { flag: 'flagged', clear: 'cleared', escalate: 'escalated' };
    const newStatus = statusMap[action] || action;

    // Placeholder chainTx until real Solana devnet integration is built
    const chainTx = `sim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await pool.query(`UPDATE transactions SET status = $1 WHERE id = $2`, [newStatus, id]);

    const auditId = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await pool.query(
      `INSERT INTO audit_log (id, transaction_id, action, analyst, chain_tx) VALUES ($1, $2, $3, $4, $5)`,
      [auditId, id, action, analyst || 'unknown', chainTx]
    );

    io.emit('transactionUpdated', { id, status: newStatus, chainTx });

    res.json({ id, status: newStatus, chainTx });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to flag transaction' });
  }
});

app.post('/security/simulate-credential-stuffing', async (req, res) => {
  try {
    const attemptCount = Math.floor(Math.random() * 15) + 10;
    const targetAccountId = `sim-account-${Math.random().toString(36).slice(2, 8)}`;

    const attempts = Array.from({ length: attemptCount }, (_, i) => ({
      accountId: targetAccountId,
      attemptNumber: i + 1,
      timestamp: Date.now() + i * 200,
      result: i < attemptCount - 1 ? 'failed' : 'blocked',
    }));

    io.emit('securityAlert', {
      type: 'credential_stuffing',
      targetAccountId,
      attemptCount,
      detectedAt: Date.now(),
    });

    res.json({ type: 'credential_stuffing', targetAccountId, attemptCount, attempts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to simulate credential stuffing' });
  }
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

    if (process.env.DATABASE_URL) {
      startSimulator(io, pool);
    } else {
      console.warn('DATABASE_URL is missing. Simulator disabled until the database is configured.');
    }
  });
};

startServer(PORT);

module.exports = { app, io, pool };

