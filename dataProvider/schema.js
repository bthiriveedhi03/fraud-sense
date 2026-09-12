const crypto = require('crypto');

function generateNessieStyleId() {
  return crypto.randomBytes(12).toString('hex');
}

const customerResponseSchema = {
  type: 'object',
  properties: {
    first_name: { type: 'string' },
    last_name: { type: 'string' },
    address: {
      type: 'object',
      properties: {
        street_number: { type: 'string' },
        street_name: { type: 'string' },
        city: { type: 'string' },
        state: { type: 'string' },
        zip: { type: 'string' },
      },
      required: ['street_number', 'street_name', 'city', 'state', 'zip'],
    },
  },
  required: ['first_name', 'last_name', 'address'],
};

const accountResponseSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['Checking', 'Savings', 'Credit Card'] },
    nickname: { type: 'string' },
    rewards: { type: 'integer' },
    balance: { type: 'number' },
    account_number: { type: 'string' },
  },
  required: ['type', 'nickname', 'rewards', 'balance', 'account_number'],
};

const purchaseResponseSchema = {
  type: 'object',
  properties: {
    merchant_id: { type: 'string' },
    merchant_name: { type: 'string' },
    medium: { type: 'string', enum: ['balance', 'rewards'] },
    purchase_date: { type: 'string', description: 'YYYY-MM-DD' },
    amount: { type: 'number' },
    status: { type: 'string', enum: ['completed', 'pending', 'cancelled'] },
    description: { type: 'string' },
  },
  required: ['merchant_id', 'merchant_name', 'medium', 'purchase_date', 'amount', 'status', 'description'],
};

module.exports = {
  generateNessieStyleId,
  customerResponseSchema,
  accountResponseSchema,
  purchaseResponseSchema,
};