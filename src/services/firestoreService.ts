import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Audit, Sector } from '../types';
import { SECTORS_DATA } from '../data/sectors';

const AUDITS_COLLECTION = 'audits';
const SECTORS_COLLECTION = 'sectors';

/**
 * Fetch all audits from Firestore
 */
export async function fetchAuditsFromCloud(): Promise<Audit[]> {
  try {
    const querySnapshot = await getDocs(collection(db, AUDITS_COLLECTION));
    const audits: Audit[] = [];
    querySnapshot.forEach((docSnap) => {
      audits.push(docSnap.data() as Audit);
    });
    return audits;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, AUDITS_COLLECTION);
  }
}

/**
 * Save or update a single audit in Firestore
 */
export async function saveAuditToCloud(audit: Audit): Promise<void> {
  const path = `${AUDITS_COLLECTION}/${audit.id}`;
  try {
    await setDoc(doc(db, AUDITS_COLLECTION, audit.id), audit, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Batch save multiple audits to cloud (e.g. initial migration or restore)
 */
export async function syncAllAuditsToCloud(audits: Audit[]): Promise<void> {
  for (const audit of audits) {
    await saveAuditToCloud(audit);
  }
}

/**
 * Delete an audit from Firestore
 */
export async function deleteAuditFromCloud(auditId: string): Promise<void> {
  const path = `${AUDITS_COLLECTION}/${auditId}`;
  try {
    await deleteDoc(doc(db, AUDITS_COLLECTION, auditId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Fetch all sectors from Firestore
 */
export async function fetchSectorsFromCloud(): Promise<Sector[]> {
  try {
    const querySnapshot = await getDocs(collection(db, SECTORS_COLLECTION));
    const sectors: Sector[] = [];
    querySnapshot.forEach((docSnap) => {
      sectors.push(docSnap.data() as Sector);
    });
    return sectors;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, SECTORS_COLLECTION);
  }
}

/**
 * Save or update a sector in Firestore
 */
export async function saveSectorToCloud(sector: Sector): Promise<void> {
  const path = `${SECTORS_COLLECTION}/${sector.id}`;
  try {
    await setDoc(doc(db, SECTORS_COLLECTION, sector.id), sector, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Batch sync all sectors to Firestore
 */
export async function syncAllSectorsToCloud(sectors: Sector[]): Promise<void> {
  for (const sector of sectors) {
    await saveSectorToCloud(sector);
  }
}

/**
 * Real-time listener for audits
 */
export function subscribeToAudits(
  onData: (audits: Audit[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, AUDITS_COLLECTION),
    (snapshot) => {
      const audits: Audit[] = [];
      snapshot.forEach((d) => audits.push(d.data() as Audit));
      onData(audits);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.GET, AUDITS_COLLECTION);
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
  );
}

/**
 * Real-time listener for sectors
 */
export function subscribeToSectors(
  onData: (sectors: Sector[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, SECTORS_COLLECTION),
    (snapshot) => {
      const sectors: Sector[] = [];
      snapshot.forEach((d) => sectors.push(d.data() as Sector));
      onData(sectors);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.GET, SECTORS_COLLECTION);
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
  );
}
