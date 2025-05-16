const { Client } = require('pg');
require('dotenv').config();

async function setupDatabase() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'postgres' // Connect to default database first
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Create database if it doesn't exist
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'usdc_locator') THEN
          CREATE DATABASE usdc_locator;
        END IF;
      END $$;
    `);
    console.log('Database created or already exists');

    // Connect to the new database
    await client.end();
    const dbClient = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'password',
      database: 'usdc_locator'
    });

    await dbClient.connect();
    console.log('Connected to usdc_locator database');

    // Create extensions
    await dbClient.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    console.log('Extensions created');

    await dbClient.end();
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase(); 