import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyADW9cv20mbfTcXPpLfxcbuYmEMjmlGbwA",
  authDomain: "student-forum-d5f07.firebaseapp.com",
  projectId: "student-forum-d5f07",
  storageBucket: "student-forum-d5f07.firebasestorage.app",
  messagingSenderId: "356568027665",
  appId: "1:356568027665:web:d3ab7691b603e4e84517b0"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)
export const storage = getStorage(app)
