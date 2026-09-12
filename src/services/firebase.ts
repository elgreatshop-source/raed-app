import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  deleteUser,
  reauthenticateWithPopup,
  User,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length
  ? initializeApp({
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId,
    })
  : getApp();

export const auth = getAuth(app);

// Enable local persistence
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('Persistence setup warning:', err);
});

// Configure Google Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Initialize Firestore with configured databaseId
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Connection test
export async function testFirebaseConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network is waiting.');
    }
  }
}

// Google Sign-In
export async function loginWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    // If popup closed or blocked, throw human friendly error
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('تم إغلاق نافذة تسجيل الدخول قبل إتمام العملية.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('تم حظر النافذة المنبثقة من قبل المتصفح. يرجى السماح بالنوافذ المنبثقة.');
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error('النطاق الحالي غير مدرج في قائمة النطاقات المصرح بها في Firebase.');
    }
    throw error;
  }
}

// Email & Password Sign-In
export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
}

// Quick / Email Registration
export async function registerWithEmail(email: string, pass: string, fullName: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  if (fullName) {
    await updateProfile(result.user, { displayName: fullName });
  }
  return result.user;
}

// Sign Out
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Delete Firebase Auth User Account (with re-authentication if required)
export async function deleteCurrentUserAccount(): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('لا يوجد مستخدم مسجل حالياً لحذف حسابه.');
  }

  try {
    await deleteUser(user);
  } catch (error: any) {
    if (error?.code === 'auth/requires-recent-login') {
      // Prompt user to re-authenticate with Google Provider
      try {
        await reauthenticateWithPopup(user, googleProvider);
        await deleteUser(user);
      } catch (reauthErr: any) {
        console.error('Reauthentication failed:', reauthErr);
        throw new Error('يتطلب حذف الحساب إعادة تسجيل الدخول لتأكيد هويتك كإجراء أمني.');
      }
    } else {
      throw error;
    }
  }
}

// Auth State Listener
export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
