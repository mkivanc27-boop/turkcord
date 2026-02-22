// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// BURAYA KENDI FIREBASE CONFIGINI YAPISTIR
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

window.join = function () {
  const username = document.getElementById("username").value;
  if (!username) return;
  currentUser = username;
  document.getElementById("login").style.display = "none";
  document.getElementById("chat").style.display = "block";
};

window.sendMessage = async function () {
  const input = document.getElementById("messageInput");
  if (!input.value.trim()) return;

  await addDoc(collection(db, "messages"), {
    user: currentUser,
    text: input.value,
    time: new Date()
  });

  input.value = "";
};

onSnapshot(collection(db, "messages"), (snapshot) => {
  const messagesDiv = document.getElementById("messages");

  snapshot.docChanges().forEach((change) => {
    if (change.type === "added") {
      const data = change.doc.data();
      const div = document.createElement("div");
      div.classList.add("message");
      div.innerHTML = `
        <strong>${data.user}</strong>
        <span class="time">${new Date(data.time.seconds * 1000).toLocaleTimeString()}</span>
        <div>${data.text}</div>
      `;
      messagesDiv.appendChild(div);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  });
});

  snapshot.forEach((doc) => {
    const data = doc.data();
    const div = document.createElement("div");
    div.textContent = data.user + ": " + data.text;
    messagesDiv.appendChild(div);
  });
});
