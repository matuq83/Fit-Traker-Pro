import { auth, db } from './firebase-config.js';
import {
  collection,
  addDoc,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/+esm";

const urlParams = new URLSearchParams(window.location.search);
const gymId = urlParams.get("gym");
if (!gymId) window.location.href = "dashboard.html";

function calcularTotal(horaInicio, horaFin, precioHora) {
  const inicio = new Date(`1970-01-01T${horaInicio}:00`);
  const fin = new Date(`1970-01-01T${horaFin}:00`);
  const diffMs = fin - inicio;
  const horas = diffMs / 1000 / 60 / 60;
  return Math.round(horas * parseFloat(precioHora));
}

document.getElementById("jornadaForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fecha = document.getElementById("fecha").value;
  const horaInicio = document.getElementById("horaInicio").value;
  const horaFin = document.getElementById("horaFin").value;
  const precioHora = parseFloat(document.getElementById("precioHora").value);
  const total = calcularTotal(horaInicio, horaFin, precioHora);
  const user = auth.currentUser;

  await addDoc(collection(db, "jornadas"), {
    uidProfesor: user.uid,
    gimnasioId: gymId,
    fecha,
    horaInicio,
    horaFin,
    precioHora,
    total,
    creadoEn: Timestamp.now()
  });

  e.target.reset();
  cargarJornadas();
});

async function cargarJornadas() {
  const tbody = document.getElementById("jornadasBody");
  tbody.innerHTML = "";

  const q = query(collection(db, "jornadas"), where("uidProfesor", "==", auth.currentUser.uid), where("gimnasioId", "==", gymId));
  const snapshot = await getDocs(q);

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const row = `
      <tr>
        <td>${data.fecha}</td>
        <td>${data.horaInicio}</td>
        <td>${data.horaFin}</td>
        <td>$${data.precioHora}</td>
        <td>$${data.total}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary me-1" onclick="editar('${docSnap.id}', '${data.fecha}', '${data.horaInicio}', '${data.horaFin}', ${data.precioHora})">Editar</button>
          <button class="btn btn-sm btn-outline-danger" onclick="eliminar('${docSnap.id}')">Eliminar</button>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

window.editar = (id, fecha, inicio, fin, precio) => {
  document.getElementById("editId").value = id;
  document.getElementById("editFecha").value = fecha;
  document.getElementById("editInicio").value = inicio;
  document.getElementById("editFin").value = fin;
  document.getElementById("editPrecio").value = precio;
  new bootstrap.Modal(document.getElementById("editModal")).show();
};

document.getElementById("editForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("editId").value;
  const fecha = document.getElementById("editFecha").value;
  const horaInicio = document.getElementById("editInicio").value;
  const horaFin = document.getElementById("editFin").value;
  const precioHora = parseFloat(document.getElementById("editPrecio").value);
  const total = calcularTotal(horaInicio, horaFin, precioHora);

  const docRef = doc(db, "jornadas", id);
  await updateDoc(docRef, { fecha, horaInicio, horaFin, precioHora, total });

  bootstrap.Modal.getInstance(document.getElementById("editModal")).hide();
  cargarJornadas();
});

window.eliminar = async (id) => {
  const confirmacion = await Swal.fire({
    title: "¿Eliminar jornada?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  });

  if (!confirmacion.isConfirmed) return;
  await deleteDoc(doc(db, "jornadas", id));
  cargarJornadas();
};

window.eliminarTodasLasJornadas = async () => {
  const confirmacion = await Swal.fire({
    title: "¿Eliminar todas las jornadas?",
    text: "Se eliminarán todas las jornadas de este gimnasio.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  });

  if (!confirmacion.isConfirmed) return;

  const q = query(collection(db, "jornadas"), where("uidProfesor", "==", auth.currentUser.uid), where("gimnasioId", "==", gymId));
  const snapshot = await getDocs(q);
  const eliminaciones = [];

  snapshot.forEach((docSnap) => {
    eliminaciones.push(deleteDoc(doc(db, "jornadas", docSnap.id)));
  });

  await Promise.all(eliminaciones);
  Swal.fire("Eliminadas", "Todas las jornadas fueron eliminadas.", "success");
  cargarJornadas();
};

window.exportarExcel = () => {
  const table = document.querySelector("table");
  const tableClone = table.cloneNode(true);

  tableClone.querySelectorAll("tr").forEach(row => {
    if (row.children.length > 5) {
      row.removeChild(row.lastElementChild);
    }
  });

  const wb = XLSX.utils.table_to_book(tableClone, { sheet: "Jornadas" });
  const user = auth.currentUser;
  const nombreArchivo = `jornadas_${user.displayName || 'profesor'}.xlsx`;
  XLSX.writeFile(wb, nombreArchivo);
};

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  cargarJornadas();
});

window.scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
