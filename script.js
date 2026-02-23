// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC98wxJQk8yNZFdE-OJ1Tlpy1ANuaRUT14",
  authDomain: "turkcord-47b24.firebaseapp.com",
  projectId: "turkcord-47b24",
  storageBucket: "turkcord-47b24.firebasestorage.app",
  messagingSenderId: "474688300925",
  appId: "1:474688300925:web:75d8d4c690b92c7d438e14"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentUser = "";
let currentServer = "";
let currentChannel = "";

// LOGIN
window.login = function () {
  const username = document.getElementById("username").value;
  if (!username) return;

  currentUser = username;
  document.getElementById("login").style.display = "none";
  document.getElementById("chat").style.display = "flex";

  loadServers();
};

// MESAJ GÖNDER
window.sendMessage = async function () {
  const input = document.getElementById("messageInput");
  if (!input.value.trim()) return;
  if (!currentServer || !currentChannel) return;

  await addDoc(collection(db, "messages"), {
    user: currentUser,
    text: input.value,
    serverId: currentServer,
    channelId: currentChannel,
    time: new Date()
  });

  input.value = "";
};

// MESAJLARI DİNLE
onSnapshot(collection(db, "messages"), (snapshot) => {
  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML = "";

  snapshot.forEach((doc) => {
    const data = doc.data();

    if (data.serverId === currentServer && data.channelId === currentChannel) {
      const div = document.createElement("div");
      div.classList.add("message");
      div.innerHTML = `
        <strong>${data.user}</strong>
        <div>${data.text}</div>
      `;
      messagesDiv.appendChild(div);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  });
});

// SERVERS YÜKLE
async function loadServers() {
  const querySnapshot = await getDocs(collection(db, "servers"));
  const serverList = document.getElementById("serverList");
  serverList.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const div = document.createElement("div");
    div.textContent = data.name;
    div.onclick = () => selectServer(doc.id);
    serverList.appendChild(div);
  });
}

function selectServer(serverId) {
  currentServer = serverId;
  loadChannels(serverId);
}

// CHANNELS YÜKLE
async function loadChannels(serverId) {
  const querySnapshot = await getDocs(collection(db, "channels"));

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.serverId === serverId) {
      currentChannel = doc.id;
      document.getElementById("channelName").innerText = "# " + data.name;
    }
  });
}
