import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebaseコンソールで発行された、このプロジェクト専用の設定キー
const firebaseConfig = {
  apiKey: "AIzaSyAKsQwHeXQO3zbQMPcuXVAWiJNYLKXhp0s",
  authDomain: "tabi-no-shiori-decf4.firebaseapp.com",
  projectId: "tabi-no-shiori-decf4",
  storageBucket: "tabi-no-shiori-decf4.firebasestorage.app",
  messagingSenderId: "957540536601",
  appId: "1:957540536601:web:1a5afe86a7c38d16977588",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
