import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection, getDocs, query, where, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let profesorNombre = "";
let datosAgrupados = {};

onAuthStateChanged(auth, async (user) => {
  if (!user) return (window.location.href = "login.html");

  // Obtener nombre del profesor
  const userDoc = await getDoc(doc(db, "usuarios", user.uid));
  const userData = userDoc.data();
  profesorNombre = `${userData.nombre}_${userData.apellido}`.toLowerCase();

  // Obtener todos los gimnasios creados por el usuario
  const gimnasiosSnapshot = await getDocs(query(collection(db, "gimnasios"), where("creadoPor", "==", user.uid)));
  const gimnasios = {};
  gimnasiosSnapshot.forEach((g) => {
    gimnasios[g.id] = g.data().nombre;
  });

  // Obtener todas las jornadas del usuario
  const jornadasSnapshot = await getDocs(query(collection(db, "jornadas"), where("uidProfesor", "==", user.uid)));
  datosAgrupados = {};

  jornadasSnapshot.forEach((docSnap) => {
    const j = docSnap.data();
    const gymName = gimnasios[j.gimnasioId] || "Gimnasio desconocido";

    if (!datosAgrupados[gymName]) datosAgrupados[gymName] = [];

    datosAgrupados[gymName].push({
      Fecha: j.fecha,
      "Hora Entrada": j.horaInicio,
      "Hora Salida": j.horaFin,
      "Precio x Hora": j.precioHora,
      "Total Jornada": j.total,
    });
  });

  mostrarPreview();
});

// 📋 Mostrar la tabla previa agrupada
const mostrarPreview = () => {
  const container = document.getElementById("previewContainer");
  container.innerHTML = "";

  for (const gym in datosAgrupados) {
    const jornadas = datosAgrupados[gym];
    const totalAcumulado = jornadas.reduce((acc, j) => acc + j["Total Jornada"], 0);

    let html = `<h5 class="mt-4">${gym}</h5>`;
    html += `<table class="table table-bordered table-striped">
               <thead><tr>
                 <th>Fecha</th>
                 <th>Hora Entrada</th>
                 <th>Hora Salida</th>
                 <th>Precio x Hora</th>
                 <th>Total Jornada</th>
               </tr></thead>
               <tbody>`;

    jornadas.forEach(j => {
      html += `<tr>
        <td>${j.Fecha}</td>
        <td>${j["Hora Entrada"]}</td>
        <td>${j["Hora Salida"]}</td>
        <td>$${j["Precio x Hora"]}</td>
        <td>$${j["Total Jornada"]}</td>
      </tr>`;
    });

    html += `<tr class="table-light fw-bold">
      <td colspan="4" class="text-end">Total Acumulado</td>
      <td>$${totalAcumulado}</td>
    </tr>`;

    html += "</tbody></table>";
    container.innerHTML += html;
  }
};
window.mostrarPreview = mostrarPreview;

// 📤 Exportar a Excel
window.exportarExcel = () => {
  const wb = XLSX.utils.book_new();

  for (const gym in datosAgrupados) {
    const hoja = XLSX.utils.json_to_sheet(datosAgrupados[gym]);
    const total = datosAgrupados[gym].reduce((sum, j) => sum + j["Total Jornada"], 0);
    const lastRow = datosAgrupados[gym].length + 2;

    XLSX.utils.sheet_add_aoa(hoja, [["Total Acumulado", "", "", "", total]], { origin: `A${lastRow}` });
    XLSX.utils.book_append_sheet(wb, hoja, gym.substring(0, 31));
  }

  const nombreArchivo = `jornadas_${profesorNombre || auth.currentUser.displayName || 'usuario'}.xlsx`;
  XLSX.writeFile(wb, nombreArchivo);
};

document.getElementById("exportBtn").addEventListener("click", exportarExcel);

// 🔝 Scroll arriba
window.scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
