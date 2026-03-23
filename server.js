require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory sections data
let sections = [
  { id: 1, title: 'Welcome', content: 'This is the main section. Edit this content from the admin panel.' },
  { id: 2, title: 'About', content: 'Tell your story here. Update this section with your information.' },
  { id: 3, title: 'Contact', content: 'Get in touch with us. Add your contact details here.' }
];

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

function requireAuth(req, res, next) {
  if (req.session && req.session.loggedIn) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

// Auth
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    req.session.loggedIn = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/auth-check', (req, res) => {
  res.json({ loggedIn: !!(req.session && req.session.loggedIn) });
});

// Sections
app.get('/api/sections', (req, res) => {
  res.json(sections);
});

app.put('/api/sections/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const { title, content } = req.body;
  const section = sections.find(s => s.id === id);
  if (!section) return res.status(404).json({ error: 'Section not found' });
  if (title !== undefined) section.title = title;
  if (content !== undefined) section.content = content;
  res.json(section);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
