const { Firestore } = require('@google-cloud/firestore');

function getFirestore() {
  const projectId = process.env.FIREBASE_PROJECT_ID || 'demo-petcare';
  return new Firestore({ projectId });
}

module.exports = { getFirestore };


