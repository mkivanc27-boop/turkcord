import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
apiKey:"AIzaSyC98wxJQk8yNZFdE-OJ1Tlpy1ANuaRUT14",
authDomain:"PROJECT.firebaseapp.com",
projectId:"PROJECT",
storageBucket:"PROJECT.appspot.com",
messagingSenderId:"XXXX",
appId:"XXXX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser="";
let currentUsername="";

/* ================= AUTH ================= */

window.register = async () => {

await createUserWithEmailAndPassword(auth,email.value,password.value);

await setDoc(doc(db,"users",auth.currentUser.uid),{
username:username.value,
email:email.value,
role:"user",
online:true
});

alert("Kayıt başarılı");
};

window.login = async () => {

await signInWithEmailAndPassword(auth,email.value,password.value);

alert("Login OK");
};

window.logout = async () => {
await signOut(auth);
location.reload();
};

onAuthStateChanged(auth,(user)=>{
if(user){

currentUser=user.uid;

document.getElementById("auth").style.display="none";
document.getElementById("app").style.display="block";

loadUserData(user.uid);
}
});

async function loadUserData(uid){
const snap = await getDocs(collection(db,"users"));
snap.forEach(docSnap=>{
if(docSnap.id === uid){
currentUsername = docSnap.data().username;
}
});
}

/* ================= SERVER ================= */

window.createServer = async () => {

if(!serverName.value) return;

await addDoc(collection(db,"servers"),{
name:serverName.value,
owner:currentUser,
public:serverPublic.checked,
inviteCode:Math.random().toString(36).substring(2,8),
members:[currentUser]
});

serverName.value="";
alert("Server oluşturuldu");
};

window.searchServer = async () => {

const snap = await getDocs(collection(db,"servers"));
serverList.innerHTML="";

snap.forEach(docSnap=>{
const data = docSnap.data();

if(data.name.toLowerCase().includes(searchInput.value.toLowerCase())){

const div=document.createElement("div");
div.innerHTML = data.name + " | " + (data.public?"Public":"Private");

div.onclick=()=>alert("Invite Code: "+data.inviteCode);

serverList.appendChild(div);
}
});
};

window.joinByInvite = async () => {

const snap = await getDocs(collection(db,"servers"));

snap.forEach(async(docSnap)=>{
const data = docSnap.data();

if(data.inviteCode === inviteInput.value){

if(!data.members.includes(currentUser)){

data.members.push(currentUser);

await updateDoc(doc(db,"servers",docSnap.id),{
members:data.members
});

alert("Sunucuya katıldın");
}
}
});
};

/* ================= UI FIX ================= */

onAuthStateChanged(auth,(user)=>{
if(user){
document.getElementById("auth").style.display="none";
document.getElementById("app").style.display="block";
}
});
