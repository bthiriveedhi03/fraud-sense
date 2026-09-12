require('dotenv').config();
const { Pool } = require('pg');

const STATE_COORDS = {
  AL:[32.8,-86.8],AK:[64.2,-149.5],AZ:[34.2,-111.9],AR:[34.9,-92.4],CA:[36.8,-119.4],
  CO:[39.0,-105.5],CT:[41.6,-72.7],DE:[39.0,-75.5],FL:[27.8,-81.7],GA:[32.6,-83.4],
  HI:[20.8,-156.3],ID:[44.2,-114.5],IL:[40.0,-89.2],IN:[39.8,-86.3],IA:[42.0,-93.5],
  KS:[38.5,-98.0],KY:[37.8,-84.6],LA:[31.2,-92.0],ME:[45.4,-69.2],MD:[39.0,-76.7],
  MA:[42.3,-71.5],MI:[43.3,-84.5],MN:[46.4,-94.6],MS:[32.7,-89.6],MO:[38.5,-92.5],
  MT:[47.0,-109.6],NE:[41.5,-99.7],NV:[38.8,-116.4],NH:[43.7,-71.5],NJ:[40.1,-74.7],
  NM:[34.5,-106.0],NY:[42.9,-75.5],NC:[35.6,-79.4],ND:[47.5,-99.8],OH:[40.4,-82.9],
  OK:[35.5,-97.5],OR:[44.0,-120.5],PA:[40.9,-77.6],RI:[41.7,-71.5],SC:[33.9,-80.9],
  SD:[44.4,-100.2],TN:[35.9,-86.4],TX:[31.5,-99.3],UT:[39.3,-111.7],VT:[44.0,-72.7],
  VA:[37.5,-78.6],WA:[47.4,-121.5],WV:[38.6,-80.6],WI:[44.6,-89.9],WY:[43.0,-107.5],
};

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function main() {
  const customers = await pool.query('SELECT id, state FROM customers');
  for (const c of customers.rows) {
    const coords = STATE_COORDS[c.state] || [39.8, -98.5];
    const jitter = () => (Math.random() - 0.5) * 0.8;
    const lat = coords[0] + jitter();
    const lng = coords[1] + jitter();
    await pool.query('UPDATE customers SET home_lat = $1, home_lng = $2 WHERE id = $3', [lat, lng, c.id]);
  }
  console.log(`Assigned home locations to ${customers.rows.length} customers.`);
  await pool.end();
}

main();
