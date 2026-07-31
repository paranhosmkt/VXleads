import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0914985094",
  appId: "1:239443020505:web:1e21020dea0711496f8cc8",
  apiKey: "AIzaSyDDLpIvt2mxiVdka_KEeLfyKnKJm9VHz5E",
  authDomain: "gen-lang-client-0914985094.firebaseapp.com",
  storageBucket: "gen-lang-client-0914985094.firebasestorage.app",
  messagingSenderId: "239443020505",
  measurementId: ""
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-vxleads-3f221bd2-d7b1-412f-8b8b-acc20b7d9c88");
