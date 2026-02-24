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

/* ADMIN UID */

const admins = ["yM7VK1uxhGPb7knLVMzwhLDc3iz1"];

/* ================= TOGGLE ================= */

window.toggleAuth = () => {

const username = document.getElementById("username");
const registerBtn = document.getElementById("registerBtn");

if(username.style.display === "none"){
username.style.display = "block";
registerBtn.style.display = "inline-block";
}else{
username.style.display = "none";
registerBtn.style.display = "none";
}

};

/* ================= LOGIN ================= */

window.login = async () => {

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

if(!email || !password){
alert("Email ve password gir!");
return;
}

try{
await signInWithEmailAndPassword(auth,email,password);
}catch(err){
alert(err.message);
}

};

/* ================= REGISTER ================= */

window.register = async () => {

const username = document.getElementById("username").value;
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

if(!username || !email || !password){
alert("Tum alanlari doldur");
return;
}

try{

const userCred = await createUserWithEmailAndPassword(auth,email,password);

await setDoc(doc(db,"users",userCred.user.uid),{
username: username,
balance:1000,
banned:false,
petInventory:[]
});

alert("Hesap oluşturuldu");

}catch(err){
alert(err.message);
}

};

/* ================= AUTH ================= */

onAuthStateChanged(auth,async(user)=>{

if(!user) return;

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

/* ADMIN */

if(admins.includes(user.uid)){
const adminPanel = document.querySelector(".admin-panel");
if(adminPanel){
adminPanel.style.display="block";
}
}

/* USERNAME CHECK */

if(data.username===""){
let name = prompt("Choose Username");
await setDoc(ref,{username:name},{merge:true});
data.username = name;
}

/* BAN */

if(data.banned){
alert("BANNED");
signOut(auth);
return;
}

/* UI */

const loginBox = document.querySelector(".login-box");
const userPanel = document.querySelector(".user-panel");

if(loginBox) loginBox.style.display="none";
if(userPanel) userPanel.style.display="block";

document.getElementById("welcome").innerText=data.username;
document.getElementById("balance").innerText=data.balance;

/* ESKİ SİSTEMLERİN */

loadShop?.();
loadInventory?.();
loadLeaderboard?.();

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

let newPet = {
id: Date.now(),
name: petName,
rarity: rarity,
level:1,
effect: rarity==="event" ? "EVENT BOOST" : null,
luck:20,
profitBoost:0.2
};

if(rarity==="event"){
newPet.luck = 200;
newPet.profitBoost = 2;
}

pets.push(newPet);

await setDoc(doc(db,"users",userDoc.id),{
petInventory:pets
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
