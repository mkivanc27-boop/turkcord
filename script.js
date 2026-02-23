import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
apiKey: "API_KEYİN",
authDomain: "turkcord-47b24.firebaseapp.com",
projectId: "turkcord-47b24",
storageBucket: "turkcord-47b24.firebasestorage.app",
messagingSenderId: "474688300925",
appId: "1:474688300925:web:75d8d4c690b92c7d438e14"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser="";
let localStream;
let peerConnection;

const servers = {
iceServers:[{ urls:"stun:stun.l.google.com:19302"}]
};

/* ================= AUTH ================= */

window.register = async()=>{
await createUserWithEmailAndPassword(auth,email.value,password.value);
};

window.login = async()=>{
await signInWithEmailAndPassword(auth,email.value,password.value);
};

onAuthStateChanged(auth,(user)=>{
if(user){
currentUser=user.email;
authDiv.style.display="none";
chat.style.display="block";
loadMessages();
}
});

/* ================= CHAT ================= */

window.sendMessage = async()=>{
if(!messageInput.value.trim()) return;

await addDoc(collection(db,"messages"),{
user:currentUser,
text:messageInput.value,
time:new Date()
});

messageInput.value="";
};

function loadMessages(){
onSnapshot(collection(db,"messages"),(snap)=>{
messages.innerHTML="";
snap.forEach(doc=>{
const data=doc.data();
messages.innerHTML+=`
<div>
<b>${data.user}</b><br>
${data.text}
</div><hr>
`;
});
});
}

/* ================= VOICE ================= */

window.joinVoice = async(room)=>{

localStream = await navigator.mediaDevices.getUserMedia({audio:true});

peerConnection = new RTCPeerConnection(servers);

localStream.getTracks().forEach(track=>{
peerConnection.addTrack(track,localStream);
});

peerConnection.ontrack = (event)=>{
const audio = document.createElement("audio");
audio.srcObject = event.streams[0];
audio.autoplay = true;
document.body.appendChild(audio);
};

peerConnection.onicecandidate = async(event=>{
if(event.candidate){
await setDoc(doc(db,"voiceRooms",room),{
candidate:event.candidate.toJSON()
});
}
});

const offer = await peerConnection.createOffer();
await peerConnection.setLocalDescription(offer);

await setDoc(doc(db,"voiceRooms",room),{
offer:offer
});
};

window.leaveVoice = ()=>{
if(localStream){
localStream.getTracks().forEach(track=>track.stop());
}
if(peerConnection){
peerConnection.close();
}
};
