import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
apiKey:"API_KEYİN",
authDomain:"turkcord-47b24.firebaseapp.com",
projectId:"turkcord-47b24",
storageBucket:"turkcord-47b24.firebasestorage.app",
messagingSenderId:"474688300925",
appId:"1:474688300925:web:75d8d4c690b92c7d438e14"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser="";
let currentServer="";

/* ================= AUTH ================= */

window.register=async()=>{
await createUserWithEmailAndPassword(auth,email.value,password.value);
};

window.login=async()=>{
await signInWithEmailAndPassword(auth,email.value,password.value);
};

onAuthStateChanged(auth,(user)=>{
if(user){
currentUser=user.email;
auth.style.display="none";
appDiv.style.display="block";
loadServers();
loadFriends();
}
});

/* ================= SERVER SYSTEM ================= */

window.createServer=async()=>{
if(!serverName.value) return;

await addDoc(collection(db,"servers"),{
name:serverName.value,
owner:currentUser
});

serverName.value="";
};

function loadServers(){
onSnapshot(collection(db,"servers"),(snap)=>{
serverList.innerHTML="";
snap.forEach(doc=>{
const data=doc.data();
const div=document.createElement("div");
div.innerText=data.name;
div.onclick=()=>selectServer(doc.id,data.name);
serverList.appendChild(div);
});
});
}

function selectServer(id,name){
currentServer=id;
currentServerTitle.innerText=name;
loadMessages();
}

/* ================= CHAT ================= */

window.sendMessage=async()=>{
if(!messageInput.value) return;

await addDoc(collection(db,"servers/"+currentServer+"/messages"),{
user:currentUser,
text:messageInput.value,
time:new Date()
});

messageInput.value="";
};

function loadMessages(){
onSnapshot(collection(db,"servers/"+currentServer+"/messages"),(snap)=>{
messages.innerHTML="";
snap.forEach(doc=>{
const data=doc.data();
messages.innerHTML+=`
<div>
<b>${data.user}</b><br>
${data.text}
</div>
<hr>
`;
});
});
}

/* ================= FRIEND SYSTEM ================= */

window.addFriend=async()=>{
if(!friendEmail.value) return;

await addDoc(collection(db,"friends"),{
from:currentUser,
to:friendEmail.value
});

friendEmail.value="";
};

function loadFriends(){
onSnapshot(collection(db,"friends"),(snap)=>{
friendList.innerHTML="";
snap.forEach(doc=>{
const data=doc.data();
if(data.from===currentUser || data.to===currentUser){
friendList.innerHTML+=`
<div>${data.from} ➜ ${data.to}</div>
`;
}
});
});
}

/* ================= BOT ================= */

onSnapshot(collection(db,"servers"),(snap)=>{
snap.forEach(server=>{
onSnapshot(collection(db,"servers/"+server.id+"/messages"),(msgs)=>{
msgs.docChanges().forEach(change=>{
const data=change.doc.data();

if(data.text === "!ping"){
addDoc(collection(db,"servers/"+server.id+"/messages"),{
user:"Bot",
text:"Pong!",
time:new Date()
});
}
});
});
});
});

/* ================= VOICE ================= */

window.joinVoice=async()=>{
const stream=await navigator.mediaDevices.getUserMedia({audio:true});
alert("Voice başlatıldı (demo)");
};
