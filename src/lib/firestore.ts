import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'

// ── Types ──────────────────────────────────────────────────────────────────────

/** Ein Teilnehmer in einem Rosenraum. */
export interface Participant {
  /** Anzeigename — optional, kann leer bleiben. */
  name?: string
  /** Zeitpunkt des Beitritts. */
  joinedAt: Timestamp
  /** Ob Rosenberg-Modus aktiv ist. */
  rosenbergMode: boolean
}

/** Eine Chat-Nachricht. */
export interface Message {
  id: string
  /** ID des Senders (aus localStorage). */
  senderId: string
  /** Ursprünglicher Text — nur für den Sender sichtbar. */
  originalText: string
  /** GFK-reformulierter Text — null wenn kein KI-Vorschlag. */
  rosenbergText?: string
  /** Welche Version gesendet wurde. */
  sentVersion: 'original' | 'rosenberg'
  /** Firestore-Timestamp. */
  timestamp: Timestamp
  /** Ob Lern-Dots angezeigt werden sollen (nur für Sender). */
  hasLearningDots: boolean
}

/** Ein Raum (Firestore-Daten ohne ID). */
export interface Room {
  createdAt: Timestamp
  roomName?: string
  /** 6-stelliger alphanumerischer Einladungscode. */
  inviteCode: string
  /** SHA-256 Hash des optionalen Raum-PINs. */
  pin?: string
}

// ── Hilfsfunktionen ─────────────────────────────────────────────────────────

/**
 * Generiert einen zufälligen 6-stelligen alphanumerischen Einladungscode.
 *
 * @returns 6-stelliger Code in Großbuchstaben
 * @example
 * generateInviteCode() // → 'K3XM7R'
 */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

/**
 * Berechnet den SHA-256 Hash eines Strings.
 * Wird für optionale Raum-PINs verwendet.
 *
 * @param text - Der zu hashende Text
 * @returns Hex-String des SHA-256 Hashes
 */
