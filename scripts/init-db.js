require('dotenv').config();

const { ensureContactTable, pool } = require('../db');

const init = async () => {
  try {
    await ensureContactTable();
    console.log('Database ready: contact_submissions table exists.');
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    process.exitCode = 1;
  } finally {
    if (pool) await pool.end();
  }
};

init();
