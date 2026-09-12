const { GoogleGenAI } = require('@google/genai');
const {
  generateNessieStyleId,
  customerResponseSchema,
  accountResponseSchema,
  purchaseResponseSchema,
} = require('./schema');

const MODEL = 'gemini-3.1-flash-lite';
const ai = new GoogleGenAI({});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateStructured(prompt, itemSchema, count) {
  const arraySchema = {
    type: 'array',
    items: itemSchema,
    minItems: count,
    maxItems: count,
  };

  await sleep(13000);

  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: arraySchema,
        },
      });

      const parsed = JSON.parse(response.text);
      if (Array.isArray(parsed) && parsed.length === count) return parsed;
      console.warn(`Expected ${count} items, got ${parsed.length}. Retrying...`);
    } catch (err) {
      if (err.status === 429 || err.status === 503) {
        const waitSeconds = 20;
        console.warn(`${err.status === 429 ? 'Rate limited' : 'Server busy'}. Waiting ${waitSeconds}s (attempt ${attempt})...`);
        await sleep(waitSeconds * 1000);
        continue;
      }
      console.warn(`Attempt ${attempt} failed:`, err.message);
      await sleep(5000);
    }
  }

  throw new Error('Failed to get valid structured output after retries.');
}

async function getCustomers(count) {
  const raw = await generateStructured(
    `Generate ${count} realistic, diverse fictional US bank customers. Vary names and addresses across different US states and cities. Do not use placeholder-sounding names like "John Doe."`,
    customerResponseSchema,
    count
  );
  return raw.map((c) => ({ _id: generateNessieStyleId(), ...c }));
}

async function getAccountsForCustomer(customerId, count = null) {
  const numAccounts = count ?? (Math.random() < 0.6 ? 1 : 2);
  const raw = await generateStructured(
    `Generate ${numAccounts} realistic US bank account(s) for a single customer. Use realistic balances for the account type (Savings: $500-$25,000, Checking: $100-$8,000, Credit Card: $0-$6,000 owed). account_number should look like a realistic 10-12 digit string.`,
    accountResponseSchema,
    numAccounts
  );
  return raw.map((a) => ({ _id: generateNessieStyleId(), customer_id: customerId, ...a }));
}

// Generates purchases in batches of up to 10, since larger single requests
// have proven unreliable. Same total output, just chunked internally.
async function getPurchasesForAccount(accountId, count = 40) {
  const BATCH_SIZE = 10;
  const allPurchases = [];
  let remaining = count;

  while (remaining > 0) {
    const batchCount = Math.min(BATCH_SIZE, remaining);
    const raw = await generateStructured(
      `Generate ${batchCount} realistic bank purchase transactions spread across the last 90 days for a single account. Use a realistic mix of everyday merchants (groceries, gas, streaming, restaurants, retail) with plausible amounts. Dates in YYYY-MM-DD format, spread out, not all on the same day. Nearly all status "completed."`,
      purchaseResponseSchema,
      batchCount
    );
    allPurchases.push(...raw.map((p) => ({ _id: generateNessieStyleId(), account_id: accountId, ...p })));
    remaining -= batchCount;
  }

  return allPurchases;
}

module.exports = { getCustomers, getAccountsForCustomer, getPurchasesForAccount };