async function sha256(text: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Holt oder generiert die participantId aus localStorage für einen Raum.
 *
 * @param roomId - Die Firestore-Dokument-ID des Raums
 * @returns Die participantId aus localStorage oder eine neue UUID
 */
export function getOrCreateParticipantId(roomId: string): string {
  const key = `rosenraum_pid_${roomId}`
  const existing = localStorage.getItem(key)
  if (existing) return existing
  const newId = crypto.randomUUID()
  localStorage.setItem(key, newId)
  return newId
}

/**
 * Löscht die participantId aus localStorage für einen Raum.
 *
 * @param roomId - Die Firestore-Dokument-ID des Raums
 */
export function clearParticipantId(roomId: string): void {
  localStorage.removeItem(`rosenraum_pid_${roomId}`)
}

// ── Raum-Operationen ─────────────────────────────────────────────────────────

/**
 * Erstellt einen neuen Raum und trägt den Ersteller als ersten Participant ein.
 *
 * @param options - Optionale Konfiguration
 * @param options.roomName - Optionaler Raumname
 * @param options.participantName - Optionaler Name des Erstellers
 * @param options.pin - Optionaler PIN (4–6 Stellen)
 * @returns Raum-ID und participantId
 * @example
 * const { roomId, participantId } = await createRoom({ roomName: 'Unser Raum', pin: '1234' })
 */
export async function createRoom(options: {
  roomName?: string
  participantName?: string
  pin?: string
}): Promise<{ roomId: string; participantId: string; inviteCode: string }> {
  const inviteCode = generateInviteCode()
  const pinHash = options.pin ? await sha256(options.pin) : undefined

  const roomRef = await addDoc(collection(db, 'rooms'), {
    createdAt: serverTimestamp(),
    roomName: options.roomName || null,
    inviteCode,
    ...(pinHash ? { pin: pinHash } : {}),
  })

  const participantId = crypto.randomUUID()
  localStorage.setItem(`rosenraum_pid_${roomRef.id}`, participantId)

  await setDoc(doc(db, 'rooms', roomRef.id, 'participants', participantId), {
    name: options.participantName || null,
    joinedAt: serverTimestamp(),
    rosenbergMode: false,
  })

  return { roomId: roomRef.id, participantId, inviteCode }
}

/**
 * Tritt einem bestehenden Raum bei. Prüft die maximale Teilnehmerzahl (2) und den PIN.
 *
 * @param roomId - Die Firestore-Dokument-ID des Raums
 * @param options - Beitrittsoptionen
 * @param options.participantName - Optionaler Name des Beitretenden
 * @param options.pin - PIN falls der Raum geschützt ist
 * @returns participantId oder Fehler
 * @example
 * const result = await joinRoom('abc123', { participantName: 'Lena', pin: '1234' })
 */
export async function joinRoom(
  roomId: string,
  options: { participantName?: string; pin?: string }
): Promise<{ participantId: string } | { error: 'room_not_found' | 'room_full' | 'wrong_pin' }> {
  const roomDoc = await getDoc(doc(db, 'rooms', roomId))
  if (!roomDoc.exists()) return { error: 'room_not_found' }

  const roomData = roomDoc.data() as Room

  // PIN prüfen
  if (roomData.pin) {
    if (!options.pin) return { error: 'wrong_pin' }
    const inputHash = await sha256(options.pin)
    if (inputHash !== roomData.pin) return { error: 'wrong_pin' }
  }

  // Bestehende participantId aus localStorage
  const existingId = localStorage.getItem(`rosenraum_pid_${roomId}`)
  if (existingId) {
    const existingDoc = await getDoc(doc(db, 'rooms', roomId, 'participants', existingId))
    if (existingDoc.exists()) return { participantId: existingId }
  }

  // Teilnehmeranzahl prüfen
  const { getDocs } = await import('firebase/firestore')
  const participantsSnap = await getDocs(collection(db, 'rooms', roomId, 'participants'))
  if (participantsSnap.size >= 2) return { error: 'room_full' }

  // Neuen Participant erstellen
  const participantId = crypto.randomUUID()
  localStorage.setItem(`rosenraum_pid_${roomId}`, participantId)

  await setDoc(doc(db, 'rooms', roomId, 'participants', participantId), {
    name: options.participantName || null,
    joinedAt: serverTimestamp(),
    rosenbergMode: false,
  })

  return { participantId }
}

/**
 * Lädt einen Raum anhand seines 6-stelligen Einladungscodes.
 *
 * @param code - 6-stelliger alphanumerischer Code
 * @returns Raum-ID oder null
 * @example
 * const roomId = await getRoomByCode('K3XM7R')
 */
export async function getRoomByCode(code: string): Promise<string | null> {
  const { getDocs, where } = await import('firebase/firestore')
  const q = query(collection(db, 'rooms'), where('inviteCode', '==', code.toUpperCase()))
  const snap = await getDocs(q)
  if (snap.empty) return null
  return snap.docs[0].id
}

/**
 * Lädt Raum-Metadaten.
 *
 * @param roomId - Firestore-Dokument-ID
 * @returns Room-Objekt oder null
 */
export async function getRoom(roomId: string): Promise<(Room & { id: string }) | null> {
  const snap = await getDoc(doc(db, 'rooms', roomId))
  if (!snap.exists()) return null
  return { id: snap.id, ...(snap.data() as Room) }
}

// ── Nachrichten ──────────────────────────────────────────────────────────────

/**
 * Sendet eine Nachricht in einen Raum.
 *
 * @param roomId - Firestore-Dokument-ID des Raums
 * @param message - Nachrichteninhalte
 * @param message.senderId - ID des Senders
 * @param message.originalText - Ursprünglicher Nachrichtentext
 * @param message.rosenbergText - Optionale GFK-Version
 * @param message.sentVersion - Welche Version gesendet wird
 * @param message.hasLearningDots - Ob Lern-Dots angezeigt werden sollen
 * @returns ID der erstellten Nachricht
 * @example
 * const msgId = await sendMessage('room123', {
 *   senderId: 'pid123',
 *   originalText: 'Ich bin frustriert',
 *   sentVersion: 'original',
 *   hasLearningDots: false,
 * })
 */
export async function sendMessage(
  roomId: string,
  message: {
    senderId: string
    originalText: string
    rosenbergText?: string
    sentVersion: 'original' | 'rosenberg'
    hasLearningDots: boolean
  }
): Promise<string> {
  const ref = await addDoc(collection(db, 'rooms', roomId, 'messages'), {
    ...message,
    timestamp: serverTimestamp(),
  })
  return ref.id
}

/**
 * Abonniert den Nachrichten-Stream eines Raums in Echtzeit.
 *
 * @param roomId - Firestore-Dokument-ID des Raums
 * @param onMessages - Callback der bei jeder Änderung aufgerufen wird
 * @returns Unsubscribe-Funktion
 * @example
 * const unsub = subscribeToMessages('room123', msgs => setMessages(msgs))
 * // Später: unsub()
 */
export function subscribeToMessages(
  roomId: string,
  onMessages: (messages: Message[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'rooms', roomId, 'messages'),
    orderBy('timestamp', 'asc')
  )
  return onSnapshot(q, snapshot => {
    const messages: Message[] = snapshot.docs.map(d => ({
      id: d.id,
      ...(d.data() as Omit<Message, 'id'>),
    }))
    onMessages(messages)
  })
}

/**
 * Abonniert die Participants eines Raums in Echtzeit.
 *
 * @param roomId - Firestore-Dokument-ID des Raums
 * @param onParticipants - Callback bei Änderungen
 * @returns Unsubscribe-Funktion
 */
export function subscribeToParticipants(
  roomId: string,
  onParticipants: (participants: Record<string, Participant>) => void
): Unsubscribe {
  return onSnapshot(collection(db, 'rooms', roomId, 'participants'), snapshot => {
    const result: Record<string, Participant> = {}
    snapshot.docs.forEach(d => {
      result[d.id] = d.data() as Participant
    })
    onParticipants(result)
  })
}

/**
 * Aktualisiert den Rosenberg-Modus eines Participants.
 *
 * @param roomId - Firestore-Dokument-ID des Raums
 * @param participantId - ID des Participants
 * @param enabled - Ob Rosenberg-Modus aktiv sein soll
 */
export async function updateRosenbergMode(
  roomId: string,
  participantId: string,
  enabled: boolean
): Promise<void> {
  const { updateDoc } = await import('firebase/firestore')
  await updateDoc(doc(db, 'rooms', roomId, 'participants', participantId), {
    rosenbergMode: enabled,
  })
}
