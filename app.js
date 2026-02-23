import { auth, db } from "./firebase.js";
import {
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
signOut,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
collection,
addDoc,
onSnapshot,
doc,
updateDoc,
setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let currentUser=null;
let currentServer=null;
let currentChannel=null;

/* ================= AUTH ================= */

window.register = async()=>{
await createUserWithEmailAndPassword(auth,email.value,password.value);
};

window.login = async()=>{
await signInWithEmailAndPassword(auth,email.value,password.value);
};

window.logout = async()=>{
await signOut(auth);
};

onAuthStateChanged(auth,(user)=>{
if(user){
currentUser=user.uid;
authDiv.style.display="none";
appDiv.style.display="flex";
loadServers();
}
});

/* ================= SERVER ================= */

window.createServer = async()=>{
await addDoc(collection(db,"servers"),{
name:serverName.value,
owner:currentUser,
members:[currentUser]
});
};

/* Load Servers */

function loadServers(){
onSnapshot(collection(db,"servers"),snap=>{
serverList.innerHTML="";
snap.forEach(docSnap=>{
const data=docSnap.data();

if(data.members.includes(currentUser)){

const div=document.createElement("div");
div.innerText=data.name;
div.onclick=()=>openServer(docSnap.id);
serverList.appendChild(div);

}
});
});
}

async function openServer(serverId){
currentServer=serverId;
loadChannels();
}

/* ================= CHANNEL ================= */

window.createChannel = async()=>{
await addDoc(collection(db,"channels"),{
serverId:currentServer,
name:channelName.value
});
};

function loadChannels(){
onSnapshot(collection(db,"channels"),snap=>{
channelList.innerHTML="";
snap.forEach(docSnap=>{
const data=docSnap.data();
if(data.serverId===currentServer){
const div=document.createElement("div");
div.innerText=data.name;
div.onclick=()=>openChannel(docSnap.id);
channelList.appendChild(div);
}
});
});
}

function openChannel(channelId){
currentChannel=channelId;
loadMessages();
}

/* ================= CHAT ================= */

window.sendMessage = async()=>{
await addDoc(collection(db,"messages"),{
channelId:currentChannel,
user:currentUser,
text:messageInput.value,
time:Date.now()
});
messageInput.value="";
};

function loadMessages(){
onSnapshot(collection(db,"messages"),snap=>{
messages.innerHTML="";
snap.forEach(docSnap=>{
const data=docSnap.data();
if(data.channelId===currentChannel){
const div=document.createElement("div");
div.className="msg";
div.innerText=data.user+": "+data.text;
messages.appendChild(div);
}
});
});
}
