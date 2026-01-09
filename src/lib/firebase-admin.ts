// src/lib/firebase-admin.ts
'use server';
import admin from 'firebase-admin';

// Inicializa o Admin SDK uma única vez
if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0921435570',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      databaseURL: `https://${serviceAccount.projectId}.firebaseio.com`,
    });
    console.log('Firebase Admin SDK inicializado com sucesso.');
  } catch (error: any) {
    console.error("Erro ao inicializar Firebase Admin SDK:", error.message);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
