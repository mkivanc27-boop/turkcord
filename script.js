import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
getAuth,
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
increment,
collection,
getDocs,
query,
where
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

const admins = ["yM7VK1uxhGPb7knLVMzwhLDc3iz1"];

/* ================= PET LIST ================= */

const petList = [
/* COMMON */
{name:"Soul Spark",rarity:"common"},
{name:"Void Hatchling",rarity:"common"},
{name:"Crystal Cub",rarity:"common"},
{name:"Shadow Pup",rarity:"common"},

/* RARE */
{name:"Frostfang Wolf",rarity:"rare"},
{name:"Bloodscale Drake",rarity:"rare"},
{name:"Night Stalker",rarity:"rare"},
{name:"Phantom Lynx",rarity:"rare"},

/* ULTRA */
{name:"Storm Titan",rarity:"ultra"},
{name:"Thunder Seraph",rarity:"ultra"},
{name:"Sky Beast",rarity:"ultra"},
{name:"Infernal Griffin",rarity:"ultra"},

/* LEGENDARY */
{name:"Inferno Dragon",rarity:"legendary"},
{name:"Abyss Dragon",rarity:"legendary"},
{name:"Celestial Wyrm",rarity:"legendary"},
{name:"Oblivion Reaper",rarity:"legendary"},

/* MYTHIC */
{name:"Eclipse Phoenix",rarity:"mythic"},
{name:"Chrono Leviathan",rarity:"mythic"},
{name:"Omega Colossus",rarity:"mythic"},
{name:"Starforge Hydra",rarity:"mythic"},

/* OP */
{name:"Godslayer Tyrant",rarity:"op"},
{name:"Void Emperor",rarity:"op"},
{name:"Quantum Destroyer",rarity:"op"},
{name:"Cosmic Overlord",rarity:"op"},

/* 🔥 EVENT PETLERİ 🔥 */
{name:"Halloween Reaper",rarity:"event"},
{name:"Christmas Seraph",rarity:"event"},
{name:"Dark Eclipse Titan",rarity:"event"},
{name:"Anniversary Overlord",rarity:"event"}
];

/* ================= TOGGLE LOGIN ================= */

window.toggleAuth = ()=>{
const u=document.getElementById("username");
const r=document.getElementById("registerBtn");
u.style.display = u.style.display==="none"?"block":"none";
r.style.display = r.style.display==="none"?"inline-block":"none";
};

/* ================= LOGIN ================= */

window.login = async ()=>{
await signInWithEmailAndPassword(
auth,
document.getElementById("email").value,
document.getElementById("password").value
);
};

/* ================= REGISTER ================= */

window.register = async ()=>{
const username=document.getElementById("username").value;
const email=document.getElementById("email").value;
const password=document.getElementById("password").value;

const userCred = await createUserWithEmailAndPassword(auth,email,password);

await setDoc(doc(db,"users",userCred.user.uid),{
username:username,
balance:1000,
petInventory:[],
banned:false
});
};

/* ================= AUTH ================= */

onAuthStateChanged(auth,async(user)=>{
if(!user) return;

const ref=doc(db,"users",user.uid);
const snap=await getDoc(ref);
const data=snap.data();

document.querySelector(".login-box").style.display="none";
document.querySelector(".user-panel").style.display="block";

if(admins.includes(user.uid)){
document.querySelector(".admin-panel").style.display="block";
}

document.getElementById("welcome").innerText=data.username;
document.getElementById("balance").innerText=data.balance;

loadInventory();
loadLeaderboard();
});

/* ================= INVENTORY ================= */

async function loadInventory(){
const user=auth.currentUser;
const snap=await getDoc(doc(db,"users",user.uid));
const data=snap.data();

const inv=document.getElementById("inventory");
inv.innerHTML="";

(data.petInventory||[]).forEach(p=>{
inv.innerHTML+=`
<div style="border:1px solid white;margin:5px;padding:5px">
<h4>${p.name}</h4>
<p>Rarity: ${p.rarity}</p>
</div>
`;
});
}

/* ================= ADMIN PET GIFT ================= */

window.giftPetToUser = async ()=>{
const username=document.getElementById("giftUser").value;
const petName=document.getElementById("giftPet").value;

const q=await getDocs(query(
collection(db,"users"),
where("username","==",username)
));

if(q.empty) return alert("User not found");

const petData = petList.find(p=>p.name===petName);
if(!petData) return alert("Pet not found");

let pets=q.docs[0].data().petInventory||[];

pets.push({
id:Date.now(),
name:petData.name,
rarity:petData.rarity,
level:1
});

await setDoc(doc(db,"users",q.docs[0].id),{
petInventory:pets
},{merge:true});

alert("Pet Given");
};

/* ================= LEADERBOARD ================= */

async function loadLeaderboard(){
const q=await getDocs(collection(db,"users"));
let arr=[];
q.forEach(d=>arr.push(d.data()));
arr.sort((a,b)=>b.balance-a.balance);

const lb=document.getElementById("leaderboard");
lb.innerHTML="";
arr.slice(0,10).forEach(p=>{
lb.innerHTML+=`<p>${p.username} - ${p.balance}</p>`;
});
}

/* ================= GAME ================= */

window.playGame = async ()=>{
const user=auth.currentUser;
await setDoc(doc(db,"users",user.uid),{
balance:increment(100)
},{merge:true});
};

/* ================= SETTINGS ================= */

window.toggleSettings = ()=>{
const s=document.getElementById("settings");
s.style.display=s.style.display==="block"?"none":"block";
};

window.showSection = (id)=>{
document.querySelectorAll(".box").forEach(b=>b.style.display="none");
document.getElementById(id).style.display="block";
};

/* ================= MONEY GIVE ================= */

window.giveMoney = async ()=>{
const username=document.getElementById("giveUser").value;
const amount=Number(document.getElementById("giveAmount").value);

const q=await getDocs(query(
collection(db,"users"),
where("username","==",username)
));

if(q.empty) return alert("User not found");

await setDoc(doc(db,"users",q.docs[0].id),{
balance:increment(amount)
},{merge:true});
};
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function loadLeaderboard(){
const q=query(collection(db,"users"),orderBy("money","desc"));
const snap=await getDocs(q);

const list=document.getElementById("leaderList");
list.innerHTML="";

let rank=1;

snap.forEach(docSnap=>{
const d=docSnap.data();

list.innerHTML+=`
<div class="rank">
${rank}. ${d.username} — $${d.money}
</div>
`;

rank++;
});
}

function showSection(id){
["inventory","leaderboard","games","settings"].forEach(sec=>{
document.getElementById(sec).classList.add("hidden");
});
document.getElementById(id).classList.remove("hidden");

if(id==="leaderboard") loadLeaderboard();
}
window.login = login;
window.register = register;
window.toggleAuth = toggleAuth;
window.showSection = showSection;
window.toggleSettings = toggleSettings;
window.playGame = playGame;
