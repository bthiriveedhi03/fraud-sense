const geminiProvider = require('./geminiProvider');

const SOURCE = process.env.DATA_SOURCE || 'gemini';

const providers = {
  gemini: geminiProvider,
};

if (!providers[SOURCE]) {
  throw new Error(`Unknown DATA_SOURCE "${SOURCE}".`);
}

console.log(`[dataProvider] Using "${SOURCE}" as the data source.`);

module.exports = providers[SOURCE];