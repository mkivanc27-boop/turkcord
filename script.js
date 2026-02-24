import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
getAuth,
signInWithEmailAndPassword,
onAuthStateChanged,
signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {
getFirestore,
doc,
getDoc,
setDoc,
increment,
collection,
query,
where,
getDocs,
onSnapshot
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/* FIREBASE */

const firebaseConfig = {
apiKey: "AIzaSyC98wxJQk8yNZFdE-OJ1Tlpy1ANuaRUT14",
authDomain: "turkcord-47b24.firebaseapp.com",
projectId: "turkcord-47b24",
storageBucket: "turkcord-47b24.firebasestorage.app",
messagingSenderId: "474688300925",
appId: "1:474688300925:web:9204e4e86c719538438e14"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* LOGIN */

window.login=async()=>{
await signInWithEmailAndPassword(
auth,
document.getElementById("email").value,
document.getElementById("password").value
);
};

/* AUTH */

onAuthStateChanged(auth,async(user)=>{

if(!user) return;

const ref=doc(db,"users",user.uid);
let snap=await getDoc(ref);

if(!snap.exists()){
await setDoc(ref,{
username:"",
balance:1000,
banned:false,
petInventory:[]
});
snap=await getDoc(ref);
}

let data=snap.data();

if(data.username===""){
let name=prompt("Choose Username");
await setDoc(ref,{username:name},{merge:true});
data.username=name;
}

if(data.banned){
alert("BANNED");
signOut(auth);
return;
}

document.querySelector(".login-box").style.display="none";
document.querySelector(".user-panel").style.display="block";

document.getElementById("welcome").innerText=data.username;
document.getElementById("balance").innerText=data.balance;

loadShop();
loadInventory();
loadLeaderboard();

});
