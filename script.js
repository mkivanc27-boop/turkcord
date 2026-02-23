import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
apiKey:"AIzaSyC98wxJQk8yNZFdE-OJ1Tlpy1ANuaRUT14",
authDomain:"turkcord-47b24.firebaseapp.com",
projectId:"turkcord-47b24",
storageBucket:"turkcord-47b24.firebasestorage.app",
messagingSenderId:"474688300925",
appId:"1:474688300925:web:75d8d4c690b92c7d438e14"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser="";

/* ================= AUTH ================= */

window.register = async()=>{
await createUserWithEmailAndPassword(auth,email.value,password.value);
};

window.login = async()=>{
await signInWithEmailAndPassword(auth,email.value,password.value);
};

window.logout = async()=>{
await signOut(auth);
location.reload();
};

onAuthStateChanged(auth,(user)=>{
if(user){
currentUser=user.email;
authDiv.style.display="none";
app.style.display="block";
}
});

/* ================= SERVER CREATE ================= */

window.createServer = async()=>{

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

/* ================= SERVER SEARCH ================= */

window.searchServer = async()=>{

const snap = await getDocs(collection(db,"servers"));

serverList.innerHTML="";

snap.forEach(docSnap=>{
const data = docSnap.data();

if(data.name.toLowerCase().includes(searchInput.value.toLowerCase())){

const div=document.createElement("div");
div.innerHTML = data.name + " | " + (data.public ? "Public":"Private");

div.onclick=()=>alert("Invite Code: "+data.inviteCode);

serverList.appendChild(div);
}
});
};

/* ================= JOIN BY INVITE ================= */

window.joinByInvite = async()=>{

const snap = await getDocs(collection(db,"servers"));

snap.forEach(async(docSnap)=>{
const data = docSnap.data();

if(data.inviteCode === inviteInput.value){

if(!data.members.includes(currentUser)){
data.members.push(currentUser);

await updateDoc(doc(db,"servers",docSnap.id),{
members:data.members
});

alert("Sunucuya katıldın!");
}
}
});
};
