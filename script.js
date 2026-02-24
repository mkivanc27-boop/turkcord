import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


// 🔥 BURAYA KENDİ FIREBASE BİLGİLERİNİ KOY
const firebaseConfig = {
  apiKey: "BURAYA_API_KEY",
  authDomain: "turkcord-47b24.firebaseapp.com",
  projectId: "turkcord-47b24",
  storageBucket: "turkcord-47b24.appspot.com",
  messagingSenderId: "474688300925",
  appId: "1:474688300925:web:9204e4e86c719538438e14"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


/* ================= LOGIN ================= */

window.googleLogin = async () => {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
};


window.emailLogin = async () => {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {

    await signInWithEmailAndPassword(auth, email, password);

  } catch (error) {

    if (error.code === "auth/user-not-found") {

      await createUserWithEmailAndPassword(auth, email, password);

    }

    console.log(error.message);
  }
};


/* ========== FIRESTORE USER CREATE ========== */

onAuthStateChanged(auth, async (user) => {

  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {

    await setDoc(userRef, {
      email: user.email,
      username: user.email,
      balance: 1000,
      vip: false,
      role: "user",
      createdAt: new Date()
    });

  }

  document.getElementById("user").innerText =
    "Logged in: " + user.email;
});
