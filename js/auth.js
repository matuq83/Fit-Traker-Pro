// Importación de Firebase y la instancia de auth
import { auth } from './firebase-config.js';
import { 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 🔐 Inicio de sesión
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html";
  } catch (error) {
    alert("Error al iniciar sesión: " + error.message);
  }
});

// 🔁 Envío del link de recuperación de contraseña
window.enviarLinkReset = async () => {
  const email = document.getElementById("resetEmail").value.trim();
  if (!email) return alert("Por favor ingresá tu correo.");

  try {
    await sendPasswordResetEmail(auth, email);
    Swal.fire({
  icon: 'success',
  title: '¡Enlace enviado!',
  text: 'Revisá tu correo para restablecer tu contraseña.',
  confirmButtonColor: '#0d6efd'
});

    
    // Si usás Bootstrap, esto cierra el modal automáticamente
    const modal = bootstrap.Modal.getInstance(document.getElementById("resetPasswordModal"));
    modal?.hide();
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo enviar el enlace. Verificá el correo.',
      confirmButtonColor: '#dc3545'
    });    
  }
};
