require('dotenv').config();
const { Client } = require('pg');

async function testConnection() {
  console.log('Testing database connection with environment variables...\n');

  // Check if environment variables are loaded
  if (!process.env.PICKER_DATABASE_URL) {
    console.error('❌ PICKER_DATABASE_URL not found in environment variables');
    return;
  }

  if (!process.env.RDS_CA_CERT) {
    console.error('❌ RDS_CA_CERT not found in environment variables');
    return;
  }

  console.log('✓ Environment variables loaded successfully');
  console.log('✓ Database URL:', process.env.PICKER_DATABASE_URL.replace(/:[^:@]+@/, ':****@'));
  console.log('✓ CA Certificate loaded:', process.env.RDS_CA_CERT.substring(0, 50) + '...\n');

  // Remove sslmode from connection string and handle SSL separately
  const connectionString = process.env.PICKER_DATABASE_URL.replace('?sslmode=require', '');

  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false  // AWS RDS uses self-signed certificates
    }
  });

  try {
    console.log('Attempting to connect to Picker database...');
    await client.connect();
    console.log('✅ Successfully connected to Picker database!\n');

    // Get database information
    const dbInfo = await client.query(`
      SELECT current_database() as database,
             current_user as user,
             version() as version
    `);

    console.log('Database Information:');
    console.log('- Database:', dbInfo.rows[0].database);
    console.log('- User:', dbInfo.rows[0].user);
    console.log('- Version:', dbInfo.rows[0].version.split(',')[0]);

    // List tables
    const tables = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
      LIMIT 10
    `);

    console.log('\nTables in public schema:');
    if (tables.rows.length > 0) {
      tables.rows.forEach(row => {
        console.log(`  - ${row.tablename}`);
      });

      const tableCount = await client.query(`
        SELECT COUNT(*) as count
        FROM pg_tables
        WHERE schemaname = 'public'
      `);
      console.log(`\nTotal tables: ${tableCount.rows[0].count}`);
    } else {
      console.log('  No tables found in public schema');
    }

    // Test a simple query
    const testQuery = await client.query('SELECT NOW() as current_time');
    console.log('\nCurrent server time:', testQuery.rows[0].current_time);

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error details:', {
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
  } finally {
    await client.end();
    console.log('\n✓ Connection closed');
  }
}

testConnection();