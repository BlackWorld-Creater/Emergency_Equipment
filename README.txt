Emergency Equipment Sales & Service Website

Files:
- index.html
- styles.css
- script.js
- server.js
- db.js
- scripts/init-db.js

How to use locally:
1. Run npm install.
2. Keep the Neon connection string in .env as DATABASE_URL.
3. Run npm run init-db to create the contact_submissions table.
4. Run npm start.
5. Open http://127.0.0.1:4173.

Important:
- The contact form needs the Node backend. Do not deploy only index.html/styles.css/script.js to plain static hosting if you want database submissions.
- Use a Node-capable host such as Render, Railway, Fly.io, a VPS, or another platform that can run server.js.
- Replace the dummy phone number and email in index.html.

Google Maps location is integrated using:
26.4068597, 80.3580899
