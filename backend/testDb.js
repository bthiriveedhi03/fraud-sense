require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const result = await pool.query('SELECT NOW()');
  console.log('Connected! Server time is:', result.rows[0].now);
  await pool.end();
}

main().catch((err) => {
  console.error('Connection failed:', err);
});