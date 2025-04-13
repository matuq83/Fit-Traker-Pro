import { auth, db } from './firebase-config.js';
import {
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  deleteDoc,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🌙 Modo oscuro persistente
const body = document.getElementById("main-body");
const darkBtn = document.getElementById("darkModeBtn");

if (localStorage.getItem("modo") === "oscuro") {
  body.classList.remove("bg-light", "text-dark");
  body.classList.add("bg-dark", "text-white");
}

darkBtn.addEventListener("click", () => {
  body.classList.toggle("bg-dark");
  body.classList.toggle("text-white");
  body.classList.toggle("bg-light");
  body.classList.toggle("text-dark");

  const modo = body.classList.contains("bg-dark") ? "oscuro" : "claro";
  localStorage.setItem("modo", modo);
});

// 🔓 Cerrar sesión
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

// Verificar usuario y cargar gimnasios
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Mostrar nombre
  const userRef = doc(db, "usuarios", user.uid);
  const userSnap = await getDoc(userRef);
  const nombre = userSnap.data()?.nombre || "Profesor";
  document.getElementById("userName").textContent = `Hola, ${nombre}`;

  // Traer gimnasios creados por el usuario
  const q = query(collection(db, "gimnasios"), where("creadoPor", "==", user.uid));
  const snapshot = await getDocs(q);

  const container = document.getElementById("gymList");
  container.innerHTML = "";

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id;

    const card = `
      <div class="col-md-6 col-lg-4">
        <div class="card shadow-sm mb-3">
          <div class="card-body">
            <h5 class="card-title">${data.nombre}</h5>
            <a href="jornadas.html?gym=${id}" class="btn btn-outline-primary btn-sm me-2">Ver jornadas</a>
            <button class="btn btn-outline-danger btn-sm" onclick="eliminarGimnasio('${id}')">Eliminar</button>
          </div>
        </div>
      </div>
    `;
    container.innerHTML += card;
  });
});

// ➕ Crear gimnasio
document.getElementById("addGymBtn").addEventListener("click", async () => {
  const nombre = prompt("Ingrese el nombre del Establecimiento:");
  if (!nombre) return;

  const user = auth.currentUser;

  try {
    await addDoc(collection(db, "gimnasios"), {
      nombre,
      creadoPor: user.uid,
      creadoEn: new Date()
    });

    alert("¡Establecimiento creado!");
    location.reload();
  } catch (error) {
    console.error("Error al crear establecimiento:", error.message);
    alert("No se pudo crear el Establecimiento. Verificá permisos en Firebase.");
  }
});

// ❌ Eliminar gimnasio y sus jornadas asociadas
window.eliminarGimnasio = async (gymId) => {
  const confirmar = confirm("¿Querés eliminar este establecimiento y todas sus jornadas?");
  if (!confirmar) return;

  try {
    const jornadasSnap = await getDocs(query(collection(db, "jornadas"), where("gimnasioId", "==", gymId)));
    const batch = writeBatch(db);
    jornadasSnap.forEach(docSnap => batch.delete(docSnap.ref));
    await batch.commit();

    await deleteDoc(doc(db, "gimnasios", gymId));

    alert("Establecimiento y jornadas eliminados correctamente.");
    location.reload();
  } catch (error) {
    console.error("Error eliminando establecimiento:", error);
    alert("No se pudo eliminar. Verificá permisos en Firestore.");
  }
};

// ⬆️ Scroll arriba
window.scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
