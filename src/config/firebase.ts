// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAj4Nm1jvydLdZfD2HGB6yKZhsL9XsJiR8',
  authDomain: 'readreceipts-a3fd8.firebaseapp.com',
  projectId: 'readreceipts-a3fd8',
  storageBucket: 'readreceipts-a3fd8.firebasestorage.app',
  messagingSenderId: '608709464644',
  appId: '1:608709464644:web:21d98e6b9ce38d66d96211',
  measurementId: 'G-7RHX2YWSL5'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage (for receipt images)
const storage = getStorage(app);

export { auth, db, storage };
export default app;
