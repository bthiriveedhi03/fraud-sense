const {
  Connection,
  Keypair,
  Transaction,
  TransactionInstruction,
  PublicKey,
  clusterApiUrl,
  sendAndConfirmTransaction,
} = require('@solana/web3.js');

// The public Memo Program - writing to it just stamps arbitrary text
// permanently onto a devnet transaction, which is all we need for a
// tamper-evident audit trail.
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

function loadPayer() {
  if (!process.env.SOLANA_SECRET_KEY) return null;
  const secret = Uint8Array.from(JSON.parse(process.env.SOLANA_SECRET_KEY));
  return Keypair.fromSecretKey(secret);
}

const payer = loadPayer();

async function writeAuditMemo(memoText) {
  if (!payer) throw new Error('SOLANA_SECRET_KEY not configured');

  const instruction = new TransactionInstruction({
    keys: [{ pubkey: payer.publicKey, isSigner: true, isWritable: true }],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memoText, 'utf-8'),
  });

  const tx = new Transaction().add(instruction);
  return sendAndConfirmTransaction(connection, tx, [payer]);
}

module.exports = { writeAuditMemo };