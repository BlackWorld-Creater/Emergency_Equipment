# Emergency Equipment Sales & Service

Static website plus Node/Express backend for the Neon-backed contact form.

## Run locally

```bash
npm install
npm run init-db
npm start
```

Open `http://127.0.0.1:4173`.

## Environment

Create `.env` from `.env.example` and set:

```bash
DATABASE_URL=your_neon_connection_string
PORT=4173
```

Do not put `DATABASE_URL` in frontend JavaScript. The browser submits to `/api/contact`, and `server.js` writes to the `contact_submissions` table.
