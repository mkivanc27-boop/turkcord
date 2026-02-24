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
setDoc,
collection,
query,
where,
getDocs,
increment
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/* FIREBASE CONFIG */

const firebaseConfig = {
apiKey:"AIzaSyC98wxJQk8yNZFdE-OJ1Tlpy1ANuaRUT14",
authDomain:"turkcord-47b24.firebaseapp.com",
projectId:"turkcord-47b24",
storageBucket:"turkcord-47b24.appspot.com",
messagingSenderId:"474688300925",
appId:"1:474688300925:web:9204e4e86c719538438e14"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


/* LOGIN */

window.googleLogin = async()=>{
const provider = new GoogleAuthProvider();
await signInWithPopup(auth,provider);
};

window.emailLogin = async()=>{

const email=document.getElementById("email").value;
const password=document.getElementById("password").value;

try{
await signInWithEmailAndPassword(auth,email,password);
}
catch(e){
await createUserWithEmailAndPassword(auth,email,password);
}

};


/* USER SYSTEM */

onAuthStateChanged(auth,async(user)=>{

if(!user) return;

const ref=doc(db,"users",user.uid);
const snap=await getDoc(ref);

if(!snap.exists()){
await setDoc(ref,{
email:user.email,
balance:1000,
role:"user"
});
}

const data=(await getDoc(ref)).data();

document.querySelector(".login-box").style.display="none";
document.querySelector(".nickname-box").style.display="none";
document.querySelector(".user-panel").style.display="flex";

document.getElementById("welcome").innerText="Welcome "+(data.nickname||user.email);

document.getElementById("balance").innerText="Balance: "+data.balance;

});


/* NICKNAME */

window.saveNickname=async()=>{

const user=auth.currentUser;
const nick=document.getElementById("nicknameInput").value;

await setDoc(doc(db,"users",user.uid),{
nickname:nick
},{merge:true});

};


/* SETTINGS */

window.toggleSettings=()=>{
const d=document.querySelector(".dropdown");
d.style.display=d.style.display==="none"?"block":"none";
};

window.logout=async()=>{
await auth.signOut();
location.reload();
};

window.changeNickname=async()=>{
const user=auth.currentUser;
const newNick=document.getElementById("newNickname").value;

await setDoc(doc(db,"users",user.uid),{
nickname:newNick
},{merge:true});
};


/* DUEL (BASIC) */

window.startDuel=async()=>{

const opponentEmail=document.getElementById("duelOpponent").value;
const bet=parseInt(document.getElementById("duelBet").value);

const user=auth.currentUser;

const usersRef=collection(db,"users");
const q=query(usersRef,where("email","==",opponentEmail));
const snap=await getDocs(q);

if(snap.empty){
alert("Opponent not found");
return;
}

const opponent=snap.docs[0];

await setDoc(doc(collection(db,"duels")),{
challenger:user.uid,
opponent:opponent.id,
bet:bet,
status:"pending"
});

alert("Duel sent 🔥");

};
