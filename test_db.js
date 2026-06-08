const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:akbIDKbAlBvjBedQHghuNJmwucnDpuTd@acela.proxy.rlwy.net:57122/railway' });
client.connect().then(async () => {
  const res = await client.query('SELECT * FROM "Transactions"');
  console.log(res.rows);
  client.end();
});
