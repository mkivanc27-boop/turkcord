import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
getAuth,
signInWithEmailAndPassword,
createUserWithEmailAndPassword,
GoogleAuthProvider,
signInWithPopup,
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
getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const provider = new GoogleAuthProvider();
await signInWithPopup(auth,provider);
};

window.emailLogin = async()=>{
const email = document.getElementById("email").value;
const pass = document.getElementById("password").value;

try{
await signInWithEmailAndPassword(auth,email,pass);
}catch{
await createUserWithEmailAndPassword(auth,email,pass);
}
};

/* ================= AUTH ================= */

onAuthStateChanged(auth,async(user)=>{

if(!user) return;

const ref = doc(db,"users",user.uid);
const snap = await getDoc(ref);

if(!snap.exists()){
await setDoc(ref,{
email:user.email,
username:"",
balance:1000,
xp:0,
level:1,
petInventory:[]
});
}

const data = (await getDoc(ref)).data();

document.querySelector(".login-box").style.display="none";
document.querySelector(".user-panel").style.display="flex";

document.getElementById("welcome").innerText =
"Welcome "+data.username;

document.getElementById("balance").innerText =
"Balance: "+data.balance;

loadPets();

});

/* ================= BUY PET ================= */

window.buyPet = async(name,price,rarity)=>{

const user = auth.currentUser;
const ref = doc(db,"users",user.uid);
const snap = await getDoc(ref);
const data = snap.data();

/* event lock */
if(rarity==="event"){
alert("Event pet only from event!");
return;
}

if(data.balance < price){
alert("Not enough money");
return;
}

let pets = data.petInventory || [];

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

window.buyEventPet = async()=>{

const user = auth.currentUser;
const ref = doc(db,"users",user.uid);
const snap = await getDoc(ref);
const data = snap.data();

let pets = data.petInventory || [];

/* event pet ücretsiz ama event aktif mi kontrol */
const eventSnap = await getDoc(doc(db,"events","currentEvent"));
const eventData = eventSnap.data();

if(!eventData?.active){
alert("No active event");
return;
}

pets.push({
id:Date.now(),
name:"Event Crystal Dragon",
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

const user = auth.currentUser;
const ref = doc(db,"users",user.uid);
const snap = await getDoc(ref);
const data = snap.data();

const container = document.getElementById("petInventory");
container.innerHTML="";

(data.petInventory||[]).forEach(p=>{

const div = document.createElement("div");
div.className="pet-card";

div.innerHTML=`
<strong>${p.name}</strong>
<br>
Rarity:${p.rarity}
<br>
Level:${p.level}
`;

container.appendChild(div);

});

}

/* ================= FUSE ================= */

window.fusePet = async()=>{

const name = document.getElementById("fuseName").value;

const user = auth.currentUser;
const ref = doc(db,"users",user.uid);
const snap = await getDoc(ref);
let pets = snap.data().petInventory || [];

let same = pets.filter(p=>p.name===name && p.level===1);

if(same.length < 3){
alert("Need 3 level1 pets");
return;
}

let removed=0;
pets = pets.filter(p=>{
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

/* ================= EVOLVE LEVEL3 ================= */

window.evolvePet = async()=>{

const name = document.getElementById("evolveName").value;

const user = auth.currentUser;
const ref = doc(db,"users",user.uid);
const snap = await getDoc(ref);
let pets = snap.data().petInventory || [];

let level2 = pets.filter(p=>p.name===name && p.level===2);

if(level2.length < 3){
alert("Need 3 level2 pets");
return;
}

let removed=0;
pets = pets.filter(p=>{
if(p.name===name && p.level===2 && removed<3){
removed++;
return false;
}
return true;
});

pets.push({
id:Date.now(),
name:name,
rarity:"ultimate",
level:3
});

await setDoc(ref,{petInventory:pets},{merge:true});

loadPets();
};
  
