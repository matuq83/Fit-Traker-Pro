import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Asegurate de tener SweetAlert2 cargado en tu HTML
// <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("firstName").value.trim();
  const apellido = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "usuarios", user.uid), {
      nombre,
      apellido,
      email,
      creadoEn: new Date()
    });

    // ✅ Éxito con Swal
    Swal.fire({
      icon: 'success',
      title: 'Registro exitoso',
      text: 'Serás redirigido al dashboard.',
      confirmButtonColor: '#198754',
      timer: 2500,
      showConfirmButton: false
    });

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 2500);

  } catch (error) {
    // ❌ Error con Swal
    Swal.fire({
      icon: 'error',
      title: 'Error al registrar',
      text: error.message,
      confirmButtonColor: '#dc3545'
    });
  }
});
