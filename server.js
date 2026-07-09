require('dotenv').config();

const express = require('express');
const path = require('path');
const { ensureContactTable, pool } = require('./db');

const app = express();
const port = Number(process.env.PORT || 4173);
const publicDir = __dirname;
const assetsDir = path.join(publicDir, 'assets');
const rateLimitWindowMs = 10 * 60 * 1000;
const maxRequestsPerWindow = 8;
const submissionsByIp = new Map();

app.disable('x-powered-by');
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));

const normalize = (value) => String(value || '').trim().replace(/\s+/g, ' ');

const getClientIp = (req) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.length) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.socket.remoteAddress || 'unknown';
};

const rateLimitContact = (req, res, next) => {
  const ip = getClientIp(req);
  const now = Date.now();
  const recent = (submissionsByIp.get(ip) || []).filter((time) => now - time < rateLimitWindowMs);

  if (recent.length >= maxRequestsPerWindow) {
    return res.status(429).json({
      ok: false,
      message: 'Too many enquiries were sent from this connection. Please try again after a few minutes.'
    });
  }

  recent.push(now);
  submissionsByIp.set(ip, recent);
  return next();
};

const validateContactPayload = (body) => {
  const name = normalize(body.name || body.Name);
  const mobile = normalize(body.mobile || body.Mobile);
  const requirement = normalize(body.requirement || body.Requirement);
  const website = normalize(body.website);

  if (website) {
    return { spam: true };
  }

  if (name.length < 2 || name.length > 120) {
    return { error: 'Please enter a valid name.' };
  }

  if (!/^[0-9+\-\s()]{7,30}$/.test(mobile)) {
    return { error: 'Please enter a valid mobile number.' };
  }

  if (!requirement) {
    return { error: 'Please enter your requirement.' };
  }

  if (requirement.length > 2000) {
    return { error: 'Please keep your requirement under 2000 characters.' };
  }

  return { name, mobile, requirement };
};

app.get('/api/health', async (_req, res) => {
  try {
    if (!pool) throw new Error('Database is not configured.');
    await pool.query('SELECT 1');
    res.json({ ok: true, database: 'connected' });
  } catch (error) {
    console.error('Health check failed:', error.message);
    res.status(500).json({ ok: false, database: 'unavailable' });
  }
});

app.post('/api/contact', rateLimitContact, async (req, res) => {
  const payload = validateContactPayload(req.body || {});

  if (payload.spam) {
    return res.status(200).json({
      ok: true,
      message: 'Thank you. Your enquiry has been submitted.'
    });
  }

  if (payload.error) {
    return res.status(400).json({ ok: false, message: payload.error });
  }

  try {
    if (!pool) throw new Error('Database is not configured.');

    const result = await pool.query(
      `INSERT INTO contact_submissions (name, mobile, requirement, source, user_agent)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at`,
      [
        payload.name,
        payload.mobile,
        payload.requirement,
        'website',
        req.get('user-agent') || null
      ]
    );

    return res.status(201).json({
      ok: true,
      id: result.rows[0].id,
      message: 'Thank you. Your enquiry has been saved successfully.'
    });
  } catch (error) {
    console.error('Contact submission failed:', error.message);
    return res.status(500).json({
      ok: false,
      message: 'Submission failed. Please try again or contact us directly.'
    });
  }
});

app.use('/assets', express.static(assetsDir, {
  index: false,
  maxAge: '1d'
}));

app.get('/styles.css', (_req, res) => {
  res.sendFile(path.join(publicDir, 'styles.css'));
});

app.get('/script.js', (_req, res) => {
  res.sendFile(path.join(publicDir, 'script.js'));
});

app.get('/favicon.ico', (_req, res) => {
  res.type('image/svg+xml');
  res.sendFile(path.join(assetsDir, 'favicon.png'));
});

app.get(['/', '/index.html'], (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

const startServer = async () => {
  try {
    await ensureContactTable();
    app.listen(port, () => {
      console.log(`Emergency Equipment website running at http://127.0.0.1:${port}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
