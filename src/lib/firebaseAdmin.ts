import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

/**
 * Returns a Firestore Admin instance, initializing the app on first call.
 * Lazy so Firebase Admin is not initialized at build time (env vars are runtime-only).
 *
 * @returns Firestore Admin instance
 */
export function getAdminDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  }
  return getFirestore()
}

/**
 * Returns the Firebase Admin Auth instance (initializes the app on first call).
 *
 * @returns Admin-Auth-Instanz (für verifyIdToken)
 */
export function getAdminAuth() {
  getAdminDb() // stellt App-Initialisierung sicher
  return getAuth()
}
