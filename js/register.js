import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("firstName").value.trim();
  const apellido = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Guardamos los datos del profesor en Firestore
    await setDoc(doc(db, "usuarios", user.uid), {
      nombre,
      apellido,
      email,
      creadoEn: new Date()
    });

    alert("Registro exitoso. Redirigiendo al dashboard...");
    window.location.href = "dashboard.html";
  } catch (error) {
    alert("Error al registrar: " + error.message);
  }
});
