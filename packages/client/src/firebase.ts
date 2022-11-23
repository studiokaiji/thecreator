import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
} from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: 'AIzaSyBQjTfZAeing_fF39k9OnrScLd8cuYdp5c',
  appId: '1:59196218519:web:f4cb0fb2d00e5dbb085dd2',
  authDomain: 'melt-thecreator.firebaseapp.com',
  messagingSenderId: '59196218519',
  projectId: 'melt-thecreator',
  storageBucket: 'melt-thecreator.appspot.com',
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth();
connectAuthEmulator(auth, import.meta.env.VITE_FIREBASE_AUTH_ENDPOINT);

initializeFirestore(app, {
  ignoreUndefinedProperties: true,
});
export const db = getFirestore(app);

connectFirestoreEmulator(
  db,
  import.meta.env.VITE_FIREBASE_FIRESTORE_HOST,
  import.meta.env.VITE_FIREBASE_FIRESTORE_PORT
);

export const functions = getFunctions();
connectFunctionsEmulator(
  functions,
  import.meta.env.VITE_FIREBASE_FUNCTIONS_HOST,
  import.meta.env.VITE_FIREBASE_FUNCTIONS_PORT
);

export default app;
