// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDoywNfbP5S26VwX-UjOYsYdW-uPuUohz4",
  authDomain: "fit-track-pro-cb7fb.firebaseapp.com",
  projectId: "fit-track-pro-cb7fb",
  storageBucket: "fit-track-pro-cb7fb.appspot.com",
  messagingSenderId: "820999431709",
  appId: "1:820999431709:web:0882423e92ecc0b92b48f4",
  measurementId: "G-7YJY5H4XVK"
};

// Inicializar Firebase
let app, auth, db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  // Ver cambios de sesión (opcional para debugging)
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('✅ Sesión iniciada:', user.email);
    } else {
      console.log('⚠️ Usuario no autenticado.');
    }
  });

} catch (error) {
  console.error("❌ Error inicializando Firebase:", error);
}

export { app, auth, db };
