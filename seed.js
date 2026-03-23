// Firestore 초기 데이터 시딩 스크립트 — 한 번만 실행하세요
require('dotenv').config();
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

const db = admin.firestore();

const initialSections = [
  { id: 1, title: 'Welcome', content: 'This is the main section. Edit this content from the admin panel.' },
  { id: 2, title: 'About', content: 'Tell your story here. Update this section with your information.' },
  { id: 3, title: 'Contact', content: 'Get in touch with us. Add your contact details here.' },
];

async function seed() {
  for (const section of initialSections) {
    await db.collection('sections').doc(String(section.id)).set(section);
    console.log(`Seeded section ${section.id}: "${section.title}"`);
  }
  console.log('\nSeeding complete! You can now delete this file.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
