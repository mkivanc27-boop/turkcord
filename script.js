import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
getAuth,
signInWithEmailAndPassword,
createUserWithEmailAndPassword,
GoogleAuthProvider,
signInWithPopup,
onAuthStateChanged,
signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {
getFirestore,
doc,
getDoc,
setDoc,
increment
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/* ===== API ===== */

const firebaseConfig = {
apiKey:"AIzaSyC98wxJQk8yNZFdE-OJ1Tlpy1ANuaRUT14",
authDomain:"turkcord-47b24.firebaseapp.com",
projectId:"turkcord-47b24",
storageBucket:"turkcord-47b24.firebasestorage.app",
messagingSenderId:"474688300925",
appId:"1:474688300925:web:9204e4e86c719538438e14"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ================= LOGIN ================= */

window.googleLogin = async()=>{
const provider=new GoogleAuthProvider();
await signInWithPopup(auth,provider);
};

window.emailLogin = async()=>{
const email=document.getElementById("email").value;
const pass=document.getElementById("password").value;

try{
await signInWithEmailAndPassword(auth,email,pass);
}catch{
await createUserWithEmailAndPassword(auth,email,pass);
}
};

/* ================= AUTH ================= */

onAuthStateChanged(auth,async(user)=>{

if(!user) return;

const ref=doc(db,"users",user.uid);
const snap=await getDoc(ref);

if(!snap.exists()){
await setDoc(ref,{
username:"",
usernameLocked:false,
balance:1000,
petInventory:[]
});
}

const data=(await getDoc(ref)).data();

document.querySelector(".login-box").style.display="none";
document.querySelector(".user-panel").style.display="flex";

document.getElementById("welcome").innerText=
"Welcome "+data.username;

document.getElementById("balance").innerText=
"Balance: "+data.balance;

loadPets();

/* ADMIN CHECK */

const adminSnap=await getDoc(doc(db,"settings","admins"));
const admins=adminSnap.data()?.admins||[];

if(admins.includes(user.uid)){
document.querySelector(".admin-panel").style.display="block";
}

});

/* ================= USERNAME ================= */

window.saveUsername=async()=>{

const user=auth.currentUser;
const username=document.getElementById("usernameInput").value;

const ref=doc(db,"users",user.uid);
const snap=await getDoc(ref);
const data=snap.data();

if(data.usernameLocked){
alert("Username locked!");
return;
}

await setDoc(ref,{
username:username,
usernameLocked:true
},{merge:true});

location.reload();
};

/* ================= GAMBLE ================= */

window.spinWheel=async()=>{

const bet=parseInt(document.getElementById("betAmount").value);
const user=auth.currentUser;
const ref=doc(db,"users",user.uid);
const snap=await getDoc(ref);
const data=snap.data();

if(data.balance < bet){
alert("Not enough balance");
return;
}

const outcomes=[-bet,bet*2,0,bet*-1,"JACKPOT"];

const result=outcomes[Math.floor(Math.random()*outcomes.length)];

if(result==="JACKPOT"){
await setDoc(ref,{
balance:data.balance + bet*10
},{merge:true});

document.getElementById("wheelResult").innerText="🔥 JACKPOT!";
}
else{
await setDoc(ref,{
balance:increment(result)
},{merge:true});

document.getElementById("wheelResult").innerText="Result: "+result;
}

};

/* ================= SHOP ================= */

window.openShop=()=>{
document.getElementById("shopModal").style.display="flex";
};

window.closeShop=()=>{
document.getElementById("shopModal").style.display="none";
};

window.buyPet=async(name,price,rarity)=>{

if(rarity==="event"){
alert("Event pet not purchasable");
return;
}

const user=auth.currentUser;
const ref=doc(db,"users",user.uid);
const snap=await getDoc(ref);
const data=snap.data();

if(data.balance < price){
alert("Not enough money");
return;
}

let pets=data.petInventory||[];

pets.push({
id:Date.now(),
name:name,
rarity:rarity,
level:1
});

await setDoc(ref,{
balance:data.balance-price,
petInventory:pets
},{merge:true});

loadPets();
};

/* ================= EVENT PET ================= */

window.addEventPet=async()=>{

const name=document.getElementById("eventPetName").value;

const user=auth.currentUser;
const adminSnap=await getDoc(doc(db,"settings","admins"));
const admins=adminSnap.data()?.admins||[];

if(!admins.includes(user.uid)){
alert("Not admin");
return;
}

const ref=doc(db,"users",user.uid);
const snap=await getDoc(ref);
let pets=snap.data().petInventory||[];

pets.push({
id:Date.now(),
name:name,
rarity:"event",
level:1
});

await setDoc(ref,{
petInventory:pets
},{merge:true});

loadPets();
};

/* ================= LOAD PETS ================= */

async function loadPets(){

const user=auth.currentUser;
const ref=doc(db,"users",user.uid);
const snap=await getDoc(ref);
const data=snap.data();

const container=document.getElementById("petInventory");
container.innerHTML="";

(data.petInventory||[]).forEach(p=>{

const div=document.createElement("div");
div.className="pet-card "+p.rarity;

div.innerHTML=`
<strong>${p.name}</strong>
<br>
<span class="${p.rarity}">${p.rarity}</span>
<br>
Level:${p.level}
`;

container.appendChild(div);

});

}

/* ================= FUSE ================= */

window.fusePet=async()=>{

const name=document.getElementById("fuseName").value;

const user=auth.currentUser;
const ref=doc(db,"users",user.uid);
const snap=await getDoc(ref);
let pets=snap.data().petInventory||[];

let same=pets.filter(p=>p.name===name && p.level===1);

if(same.length<3){
alert("Need 3 level1 pets");
return;
}

let removed=0;
pets=pets.filter(p=>{
if(p.name===name && p.level===1 && removed<3){
removed++;
return false;
}
return true;
});

pets.push({
id:Date.now(),
name:name,
rarity:"upgraded",
level:2
});

await setDoc(ref,{petInventory:pets},{merge:true});

loadPets();
};

/* ================= SETTINGS ================= */

window.logout=async()=>{
await signOut(auth);
location.reload();
};
