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
increment,
onSnapshot
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/* FIREBASE */

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
catch{
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
username:null,
balance:1000,
xp:0,
level:1,
role:"user"
});
}

const data=(await getDoc(ref)).data();

/* Username yoksa */
if(!data.username){
document.querySelector(".login-box").style.display="none";
document.querySelector(".username-box").style.display="flex";
return;
}

/* UI Aç */
document.querySelector(".login-box").style.display="none";
document.querySelector(".username-box").style.display="none";
document.querySelector(".user-panel").style.display="flex";

document.getElementById("welcome").innerText="Welcome "+data.username;
document.getElementById("balance").innerText="Balance: "+data.balance;
document.getElementById("level").innerText="Level: "+data.level;

/* Balance realtime */
onSnapshot(ref,(snap)=>{
const d=snap.data();
document.getElementById("balance").innerText="Balance: "+d.balance;
});

/* Admin kontrol */
const adminSnap=await getDoc(doc(db,"settings","admins"));
const admins=adminSnap.data()?.admins||[];

if(admins.includes(user.uid)){
document.querySelector(".admin-panel").style.display="block";
}

});

/* USERNAME */

window.saveUsername=async()=>{

const user=auth.currentUser;
const username=document.getElementById("usernameInput").value;

if(username.length<8||username.length>16){
alert("8-16 chars");
return;
}

const regex=/^[a-zA-Z0-9]+$/;
if(!regex.test(username)){
alert("Only letters & numbers");
return;
}

const q=query(collection(db,"users"),where("username","==",username));
const snap=await getDocs(q);

if(!snap.empty){
alert("Username taken");
return;
}

await setDoc(doc(db,"users",user.uid),{
username:username
},{merge:true});

location.reload();
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

window.changeUsername=async()=>{
const user=auth.currentUser;
const newUsername=document.getElementById("newUsername").value;

await setDoc(doc(db,"users",user.uid),{
username:newUsername
},{merge:true});

location.reload();
};

/* DUEL */

window.startDuel=async()=>{

const opponentUsername=document.getElementById("duelOpponent").value;
const bet=parseInt(document.getElementById("duelBet").value);
const mode=document.getElementById("gameMode").value;

const user=auth.currentUser;

const q=query(collection(db,"users"),where("username","==",opponentUsername));
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
gameMode:mode,
status:"pending"
});

alert("Duel sent 🔥");
};

/* SOLO */

window.playCrash=()=>alert("Crash Game Started 🎰");
window.playDice=()=>alert("Dice Game 🎲");
