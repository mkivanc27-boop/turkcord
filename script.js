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

/* ================= FIREBASE CONFIG ================= */

const firebaseConfig = {
  apiKey: "AIzaSyC98wxJQk8yNZFdE-OJ1Tlpy1ANuaRUT14",
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

    // Hesap yoksa otomatik oluştur
    if (error.code === "auth/user-not-found") {
      await createUserWithEmailAndPassword(auth, email, password);
    }

    console.log(error.message);
  }
};


/* ================= NICKNAME KAYDET ================= */

window.saveNickname = async () => {

  const user = auth.currentUser;
  const nickname = document.getElementById("nicknameInput").value;

  if (!nickname) {
    alert("Nickname boş olamaz");
    return;
  }

  const userRef = doc(db, "users", user.uid);

  await setDoc(userRef, {
    nickname: nickname
  }, { merge: true });

  document.querySelector(".nickname-box").style.display = "none";
  document.querySelector(".user-panel").style.display = "block";

  document.getElementById("user").innerText =
    "Welcome " + nickname + " 💜";
};


/* ================= USER CONTROL ================= */

onAuthStateChanged(auth, async (user) => {

  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  // Eğer kullanıcı Firestore’da yoksa oluştur
  if (!snap.exists()) {

    await setDoc(userRef, {
      email: user.email,
      balance: 1000,
      vip: false,
      role: "user",
      createdAt: new Date()
    });

  }

  const data = (await getDoc(userRef)).data();

  // Nickname yoksa nickname ekranını göster
  if (!data.nickname) {

    document.querySelector(".login-box").style.display = "none";
    document.querySelector(".nickname-box").style.display = "flex";

  } else {

    document.querySelector(".login-box").style.display = "none";
    document.querySelector(".nickname-box").style.display = "none";
    document.querySelector(".user-panel").style.display = "block";

    document.getElementById("user").innerText =
      "Welcome " + data.nickname + " 💜";
  }

});
window.toggleSettings = () => {

  const dropdown = document.querySelector(".dropdown");

  if (dropdown.style.display === "none") {
    dropdown.style.display = "flex";
  } else {
    dropdown.style.display = "none";
  }
};
window.logout = async () => {
  await auth.signOut();
  location.reload();
};
window.changeNickname = async () => {

  const user = auth.currentUser;
  const newNick = document.getElementById("newNickname").value;

  if (!newNick) return alert("Nickname boş olamaz");

  const userRef = doc(db, "users", user.uid);

  await setDoc(userRef, {
    nickname: newNick
  }, { merge: true });

  alert("Nickname updated 🔥");
};
