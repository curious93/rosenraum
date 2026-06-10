/**
 * Setzt den Site-Zugangscode in Firestore (`config/site`).
 * Nutzung: node scripts/seed-site-pin.mjs <PIN>
 * Liest FIREBASE_ADMIN_* und SITE_LOCK_SECRET aus .env.local.
 * Erhöht pinVersion (invalidiert alle bestehenden Zugangs-Cookies).
 */
import { createHash } from 'crypto'
import { readFileSync } from 'fs'
import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const pin = process.argv[2]
if (!pin) {
  console.error('Nutzung: node scripts/seed-site-pin.mjs <PIN>')
  process.exit(1)
}

const env = {}
for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const i = line.indexOf('=')
  if (i > 0) env[line.slice(0, i)] = line.slice(i + 1).replace(/^"|"$/g, '')
}
if (!env.SITE_LOCK_SECRET) {
  console.error('SITE_LOCK_SECRET fehlt in .env.local')
  process.exit(1)
}

initializeApp({
  credential: cert({
    projectId: env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
})

const db = getFirestore()
const ref = db.doc('config/site')
const current = (await ref.get()).data()
const pinVersion = (current?.pinVersion ?? 0) + 1
const pinHash = createHash('sha256')
  .update(pin + env.SITE_LOCK_SECRET)
  .digest('hex')
await ref.set({ pinHash, pinVersion }, { merge: true })
console.log(`config/site gesetzt — pinVersion ${pinVersion}`)
