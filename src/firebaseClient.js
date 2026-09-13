import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

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

// オフライン対応:データを端末内にも保存しておき、
// 電波がないときは最後に読み込んだ内容を表示する。
// 電波が戻ると、その間の編集も自動で送信される。
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
