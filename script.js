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

/* ================= ADMIN UID ================= */

const admins = ["yM7VK1uxhGPb7knLVMzwhLDc3iz1"];

/* ================= PET LIST ================= */

const shopPets = [
{name:"Soul Spark",price:800,rarity:"common"},
{name:"Void Hatchling",price:1200,rarity:"common"},
{name:"Crystal Cub",price:1500,rarity:"common"},
{name:"Shadow Pup",price:2000,rarity:"common"},

{name:"Frostfang Wolf",price:5000,rarity:"rare"},
{name:"Bloodscale Drake",price:9000,rarity:"rare"},
{name:"Night Stalker",price:14000,rarity:"rare"},
{name:"Phantom Lynx",price:18000,rarity:"rare"},

{name:"Storm Titan",price:100000,rarity:"ultra"},
{name:"Thunder Seraph",price:130000,rarity:"ultra"},
{name:"Sky Beast",price:170000,rarity:"ultra"},
{name:"Infernal Griffin",price:200000,rarity:"ultra"},

{name:"Inferno Dragon",price:50000,rarity:"legendary"},
{name:"Abyss Dragon",price:75000,rarity:"legendary"},
{name:"Celestial Wyrm",price:90000,rarity:"legendary"},
{name:"Oblivion Reaper",price:120000,rarity:"legendary"},

{name:"Eclipse Phoenix",price:300000,rarity:"mythic"},
{name:"Chrono Leviathan",price:500000,rarity:"mythic"},
{name:"Omega Colossus",price:700000,rarity:"mythic"},
{name:"Starforge Hydra",price:900000,rarity:"mythic"},

{name:"Godslayer Tyrant",price:2000000,rarity:"op"},
{name:"Void Emperor",price:2500000,rarity:"op"},
{name:"Quantum Destroyer",price:3000000,rarity:"op"},
{name:"Cosmic Overlord",price:5000000,rarity:"op"}
];

/* ================= LOGIN ================= */

window.login = async()=>{
await signInWithEmailAndPassword(
auth,
document.getElementById("email").value,
document.getElementById("password").value
);
};

/* ================= AUTH ================= */

onAuthStateChanged(auth,async(user)=>{

if(!user) return; // 🔥 FIX USER NULL CRASH

const ref = doc(db,"users",user.uid);
let snap = await getDoc(ref);

if(!snap.exists()){
await setDoc(ref,{
username:"",
balance:1000,
banned:false,
petInventory:[]
});
snap = await getDoc(ref);
}

let data = snap.data();

/* ================= ADMIN CHECK FIX ================= */

if(admins.includes(user.uid)){
const adminPanel = document.querySelector(".admin-panel");
if(adminPanel){
adminPanel.style.display="block";
}
}

/* ================= USERNAME CHECK ================= */

if(data.username===""){
let name = prompt("Choose Username");
await setDoc(ref,{username:name},{merge:true});
data.username = name;
}

/* ================= BAN CHECK ================= */

if(data.banned){
alert("BANNED");
signOut(auth);
return;
}

/* ================= UI ================= */

const loginBox = document.querySelector(".login-box");
const userPanel = document.querySelector(".user-panel");

if(loginBox) loginBox.style.display="none";
if(userPanel) userPanel.style.display="block";

document.getElementById("welcome").innerText=data.username;
document.getElementById("balance").innerText=data.balance;

loadShop();
loadInventory();
loadLeaderboard();

});

/* ================= EVENT / ADMIN PET GIFT ================= */

window.giftPetToUser = async()=>{

const username = document.getElementById("giftUser").value;
const petName = document.getElementById("giftPet").value;
const rarity = document.getElementById("giftRarity").value;

if(!username || !petName) return;

const q = await getDocs(query(
collection(db,"users"),
where("username","==",username)
));

if(q.empty){
alert("User not found");
return;
}

const userDoc = q.docs[0];
let pets = userDoc.data().petInventory || [];

/* PET OBJECT */

let newPet = {
id: Date.now(),
name: petName,
rarity: rarity,
level: 1,
effect: rarity === "event" ? "EVENT BOOST" : null,
luck: 20,
profitBoost: 0.2
};

/* EVENT POWER */

if(rarity === "event"){
newPet.luck = 200;
newPet.profitBoost = 2;
}

pets.push(newPet);

await setDoc(doc(db,"users",userDoc.id),{
petInventory: pets
},{merge:true});

alert("Pet Given Successfully");

};

window.showSection = (id)=>{

document.querySelectorAll(".box").forEach(box=>{
box.style.display="none";
});

const section = document.getElementById(id);
if(section) section.style.display="block";

};
