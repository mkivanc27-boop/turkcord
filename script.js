import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, GoogleAuthProvider, signInWithRedirect } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
apiKey: "AIzaSyC98wxJQk8yNZFdE-OJ1Tlpy1ANuaRUT14",
authDomain: "turkcord-47b24.firebaseapp.com",
projectId: "turkcord-47b24",
storageBucket: "turkcord-47b24.firebasestorage.app",
messagingSenderId: "474688300925",
appId: "1:474688300925:web:75d8d4c690b92c7d438e14"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = "";

/* ===== EMAIL REGISTER ===== */

window.register = async()=>{
const email=document.getElementById("email").value;
const pass=document.getElementById("password").value;

await createUserWithEmailAndPassword(auth,email,pass);
};

/* ===== EMAIL LOGIN ===== */

window.login = async()=>{
const email=document.getElementById("email").value;
const pass=document.getElementById("password").value;

await signInWithEmailAndPassword(auth,email,pass);
};

/* ===== GOOGLE LOGIN ===== */

window.googleLogin = async()=>{
const provider = new GoogleAuthProvider();
await signInWithRedirect(auth, provider);
};

/* ===== AUTH STATE ===== */

onAuthStateChanged(auth,(user)=>{
if(user){
currentUser = user.email;
document.getElementById("auth").style.display="none";
document.getElementById("app").style.display="flex";
}
});

/* ===== SEND MESSAGE ===== */

window.sendMessage = async()=>{
const input=document.getElementById("messageInput");
if(!input.value.trim()) return;

await addDoc(collection(db,"messages"),{
user:currentUser,
text:input.value,
time:new Date()
});

input.value="";
};

/* ===== LOAD MESSAGES ===== */

onSnapshot(collection(db,"messages"),(snap)=>{
const div=document.getElementById("messages");
div.innerHTML="";

snap.forEach(doc=>{
const data=doc.data();
const msg=document.createElement("div");
msg.classList.add("message");
msg.innerHTML=`<b>${data.user}</b><br>${data.text}`;
div.appendChild(msg);
});
});
