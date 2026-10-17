// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAj4Nm1jvydLdZfD2HGB6yKZhsL9XsJiR8',
  authDomain: 'readreceipts-a3fd8.firebaseapp.com',
  projectId: 'readreceipts-a3fd8',
  storageBucket: 'readreceipts-a3fd8.firebasestorage.app',
  appId: '1:608709464644:web:21d98e6b9ce38d66d96211',
  measurementId: 'G-7RHX2YWSL5'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export default app;