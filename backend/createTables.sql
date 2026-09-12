CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  street_number TEXT,
  street_name TEXT,
  city TEXT,
  state TEXT,
  zip TEXT
);

CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id),
  type TEXT NOT NULL,
  nickname TEXT,
  rewards INTEGER DEFAULT 0,
  balance NUMERIC NOT NULL,
  account_number TEXT
);

CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  account_id TEXT REFERENCES accounts(id),
  merchant_id TEXT,
  merchant_name TEXT,
  medium TEXT,
  purchase_date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT,
  description TEXT
);