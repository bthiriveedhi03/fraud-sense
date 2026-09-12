require('dotenv').config();
const provider = require('./dataProvider');

async function main() {
  const [customer] = await provider.getCustomers(1);
  console.log('Customer:', customer.first_name, customer.last_name);

  const accounts = await provider.getAccountsForCustomer(customer._id);
  console.log('Accounts:', JSON.stringify(accounts, null, 2));

  const purchases = await provider.getPurchasesForAccount(accounts[0]._id, 5);
  console.log('Purchases (sample of 5):', JSON.stringify(purchases, null, 2));
}

main();