import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, GoogleAuthProvider, signInWithRedirect } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
apiKey: "BURAYA_OWN_API_KEY",
authDomain: "turkcord-47b24.firebaseapp.com",
projectId: "turkcord-47b24",
storageBucket: "turkcord-47b24.firebasestorage.app",
messagingSenderId: "474688300925",
appId: "1:474688300925:web:75d8d4c690b92c7d438e14"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser="";

/* AUTH */

window.register = async()=>{
const email=document.getElementById("email").value;
const pass=document.getElementById("password").value;
await createUserWithEmailAndPassword(auth,email,pass);
};

window.login = async()=>{
const email=document.getElementById("email").value;
const pass=document.getElementById("password").value;
await signInWithEmailAndPassword(auth,email,pass);
};

window.googleLogin = async()=>{
const provider = new GoogleAuthProvider();
await signInWithRedirect(auth, provider);
};

onAuthStateChanged(auth,(user)=>{
if(user){
currentUser=user.email;
document.getElementById("auth").style.display="none";
document.getElementById("app").style.display="block";
}
});

/* CHAT */

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

onSnapshot(collection(db,"messages"),(snap)=>{
const div=document.getElementById("messages");
div.innerHTML="";
snap.forEach(doc=>{
const data=doc.data();
const msg=document.createElement("div");
msg.innerHTML = `<b>${data.user}</b><br>${data.text}`;
div.appendChild(msg);
});
});
