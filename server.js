require('dotenv').config();
const express = require('express');
const path = require('path');
const admin = require('firebase-admin');

// ─── Firebase Admin 초기화 ────────────────────────────────────────────────────
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Vercel 환경변수에서 \n이 리터럴로 저장되므로 실제 줄바꿈으로 변환
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});
const db = admin.firestore();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Firebase Auth 인증 미들웨어 ──────────────────────────────────────────────
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    req.user = await admin.auth().verifyIdToken(authHeader.slice(7));
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
app.post('/api/logout', (_req, res) => {
  res.json({ success: true });
});

// ─── Sections ─────────────────────────────────────────────────────────────────
app.get('/api/sections', async (_req, res) => {
  try {
    const snapshot = await db.collection('sections').orderBy('id').get();
    const sections = snapshot.docs.map(doc => doc.data());
    res.json(sections);
  } catch (err) {
    console.error('GET /api/sections error:', err);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

app.put('/api/sections/:id', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, content } = req.body;
  try {
    const snapshot = await db
      .collection('sections')
      .where('id', '==', id)
      .limit(1)
      .get();
    if (snapshot.empty) {
      return res.status(404).json({ error: 'Section not found' });
    }
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    await snapshot.docs[0].ref.update(updates);
    const updated = (await snapshot.docs[0].ref.get()).data();
    res.json(updated);
  } catch (err) {
    console.error('PUT /api/sections/:id error:', err);
    res.status(500).json({ error: 'Failed to update section' });
  }
});

// ─── 로컬 개발용 ──────────────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
