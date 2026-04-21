import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyAGPZCVsd9KCMiwtxBhy4tvFTTLsqSn2Fo",
  authDomain: "rewear-e0247.firebaseapp.com",
  projectId: "rewear-e0247",
  storageBucket: "rewear-e0247.firebasestorage.app",
  messagingSenderId: "811263189430",
  appId: "1:811263189430:web:9f18a4c419e0faf8bfe117",
  measurementId: "G-SY56VTNYBL"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()