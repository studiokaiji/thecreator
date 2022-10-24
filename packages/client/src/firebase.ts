import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
export const db = getFirestore();

export default app;
