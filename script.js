import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, setDoc, doc, addDoc, collection, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ================= FIREBASE ================= */

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

/* ================= REGISTER ================= */

window.register = async () => {

if(!username.value || !email.value || !password.value){
alert("Alanlar boş olamaz");
return;
}

await createUserWithEmailAndPassword(auth,email.value,password.value);

await setDoc(doc(db,"users",auth.currentUser.uid),{
username:username.value,
email:email.value,
role:"user"
});

alert("Kayıt başarılı");

};

/* ================= LOGIN ================= */

window.login = async () => {

await signInWithEmailAndPassword(auth,email.value,password.value);

alert("Login OK");

};

/* ================= LOGOUT ================= */

window.logout = async () => {

await signOut(auth);

location.reload();

};

/* ================= AUTO UI CONTROL ================= */

onAuthStateChanged(auth,(user)=>{

const authDiv = document.getElementById("auth");
const appDiv = document.getElementById("app");

if(user){

currentUser = user.uid;

if(authDiv) authDiv.style.display="none";
if(appDiv) appDiv.style.display="block";

console.log("User logged in");

}else{

if(authDiv) authDiv.style.display="block";
if(appDiv) appDiv.style.display="none";

}

});

/* ================= SERVER CREATE ================= */

window.createServer = async () => {

if(!serverName.value) return;

await addDoc(collection(db,"servers"),{
name:serverName.value,
owner:currentUser,
public:serverPublic.checked,
inviteCode:Math.random().toString(36).substring(2,8),
members:[currentUser]
});

alert("Server oluşturuldu");

serverName.value="";

};

/* ================= SERVER SEARCH ================= */

window.searchServer = async () => {

const snap = await getDocs(collection(db,"servers"));

serverList.innerHTML="";

snap.forEach(docSnap=>{

const data = docSnap.data();

if(data.name.toLowerCase().includes(searchInput.value.toLowerCase())){

const div=document.createElement("div");

div.innerHTML=`
<b>${data.name}</b>
<br>
${data.public?"Public":"Private"}
`;

div.onclick=()=>{
alert("Invite Code: "+data.inviteCode);
};

serverList.appendChild(div);

}

});

};

/* ================= JOIN BY INVITE ================= */

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
