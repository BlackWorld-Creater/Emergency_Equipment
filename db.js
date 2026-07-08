const { Pool } = require('pg');

const createContactTableSql = `
  CREATE TABLE IF NOT EXISTS contact_submissions (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    requirement TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'website',
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

const databaseUrl = process.env.DATABASE_URL;

const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    })
  : null;

const ensureContactTable = async () => {
  if (!pool) {
    throw new Error('DATABASE_URL is not configured.');
  }

  await pool.query(createContactTableSql);
};

module.exports = {
  pool,
  ensureContactTable,
  createContactTableSql
};
