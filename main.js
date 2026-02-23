import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updatePassword,
  deleteUser
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* 🔥 CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyC98wxJQk8yNZFdE-OJ1Tlpy1ANuaRUT14",
  authDomain: "turkcord-47b24.firebaseapp.com",
  projectId: "turkcord-47b24",
  storageBucket: "turkcord-47b24.firebasestorage.app",
  messagingSenderId: "474688300925",
  appId: "1:474688300925:web:316134db4b4cb441438e14"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* STATE */
let currentUser = null;
let currentServer = null;
let currentChannel = null;
let currentRole = "member";
let isGlobalAdmin = false;

/* AUTH */

registerBtn.onclick = async () => {
  const userCheck = await getDoc(doc(db, "usernames", username.value));
  if (userCheck.exists()) return alert("Username taken");

  const cred = await createUserWithEmailAndPassword(auth, email.value, password.value);

  await setDoc(doc(db, "users", cred.user.uid), {
    username: username.value,
    bio: "",
    avatar: "",
    online: true
  });

  await setDoc(doc(db, "usernames", username.value), {
    uid: cred.user.uid
  });
};

loginBtn.onclick = async () => {
  await signInWithEmailAndPassword(auth, email.value, password.value);
};

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const banned = await getDoc(doc(db, "globalBans", user.uid));
  if (banned.exists()) {
    alert("Globally banned.");
    signOut(auth);
    return;
  }

  currentUser = user;

  const adminCheck = await getDoc(doc(db, "globalAdmins", user.uid));
  if (adminCheck.exists()) isGlobalAdmin = true;

  authScreen.classList.add("hidden");
  appScreen.classList.remove("hidden");

  await updateDoc(doc(db, "users", user.uid), { online: true });

  loadServers();
});

/* SERVER */

createServerBtn.onclick = async () => {
  const name = prompt("Server name?");
  if (!name) return;

  const ref = await addDoc(collection(db, "servers"), {
    name,
    owner: currentUser.uid,
    members: [currentUser.uid],
    roles: {
      [currentUser.uid]: "owner"
    }
  });

  await addDoc(collection(db, "channels"), {
    serverId: ref.id,
    name: "general"
  });
};

function loadServers() {
  const q = query(collection(db, "servers"), where("members", "array-contains", currentUser.uid));

  onSnapshot(q, (snap) => {
    sidebar.innerHTML = `
      <button id="createServerBtn">+</button>
      <button id="openSettingsBtn">⚙</button>
    `;

    snap.forEach((docSnap) => {
      const div = document.createElement("div");
      div.className = "serverItem";
      div.innerText = docSnap.data().name[0];

      div.onclick = async () => {
        currentServer = docSnap.id;

        const banCheck = await getDoc(doc(db, "serverBans", currentServer + "_" + currentUser.uid));
        if (banCheck.exists()) return alert("Banned from server");

        serverName.innerText = docSnap.data().name;
        currentRole = docSnap.data().roles[currentUser.uid] || "member";

        if (currentRole === "owner" || isGlobalAdmin)
          adminPanel.style.display = "flex";

        loadChannels();
      };

      sidebar.appendChild(div);
    });
  });
}

/* CHANNEL */

createChannelBtn.onclick = async () => {
  if (currentRole !== "owner" && currentRole !== "admin" && !isGlobalAdmin)
    return alert("No permission");

  const name = prompt("Channel name?");
  if (!name) return;

  await addDoc(collection(db, "channels"), {
    serverId: currentServer,
    name
  });
};

function loadChannels() {
  const q = query(collection(db, "channels"), where("serverId", "==", currentServer));

  onSnapshot(q, (snap) => {
    channelList.innerHTML = "";

    snap.forEach((docSnap) => {
      const div = document.createElement("div");
      div.className = "channelItem";
      div.innerText = "# " + docSnap.data().name;

      div.onclick = () => {
        currentChannel = docSnap.id;
        chatHeader.innerText = docSnap.data().name;
        loadMessages();
      };

      channelList.appendChild(div);
    });
  });
}

/* MESSAGES */

sendBtn.onclick = async () => {
  if (!currentChannel) return;

  const text = messageInput.value;
  if (!text) return;

  const userDoc = await getDoc(doc(db, "users", currentUser.uid));

  await addDoc(collection(db, "messages"), {
    channelId: currentChannel,
    text,
    username: userDoc.data().username,
    uid: currentUser.uid,
    timestamp: Date.now()
  });

  messageInput.value = "";
};

function loadMessages() {
  const q = query(
    collection(db, "messages"),
    where("channelId", "==", currentChannel),
    orderBy("timestamp")
  );

  onSnapshot(q, (snap) => {
    messages.innerHTML = "";

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const div = document.createElement("div");
      div.className = "message";

      div.innerHTML = `<span class="username">${data.username}:</span> ${data.text}`;

      if (
        currentRole === "owner" ||
        currentRole === "admin" ||
        isGlobalAdmin
      ) {
        const del = document.createElement("button");
        del.innerText = "X";
        del.onclick = () => deleteDoc(doc(db, "messages", docSnap.id));
        div.appendChild(del);
      }

      messages.appendChild(div);
    });
  });
}

/* SETTINGS */

openSettingsBtn.onclick = () => {
  settingsPanel.style.display = "flex";
};

saveProfileBtn.onclick = async () => {
  await updateDoc(doc(db, "users", currentUser.uid), {
    bio: bioInput.value,
    avatar: avatarInput.value
  });

  alert("Saved");
};

toggleThemeBtn.onclick = () => {
  document.body.classList.toggle("light");
};

