const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:Bzblab0904!25@picker-user.c3gaaykgc0on.ap-northeast-2.rds.amazonaws.com:5432/picker-user';

async function testConnection() {
  const caPath = path.resolve(__dirname, '..', 'rds-ca.pem');
  console.log('CA certificate path:', caPath);

  const client = new Client({
    connectionString: connectionString,
    ssl: {
      ca: fs.readFileSync(caPath),
      rejectUnauthorized: true
    }
  });

  try {
    console.log('Attempting to connect to database...');
    console.log('Connection string:', connectionString);

    await client.connect();
    console.log('✅ Successfully connected to database!');

    const result = await client.query('SELECT NOW()');
    console.log('Current timestamp from database:', result.rows[0].now);

    const dbInfo = await client.query(`
      SELECT current_database() as database,
             current_user as user,
             version() as version
    `);
    console.log('\nDatabase Information:');
    console.log('- Database:', dbInfo.rows[0].database);
    console.log('- User:', dbInfo.rows[0].user);
    console.log('- Version:', dbInfo.rows[0].version);

    const tableCount = await client.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    console.log('- Tables in public schema:', tableCount.rows[0].count);

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
    if (error.code === 'ENOTFOUND') {
      console.error('Cannot resolve hostname. Check if the host address is correct.');
    } else if (error.code === '28P01') {
      console.error('Authentication failed. Check username and password.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused. Check if the database server is running and accessible.');
    }
  } finally {
    await client.end();
  }
}

testConnection();