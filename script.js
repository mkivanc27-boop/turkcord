import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
getAuth,
GoogleAuthProvider,
signInWithPopup,
signInWithEmailAndPassword,
createUserWithEmailAndPassword,
onAuthStateChanged,
signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {
getFirestore,
doc,
getDoc,
setDoc,
collection,
query,
where,
getDocs,
onSnapshot,
increment
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/* ================= FIREBASE ================= */

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

/* ================= LOADING FIX ================= */

window.addEventListener("DOMContentLoaded", () => {

setTimeout(() => {

const loading = document.getElementById("loading");
const appDiv = document.getElementById("app");

if (loading) loading.style.display = "none";
if (appDiv) appDiv.style.display = "block";

}, 1200);

});

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
} catch {
await createUserWithEmailAndPassword(auth, email, password);
}

};

/* ================= AUTH SYSTEM ================= */

onAuthStateChanged(auth, async (user) => {

if (!user) {
document.querySelector(".login-box").style.display = "flex";
document.querySelector(".user-panel").style.display = "none";
return;
}

const ref = doc(db, "users", user.uid);
const snap = await getDoc(ref);

/* USER CREATE */

if (!snap.exists()) {
await setDoc(ref, {
email: user.email,
username: null,
balance: 1000,
xp: 0,
level: 1,
role: "user"
});
}

const data = (await getDoc(ref)).data();

/* USERNAME YOKSA */

if (!data.username) {
document.querySelector(".login-box").style.display = "none";
document.querySelector(".username-box").style.display = "flex";
return;
}

/* DASHBOARD AÇ */

document.querySelector(".login-box").style.display = "none";
document.querySelector(".username-box").style.display = "none";
document.querySelector(".user-panel").style.display = "flex";

document.getElementById("welcome").innerText =
"Welcome " + data.username;

document.getElementById("balance").innerText =
"Balance: " + data.balance;

document.getElementById("level").innerText =
"Level: " + data.level;

/* REALTIME BALANCE */

onSnapshot(ref, (snap) => {
const d = snap.data();
if (d) {
document.getElementById("balance").innerText =
"Balance: " + d.balance;
}
});

/* ADMIN CHECK */

const adminSnap = await getDoc(doc(db, "settings", "admins"));
const admins = adminSnap.data()?.admins || [];

if (admins.includes(user.uid)) {
document.querySelector(".admin-panel").style.display = "block";
}

});

/* ================= USERNAME ================= */

window.saveUsername = async () => {

const user = auth.currentUser;
const username = document.getElementById("usernameInput").value;

if (username.length < 8 || username.length > 16) {
alert("8-16 karakter olmalı");
return;
}

const regex = /^[a-zA-Z0-9]+$/;
if (!regex.test(username)) {
alert("Sadece harf ve sayı");
return;
}

const q = query(collection(db, "users"),
where("username", "==", username));

const snap = await getDocs(q);

if (!snap.empty) {
alert("Username zaten alınmış");
return;
}

await setDoc(doc(db, "users", user.uid), {
username: username
}, { merge: true });

location.reload();
};

/* ================= SETTINGS ================= */

window.toggleSettings = () => {
const d = document.querySelector(".dropdown");
d.style.display = d.style.display === "none" ? "block" : "none";
};

window.logout = async () => {
await signOut(auth);
location.reload();
};

window.changeUsername = async () => {

const user = auth.currentUser;
const newUsername = document.getElementById("newUsername").value;

await setDoc(doc(db, "users", user.uid), {
username: newUsername
}, { merge: true });

location.reload();
};

/* ================= DUEL ================= */

window.startDuel = async () => {

const opponentUsername =
document.getElementById("duelOpponent").value;

const bet = parseInt(document.getElementById("duelBet").value);
const mode = document.getElementById("gameMode").value;

const user = auth.currentUser;

const q = query(collection(db, "users"),
where("username", "==", opponentUsername));

const snap = await getDocs(q);

if (snap.empty) {
alert("Opponent bulunamadı");
return;
}

const opponent = snap.docs[0];

await setDoc(doc(collection(db, "duels")), {
challenger: user.uid,
opponent: opponent.id,
bet: bet,
gameMode: mode,
status: "pending",
createdAt: new Date()
});

alert("Duel gönderildi 🔥");
};

/* ================= SOLO GAMES ================= */

window.playCrash = async () => {

const user = auth.currentUser;
const ref = doc(db, "users", user.uid);

await setDoc(ref, {
xp: increment(10),
balance: increment(50),
level: increment(0)
}, { merge: true });

alert("Crash oynandı +50 balance +10 xp");
};

window.playDice = async () => {

const user = auth.currentUser;
const ref = doc(db, "users", user.uid);

const win = Math.random() > 0.5;

if (win) {
await setDoc(ref, {
balance: increment(100),
xp: increment(20)
}, { merge: true });

alert("Kazandın 🎲");
} else {
await setDoc(ref, {
balance: increment(-50)
}, { merge: true });

alert("Kaybettin 💀");
}

};