changePasswordBtn.onclick = async () => {
  const newPass = prompt("New password?");
  if (!newPass) return;
  await updatePassword(currentUser, newPass);
  alert("Password updated");
};

logoutBtn.onclick = () => signOut(auth);

deleteAccountBtn.onclick = async () => {
  await deleteUser(currentUser);
  alert("Account deleted");
};
/* =========================
   ADMIN SYSTEM
========================= */

serverBanBtn.onclick = async () => {
  const uid = adminUidInput.value;
  if (!uid) return;

  await setDoc(doc(db, "serverBans", currentServer + "_" + uid), {
    uid,
    serverId: currentServer
  });

  alert("Server banned");
};

serverUnbanBtn.onclick = async () => {
  const uid = adminUidInput.value;
  if (!uid) return;

  await deleteDoc(doc(db, "serverBans", currentServer + "_" + uid));
  alert("Server unbanned");
};

globalBanBtn.onclick = async () => {
  if (!isGlobalAdmin) return alert("Only global admin");

  const uid = adminUidInput.value;
  if (!uid) return;

  await setDoc(doc(db, "globalBans", uid), { uid });
  alert("Globally banned");
};

globalUnbanBtn.onclick = async () => {
  if (!isGlobalAdmin) return alert("Only global admin");

  const uid = adminUidInput.value;
  if (!uid) return;

  await deleteDoc(doc(db, "globalBans", uid));
  alert("Global unbanned");
};

kickBtn.onclick = async () => {
  const uid = adminUidInput.value;
  if (!uid) return;

  const serverDoc = await getDoc(doc(db, "servers", currentServer));
  const data = serverDoc.data();

  const newMembers = data.members.filter(m => m !== uid);

  await updateDoc(doc(db, "servers", currentServer), {
    members: newMembers
  });

  alert("User kicked");
};

makeAdminBtn.onclick = async () => {
  const uid = adminUidInput.value;
  if (!uid) return;

  const serverRef = doc(db, "servers", currentServer);
  const serverDoc = await getDoc(serverRef);
  const data = serverDoc.data();

  data.roles[uid] = "admin";

  await updateDoc(serverRef, {
    roles: data.roles
  });

  alert("Admin given");
};

/* =========================
   FRIEND SYSTEM
========================= */

addFriendBtn.onclick = async () => {
  const uname = prompt("Friend username?");
  if (!uname) return;

  const nameDoc = await getDoc(doc(db, "usernames", uname));
  if (!nameDoc.exists()) return alert("User not found");

  const uid = nameDoc.data().uid;

  await setDoc(doc(db, "friends", currentUser.uid + "_" + uid), {
    users: [currentUser.uid, uid]
  });

  alert("Friend added");
};

function loadFriends() {
  const q = query(
    collection(db, "friends"),
    where("users", "array-contains", currentUser.uid)
  );

  onSnapshot(q, (snap) => {
    friendList.innerHTML = "";
    snap.forEach((docSnap) => {
      const users = docSnap.data().users;
      const other = users.find(u => u !== currentUser.uid);

      const div = document.createElement("div");
      div.innerText = other;
      div.onclick = () => openDM(other);

      friendList.appendChild(div);
    });
  });
}

/* =========================
   DM SYSTEM
========================= */

function openDM(otherUid) {
  currentChannel = null;
  chatHeader.innerText = "DM";

  const dmId = [currentUser.uid, otherUid].sort().join("_");

  const q = query(
    collection(db, "dms"),
    where("dmId", "==", dmId),
    orderBy("timestamp")
  );

  onSnapshot(q, (snap) => {
    messages.innerHTML = "";
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const div = document.createElement("div");
      div.className = "message";
      div.innerHTML = `<span class="username">${data.username}:</span> ${data.text}`;
      messages.appendChild(div);
    });
  });

  sendBtn.onclick = async () => {
    const text = messageInput.value;
    if (!text) return;

    const userDoc = await getDoc(doc(db, "users", currentUser.uid));

    await addDoc(collection(db, "dms"), {
      dmId,
      text,
      username: userDoc.data().username,
      timestamp: Date.now()
    });

    messageInput.value = "";
  };
}

/* =========================
   TYPING SYSTEM
========================= */

messageInput.oninput = async () => {
  if (!currentChannel) return;

  await setDoc(doc(db, "typing", currentChannel + "_" + currentUser.uid), {
    channelId: currentChannel,
    username: currentUser.uid
  });
};

function loadTyping() {
  const q = query(
    collection(db, "typing"),
    where("channelId", "==", currentChannel)
  );

  onSnapshot(q, (snap) => {
    typingIndicator.innerText = snap.size > 0 ? "Someone typing..." : "";
  });
}

/* =========================
   ONLINE STATUS
========================= */

window.addEventListener("beforeunload", async () => {
  if (currentUser)
    await updateDoc(doc(db, "users", currentUser.uid), { online: false });
});

/* =========================
   INVITE BY USERNAME
========================= */

async function inviteUser() {
  const uname = prompt("Username to invite?");
  if (!uname) return;

  const nameDoc = await getDoc(doc(db, "usernames", uname));
  if (!nameDoc.exists()) return alert("User not found");

  const uid = nameDoc.data().uid;

  const serverRef = doc(db, "servers", currentServer);
  const serverDoc = await getDoc(serverRef);
  const data = serverDoc.data();

  if (!data.members.includes(uid)) {
    data.members.push(uid);
  }

  await updateDoc(serverRef, {
    members: data.members
  });

  alert("Invited");
}

/* Load friends after login */
onAuthStateChanged(auth, (user) => {
  if (user) loadFriends();
});
