require('dotenv').config();
const { Pool } = require('pg');
const provider = require('../dataProvider');

const NUM_CUSTOMERS = 15;
const PURCHASES_PER_ACCOUNT = 40;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.warn('Pool connection dropped, will reconnect on next query:', err.message);
});

async function insertCustomer(customer) {
  await pool.query(
    `INSERT INTO customers (id, first_name, last_name, street_number, street_name, city, state, zip)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [customer._id, customer.first_name, customer.last_name, customer.address.street_number, customer.address.street_name, customer.address.city, customer.address.state, customer.address.zip]
  );
}

async function insertAccount(account) {
  await pool.query(
    `INSERT INTO accounts (id, customer_id, type, nickname, rewards, balance, account_number)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [account._id, account.customer_id, account.type, account.nickname, account.rewards, account.balance, account.account_number]
  );
}

async function insertPurchase(purchase) {
  await pool.query(
    `INSERT INTO transactions (id, account_id, merchant_id, merchant_name, medium, purchase_date, amount, status, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [purchase._id, purchase.account_id, purchase.merchant_id, purchase.merchant_name, purchase.medium, purchase.purchase_date, purchase.amount, purchase.status, purchase.description]
  );
}

async function seed() {
  console.log(`Seeding ${NUM_CUSTOMERS} customers...`);

  const customers = await provider.getCustomers(NUM_CUSTOMERS);

  for (const customer of customers) {
    await insertCustomer(customer);

    const accounts = await provider.getAccountsForCustomer(customer._id);
    for (const account of accounts) {
      await insertAccount(account);

      const purchases = await provider.getPurchasesForAccount(account._id, PURCHASES_PER_ACCOUNT);
      for (const purchase of purchases) {
        await insertPurchase(purchase);
      }

      console.log(`  ✓ ${customer.first_name} ${customer.last_name} — ${account.nickname} (${purchases.length} txns)`);
    }
  }

  console.log('Seeding complete.');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
});
