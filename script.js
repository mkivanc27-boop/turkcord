import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
apiKey:"AIzaSyC98wxJQk8yNZFdE-OJ1Tlpy1ANuaRUT14",
authDomain:"turkcord-47b24.firebaseapp.com",
projectId:"turkcord-47b24",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.register = async ()=>{
try{
await createUserWithEmailAndPassword(auth,email.value,password.value);
alert("Kayıt OK");
}catch(e){
alert(e.message);
}
};

window.login = async ()=>{
try{
await signInWithEmailAndPassword(auth,email.value,password.value);
alert("Login OK");
}catch(e){
alert(e.message);
}
};
