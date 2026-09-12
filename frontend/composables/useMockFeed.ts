import type { Transaction, RiskTier } from '~/stores/feed'

const MERCHANTS = ['Corner Market', 'Rideshare Co', 'Streamline Sub', 'Hardware Depot', 'Coffee Bar', 'Online Retailer']
const ACCOUNTS = [
  { id: 'acc_1001', holder: 'J. Alvarez', homeLat: 32.7767, homeLng: -96.797 }, // Dallas
  { id: 'acc_1002', holder: 'M. Chen', homeLat: 29.7604, homeLng: -95.3698 }, // Houston
  { id: 'acc_1003', holder: 'R. Patel', homeLat: 30.2672, homeLng: -97.7431 }, // Austin
]

function riskTierFor(score: number): RiskTier {
  if (score >= 70) return 'high'
  if (score >= 35) return 'mid'
  return 'low'
}

function jitter(base: number, spread: number) {
  return base + (Math.random() - 0.5) * spread
}

let counter = 0

/** Generates one plausible "clean" transaction near the account's home location. */
export function generateCleanTransaction(): Transaction {
  const account = ACCOUNTS[Math.floor(Math.random() * ACCOUNTS.length)]
  const score = Math.round(Math.random() * 20)
  counter += 1
  return {
    id: `tx_${Date.now()}_${counter}`,
    timestamp: Date.now(),
    accountId: account.id,
    accountHolder: account.holder,
    merchant: MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)],
    amount: Math.round(Math.random() * 120 + 5),
    lat: jitter(account.homeLat, 0.3),
    lng: jitter(account.homeLng, 0.3),
    homeLat: account.homeLat,
    homeLng: account.homeLng,
    riskScore: score,
    riskTier: riskTierFor(score),
    reasons: [],
    status: 'new',
  }
}

/** Generates a borderline transaction: a moderate amount anomaly without a full fraud pattern. */
export function generateBorderlineTransaction(): Transaction {
  const account = ACCOUNTS[Math.floor(Math.random() * ACCOUNTS.length)]
  const score = Math.round(Math.random() * 30 + 40) // 40-70
  counter += 1
  return {
    id: `tx_${Date.now()}_${counter}`,
    timestamp: Date.now(),
    accountId: account.id,
    accountHolder: account.holder,
    merchant: MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)],
    amount: Math.round(Math.random() * 300 + 150),
    lat: jitter(account.homeLat, 1.2),
    lng: jitter(account.homeLng, 1.2),
    homeLat: account.homeLat,
    homeLng: account.homeLng,
    riskScore: score,
    riskTier: riskTierFor(score),
    reasons: ['Amount above typical range for this account'],
    status: 'new',
  }
}

/** Generates a scripted fraud transaction: impossible travel + amount spike. */
export function generateFraudTransaction(): Transaction {
  const account = ACCOUNTS[Math.floor(Math.random() * ACCOUNTS.length)]
  counter += 1
  const farLat = jitter(40.7128, 2) // near NYC, far from any home city above
  const farLng = jitter(-74.006, 2)
  return {
    id: `tx_${Date.now()}_${counter}`,
    timestamp: Date.now(),
    accountId: account.id,
    accountHolder: account.holder,
    merchant: 'Unfamiliar Online Merchant',
    amount: Math.round(Math.random() * 800 + 400),
    lat: farLat,
    lng: farLng,
    homeLat: account.homeLat,
    homeLng: account.homeLng,
    riskScore: Math.round(Math.random() * 15 + 80),
    riskTier: 'high',
    reasons: ['Impossible travel from home location', 'Amount 6x above account average', 'Card-not-present'],
    status: 'new',
  }
}

/**
 * Starts an interval that emits clean transactions regularly and occasionally
 * injects a scripted fraud transaction. Returns a stop function.
 */
// Change these three numbers to retune the ratio of green/yellow/red cards.
// They should sum to 1 - order doesn't matter, checks run top to bottom.
const TIER_ODDS = {
  high: 0.12,
  mid: 0.28,
  low: 0.6,
}

export function useMockFeed(onTransaction: (tx: Transaction) => void, intervalMs = 2200) {
  const handle = setInterval(() => {
    const roll = Math.random()
    if (roll < TIER_ODDS.high) {
      onTransaction(generateFraudTransaction())
    } else if (roll < TIER_ODDS.high + TIER_ODDS.mid) {
      onTransaction(generateBorderlineTransaction())
    } else {
      onTransaction(generateCleanTransaction())
    }
  }, intervalMs)

  return () => clearInterval(handle)
}
