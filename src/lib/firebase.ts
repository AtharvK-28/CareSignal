import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, addDoc, serverTimestamp, query, where, getDocs, getDoc, orderBy, limit } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logout = () => signOut(auth);

export interface UserConsent {
  allowPersonalization: boolean;
  allowResearch: boolean;
}

export const saveUserConsent = async (uid: string, consent: UserConsent) => {
  const consentRef = doc(db, 'users', uid, 'consents', 'current');
  await setDoc(consentRef, {
    ...consent,
    uid,
    updatedAt: serverTimestamp()
  });
};

export const saveTriageReport = async (uid: string, report: any, consent: UserConsent) => {
  if (consent.allowPersonalization && uid !== 'anonymous') {
    const reportRef = collection(db, 'users', uid, 'reports');
    await addDoc(reportRef, {
      ...report,
      uid,
      createdAt: serverTimestamp()
    });
  }

  if (consent.allowResearch) {
    const researchRef = collection(db, 'research_data');
    await addDoc(researchRef, {
      ...report,
      uid: 'anonymized', // Ensure anonymity
      createdAt: serverTimestamp()
    });
  }
};

export const getUserReports = async (uid: string) => {
  const reportsRef = collection(db, 'users', uid, 'reports');
  const q = query(reportsRef, orderBy('createdAt', 'desc'), limit(10));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export interface CheckInSettings {
  enabled: boolean;
  frequency: 'Standard' | 'Frequent' | 'Minimal';
  lastCheckInAt?: any;
  nextScheduledAt?: any;
}

export const saveCheckInSettings = async (uid: string, settings: CheckInSettings) => {
  const settingsRef = doc(db, 'users', uid, 'settings', 'checkins');
  await setDoc(settingsRef, {
    ...settings,
    updatedAt: serverTimestamp()
  });
};

export const getCheckInSettings = async (uid: string): Promise<CheckInSettings | null> => {
  const settingsRef = doc(db, 'users', uid, 'settings', 'checkins');
  const docSnap = await getDoc(settingsRef);
  if (docSnap.exists()) {
    return docSnap.data() as CheckInSettings;
  }
  return null;
};

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface UserProfile {
  uid: string;
  dob: string;
  location: string;
  bloodGroup: string;
  allergies: string;
  primaryCarePhysician: {
    name: string;
    contact: string;
  };
  emergencyContacts: EmergencyContact[];
}

export const saveUserProfile = async (uid: string, profile: Partial<UserProfile>) => {
  const profileRef = doc(db, 'users', uid, 'profile', 'data');
  await setDoc(profileRef, {
    ...profile,
    uid,
    updatedAt: serverTimestamp()
  }, { merge: true });
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const profileRef = doc(db, 'users', uid, 'profile', 'data');
  const profileSnap = await getDoc(profileRef);
  if (profileSnap.exists()) {
    return profileSnap.data() as UserProfile;
  }
  return null;
};
