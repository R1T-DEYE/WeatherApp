// db.js (ESM)
import 'dotenv/config';
import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: +(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,        // should be 'admin1'
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: { minVersion: 'TLSv1.2' },
  waitForConnections: true,
  connectionLimit: 10,
});


/**
 * Create required tables if they don't exist.
 * - searches: logs city lookups
 * - weather_cache: stores last API response to reduce calls
 */
export async function initDb() {
  const createSearches = `
    CREATE TABLE IF NOT EXISTS searches (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      city VARCHAR(120) NOT NULL,
      ip VARCHAR(45) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createCache = `
    CREATE TABLE IF NOT EXISTS weather_cache (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      city VARCHAR(120) NOT NULL,
      data_json JSON NOT NULL,
      fetched_at TIMESTAMP NOT NULL,
      INDEX idx_city (city)
    );
  `;

  await pool.query(createSearches);
  await pool.query(createCache);
  console.log('✅ DB ready');
}
