const crypto = require('crypto');

const MERCHANTS = [
  { name: 'Whole Foods Market', category: 'groceries', min: 20, max: 180 },
  { name: 'Shell Oil', category: 'gas', min: 25, max: 70 },
  { name: 'Netflix', category: 'streaming', min: 8, max: 20 },
  { name: 'Chipotle', category: 'restaurant', min: 10, max: 45 },
  { name: 'Target', category: 'retail', min: 15, max: 300 },
  { name: 'Starbucks', category: 'restaurant', min: 5, max: 25 },
  { name: 'Amazon', category: 'retail', min: 10, max: 250 },
  { name: 'Uber', category: 'transport', min: 8, max: 60 },
];

// Tracks each account's last transaction time, for velocity-spike detection
const lastTxTimeByAccount = {};

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateNessieStyleId() {
  return crypto.randomBytes(12).toString('hex');
}

// Distance between two lat/lng points, in km (haversine formula)
function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function generateOneTransaction(pool) {
  const accountResult = await pool.query(
    `SELECT a.id AS account_id, c.first_name, c.last_name, c.home_lat, c.home_lng
     FROM accounts a JOIN customers c ON a.customer_id = c.id
     ORDER BY random() LIMIT 1`
  );
  if (accountResult.rows.length === 0) return null;

  const account = accountResult.rows[0];
  account.home_lat = parseFloat(account.home_lat);
  account.home_lng = parseFloat(account.home_lng);
  const merchant = randomFrom(MERCHANTS);
  const now = Date.now();

  // --- Fraud pattern rolls (each independent, tuned for demo visibility) ---
  const isAmountOutlier = Math.random() < 0.10;
  const isCardNotPresent = Math.random() < 0.12;
  const isGeoAnomaly = Math.random() < 0.08;

  const lastTxTime = lastTxTimeByAccount[account.account_id];
  const isVelocitySpike = lastTxTime && now - lastTxTime < 15000; // another tx on same account within 15s
  lastTxTimeByAccount[account.account_id] = now;

  // --- Amount ---
  let amount = +(Math.random() * (merchant.max - merchant.min) + merchant.min).toFixed(2);
  if (isAmountOutlier) amount = +(amount * (5 + Math.random() * 10)).toFixed(2); // 5x-15x normal

  // --- Location ---
  let lat = account.home_lat + (Math.random() - 0.5) * 0.3;
  let lng = account.home_lng + (Math.random() - 0.5) * 0.3;
  if (isGeoAnomaly) {
    // Jump somewhere far away — simulates "impossible travel"
    lat = account.home_lat + (Math.random() - 0.5) * 40;
    lng = account.home_lng + (Math.random() - 0.5) * 40;
  }

  // --- Rule-based scoring ---
  let riskScore = 0;
  const reasons = [];

  if (isAmountOutlier) {
    riskScore += 35;
    reasons.push('Transaction amount far exceeds typical spending for this account');
  }
  if (isVelocitySpike) {
    riskScore += 30;
    reasons.push('Multiple transactions on this account within a very short window');
  }
  if (isGeoAnomaly) {
    const dist = Math.round(distanceKm(account.home_lat, account.home_lng, lat, lng));
    riskScore += 40;
    reasons.push(`Transaction location is ${dist}km from account holder's home region`);
  }
  if (isCardNotPresent) {
    riskScore += 15;
    reasons.push('Card-not-present transaction');
  }
  riskScore = Math.min(riskScore, 100);

  let riskTier = 'low';
  if (riskScore >= 60) riskTier = 'high';
  else if (riskScore >= 30) riskTier = 'mid';

  const transaction = {
    id: generateNessieStyleId(),
    timestamp: now,
    accountId: account.account_id,
    accountHolder: `${account.first_name} ${account.last_name}`,
    merchant: merchant.name,
    amount,
    lat,
    lng,
    homeLat: account.home_lat,
    homeLng: account.home_lng,
    riskScore,
    riskTier,
    reasons,
    status: 'new',
  };

  await pool.query(
    `INSERT INTO transactions
      (id, account_id, merchant_id, merchant_name, medium, purchase_date, amount, status, description, created_at, lat, lng, risk_score, risk_tier, reasons)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10, $11, $12, $13, $14)`,
    [
      transaction.id,
      transaction.accountId,
      `${merchant.name.toLowerCase().replace(/\s/g, '_')}_${Math.floor(Math.random() * 9999)}`,
      merchant.name,
      isCardNotPresent ? 'card_not_present' : 'balance',
      new Date().toISOString().split('T')[0],
      amount,
      'new',
      `${merchant.category} purchase`,
      lat,
      lng,
      riskScore,
      riskTier,
      reasons,
    ]
  );

  return transaction;
}

function startSimulator(io, pool, intervalMs = 3000) {
  console.log(`Transaction simulator started — new transaction every ${intervalMs / 1000}s`);

  setInterval(async () => {
    try {
      const transaction = await generateOneTransaction(pool);
      if (transaction) {
        io.emit('newTransaction', transaction);
        const flag = transaction.riskTier !== 'low' ? ` [${transaction.riskTier.toUpperCase()}]` : '';
        console.log(`  → ${transaction.merchant} — $${transaction.amount}${flag}`);
      }
    } catch (err) {
      console.error('Simulator error:', err.message);
    }
  }, intervalMs);
}

module.exports = { startSimulator };
