// ================= FIREBASE IMPORTS =================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


// ================= FIREBASE CONFIG =================

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
const auth = getAuth(app);


// ================= GLOBAL VARIABLES =================

let currentUser = "";
let currentServer = "";
let currentChannel = "";


// ================= AUTH SYSTEM =================

window.register = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Kayıt başarılı ✅");
  } catch (error) {
    alert(error.message);
  }
};

window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert(error.message);
  }
};


// ================= AUTH LISTENER =================

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user.email;

    document.getElementById("auth").style.display = "none";
    document.getElementById("chat").style.display = "flex";

    loadServers();
  } else {
    document.getElementById("auth").style.display = "flex";
    document.getElementById("chat").style.display = "none";
  }
});


// ================= MESSAGES =================

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

onSnapshot(collection(db, "messages"), (snapshot) => {
  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML = "";

  snapshot.forEach((doc) => {
    const data = doc.data();

    if (
      data.serverId === currentServer &&
      data.channelId === currentChannel
    ) {
      const div = document.createElement("div");
      div.classList.add("message");

      div.innerHTML = `
        <strong>${data.user}</strong>
        <div>${data.text}</div>
      `;

      messagesDiv.appendChild(div);
    }
  });

  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});


// ================= SERVERS =================

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


// ================= CHANNELS =================

async function loadChannels(serverId) {
  const querySnapshot = await getDocs(collection(db, "channels"));

  querySnapshot.forEach((doc) => {
    const data = doc.data();

    if (data.serverId === serverId) {
      currentChannel = doc.id;
      document.getElementById("channelName").innerText =
        "# " + data.name;
    }
  });
}
