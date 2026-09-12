import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { logTechnicalError } from '../utils/logger';
import {
  TeacherProfile,
  SavedDocumentPackage,
  WeeklyTimetable,
  AgendaDayEvent,
  DocumentCategoryType,
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  
  logTechnicalError('firestore', error, { path, operationType, authInfo: errInfo.authInfo });
  throw new Error(JSON.stringify(errInfo));
}

/**
 * 1. USER PROFILE OPERATIONS (Isolated under /users/{userId})
 */
export async function saveUserProfileToFirestore(
  userId: string,
  profile: TeacherProfile
): Promise<void> {
  if (!userId) return;
  const path = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(
      userDocRef,
      {
        userId,
        teacherName: profile.teacherName || '',
        email: profile.userEmail || '',
        school: profile.school || '',
        direction: profile.direction || '',
        academy: profile.academy || '',
        level: profile.level || 'الأول',
        classGroup: profile.classGroup || '1',
        teachingMode: profile.teachingMode || 'bilingual',
        specialty: profile.specialty || 'bilingual',
        scheduleType: profile.scheduleType || 'continuous',
        areaType: profile.areaType || 'rural',
        schoolStartDate: profile.schoolStartDate || '2026-09-08',
        continuousMorningDays: profile.continuousMorningDays || ['الإثنين', 'الأربعاء', 'الجمعة'],
        academicYear: profile.academicYear || '2026 - 2027',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getUserProfileFromFirestore(
  userId: string
): Promise<TeacherProfile | null> {
  if (!userId) return null;
  const path = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as TeacherProfile;
    }
    return null;
  } catch (error) {
    console.warn('Firestore fetch user profile warning:', error);
    return null;
  }
}

/**
 * 2. SAVED DOCUMENT PACKAGES (Isolated strictly under /users/{userId}/packages/{pkgId})
 */

// Helper to determine or normalize document category type
export function inferDocumentType(pkg: Partial<SavedDocumentPackage>): DocumentCategoryType {
  if (pkg.docType) return pkg.docType;
  if (pkg.dailyJournal && (pkg.arabicMap?.lessonTitle || pkg.mathMap?.lessonTitle || pkg.frenchMap?.lessonTitle)) {
    return 'daily_journal';
  }
  if (pkg.dailyJournal && !pkg.arabicMap?.lessonTitle && !pkg.mathMap?.lessonTitle && !pkg.frenchMap?.lessonTitle) {
    return 'daily_journal';
  }
  if (pkg.arabicMap?.lessonTitle || pkg.mathMap?.lessonTitle || pkg.frenchMap?.lessonTitle) {
    return 'mind_map';
  }
  return 'daily_journal';
}

// Helper to determine primary subject
export function inferDocumentSubject(pkg: Partial<SavedDocumentPackage>): string {
  if (pkg.subject) return pkg.subject;
  const subjects: string[] = [];
  if (pkg.arabicMap?.lessonTitle) subjects.push('اللغة العربية');
  if (pkg.mathMap?.lessonTitle) subjects.push('الرياضيات');
  if (pkg.frenchMap?.lessonTitle) subjects.push('Français');
  if (subjects.length > 1) return 'متعدد التخصصات';
  if (subjects.length === 1) return subjects[0];
  return 'عام / تحضير يومي';
}

export async function saveDocumentPackageToFirestore(
  userId: string,
  pkg: SavedDocumentPackage
): Promise<void> {
  if (!userId || !pkg.id) return;
  const path = `users/${userId}/packages/${pkg.id}`;
  try {
    const pkgDocRef = doc(db, 'users', userId, 'packages', pkg.id);
    const docType = inferDocumentType(pkg);
    const subject = inferDocumentSubject(pkg);
    const level = pkg.level || pkg.teacherProfile?.level || pkg.arabicMap?.level || pkg.mathMap?.level || pkg.frenchMap?.level || 'المستوى الابتدائي';
    const unitOrLesson = pkg.unitOrLesson || pkg.arabicMap?.lessonTitle || pkg.mathMap?.lessonTitle || pkg.frenchMap?.lessonTitle || '';

    const payload: SavedDocumentPackage = {
      ...pkg,
      userId,
      docType,
      subject,
      level,
      unitOrLesson,
      updatedAt: new Date().toISOString(),
      createdAt: pkg.createdAt || new Date().toISOString(),
    };

    await setDoc(pkgDocRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getUserDocumentPackagesFromFirestore(
  userId: string
): Promise<SavedDocumentPackage[]> {
  if (!userId) return [];
  const path = `users/${userId}/packages`;
  try {
    const pkgsColRef = collection(db, 'users', userId, 'packages');
    const q = query(pkgsColRef);
    const snap = await getDocs(q);
    const results: SavedDocumentPackage[] = [];
    snap.forEach((d) => {
      const data = d.data() as SavedDocumentPackage;
      results.push({
        ...data,
        id: d.id,
        docType: inferDocumentType(data),
        subject: inferDocumentSubject(data),
      });
    });
    // Sort descending by updatedAt or createdAt
    return results.sort((a, b) => {
      const timeA = a.updatedAt || a.createdAt || '';
      const timeB = b.updatedAt || b.createdAt || '';
      return timeB.localeCompare(timeA);
    });
  } catch (error) {
    console.warn('Firestore fetch packages warning:', error);
    return [];
  }
}

export async function getDocumentPackageByIdFromFirestore(
  userId: string,
  packageId: string
): Promise<SavedDocumentPackage | null> {
  if (!userId || !packageId) return null;
  const path = `users/${userId}/packages/${packageId}`;
  try {
    const pkgDocRef = doc(db, 'users', userId, 'packages', packageId);
    const snap = await getDoc(pkgDocRef);
    if (snap.exists()) {
      const data = snap.data() as SavedDocumentPackage;
      return {
        ...data,
        id: snap.id,
        docType: inferDocumentType(data),
        subject: inferDocumentSubject(data),
      };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function deleteDocumentPackageFromFirestore(
  userId: string,
  packageId: string
): Promise<void> {
  if (!userId || !packageId) return;
  const path = `users/${userId}/packages/${packageId}`;
  try {
    const pkgDocRef = doc(db, 'users', userId, 'packages', packageId);
    await deleteDoc(pkgDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function duplicateDocumentPackageInFirestore(
  userId: string,
  pkg: SavedDocumentPackage
): Promise<SavedDocumentPackage> {
  const timestamp = Date.now();
  const newId = `pkg-copy-${timestamp}`;
  const duplicatedPkg: SavedDocumentPackage = {
    ...pkg,
    id: newId,
    userId,
    title: `نسخة من: ${pkg.title}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await saveDocumentPackageToFirestore(userId, duplicatedPkg);
  return duplicatedPkg;
}

/**
 * 3. TIMETABLE DATA (Isolated under /users/{userId}/timetable/weekly)
 */
export async function saveTimetableToFirestore(
  userId: string,
  timetable: WeeklyTimetable
): Promise<void> {
  if (!userId) return;
  const path = `users/${userId}/timetable/weekly`;
  try {
    const timetableDocRef = doc(db, 'users', userId, 'timetable', 'weekly');
    await setDoc(
      timetableDocRef,
      {
        userId,
        ...timetable,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getTimetableFromFirestore(
  userId: string
): Promise<WeeklyTimetable | null> {
  if (!userId) return null;
  const path = `users/${userId}/timetable/weekly`;
  try {
    const timetableDocRef = doc(db, 'users', userId, 'timetable', 'weekly');
    const snap = await getDoc(timetableDocRef);
    if (snap.exists()) {
      return snap.data() as WeeklyTimetable;
    }
    return null;
  } catch (error) {
    console.warn('Firestore fetch timetable warning:', error);
    return null;
  }
}

/**
 * 4. ACADEMIC AGENDA & EVENTS (Isolated under /users/{userId}/agenda/events)
 */
export async function saveAgendaToFirestore(
  userId: string,
  events: AgendaDayEvent[]
): Promise<void> {
  if (!userId) return;
  const path = `users/${userId}/agenda/events`;
  try {
    const agendaDocRef = doc(db, 'users', userId, 'agenda', 'events');
    await setDoc(
      agendaDocRef,
      {
        userId,
        events: events || [],
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getAgendaFromFirestore(
  userId: string
): Promise<AgendaDayEvent[] | null> {
  if (!userId) return null;
  const path = `users/${userId}/agenda/events`;
  try {
    const agendaDocRef = doc(db, 'users', userId, 'agenda', 'events');
    const snap = await getDoc(agendaDocRef);
    if (snap.exists()) {
      const data = snap.data();
      return (data.events as AgendaDayEvent[]) || [];
    }
    return null;
  } catch (error) {
    console.warn('Firestore fetch agenda warning:', error);
    return null;
  }
}

/**
 * 5. FULL ACCOUNT & DATA DELETION (Purge all Firestore user records)
 */
export async function deleteAllUserDataFromFirestore(userId: string): Promise<void> {
  if (!userId) return;
  
  try {
    // 1. Delete all packages in subcollection
    const pkgsColRef = collection(db, 'users', userId, 'packages');
    const pkgsSnap = await getDocs(query(pkgsColRef));
    const deletePkgPromises = pkgsSnap.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletePkgPromises);

    // 2. Delete timetable
    const timetableDocRef = doc(db, 'users', userId, 'timetable', 'weekly');
    await deleteDoc(timetableDocRef).catch(() => {});

    // 3. Delete agenda
    const agendaDocRef = doc(db, 'users', userId, 'agenda', 'events');
    await deleteDoc(agendaDocRef).catch(() => {});

    // 4. Delete user root profile doc
    const userDocRef = doc(db, 'users', userId);
    await deleteDoc(userDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
  }
}


