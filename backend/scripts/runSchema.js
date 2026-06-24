const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runSchema() {
  try {
    console.log('Connecting to database...');
    
    // Read the schema.sql file
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing schema.sql...');
    
    // Execute the SQL
    await pool.query(schemaSQL);
    
    console.log('✅ Schema executed successfully!');
    console.log('Tables created: merchants, branches, devices, transactions');
    
  } catch (error) {
    console.error('❌ Error executing schema:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('Database connection closed.');
  }
}

runSchema();
