const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const schema = fs.readFileSync('./database/schema.sql', 'utf8');

pool.query(schema)
  .then(() => {
    console.log('Schema updated successfully');
    pool.end();
  })
  .catch(err => {
    console.error('Error:', err.message);
    pool.end();
  });
