// CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyA2x776vVeCCrlZO-FUqNYoW7YKeQBNwc0",
  authDomain: "rifa-sorteo-premium.firebaseapp.com",
  databaseURL: "https://rifa-sorteo-premium-default-rtdb.us-central1.firebaseio.com",
  projectId: "rifa-sorteo-premium",
  storageBucket: "rifa-sorteo-premium.firebasestorage.app",
  messagingSenderId: "650229645589",
  appId: "1:650229645589:web:8a2729c65b88caee7b291c"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Generar los 100 números (del 00 al 99)
document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("contenedor-numeros");
    
    for (let i = 0; i < 100; i++) {
        const numeroFormateado = i.toString().padStart(2, '0');
        
        const celda = document.createElement("div");
        celda.classList.add("numero-celda", "disponible");
        celda.id = `num-${numeroFormateado}`;
        celda.innerText = numeroFormateado;
        
        celda.addEventListener("click", () => abrirModal(numeroFormateado));
        contenedor.appendChild(celda);
    }
    
    // ESCUCHAR EN TIEMPO REAL (Para todos los celulares)
    database.ref("numeros").on("value", (snapshot) => {
        const datos = snapshot.val() || {};
        
        // 1. Primero limpiamos TODOS los números y los ponemos disponibles
        for (let i = 0; i < 100; i++) {
            const numStr = i.toString().padStart(2, '0');
            const celda = document.getElementById(`num-${numStr}`);
            if (celda) {
                celda.className = "numero-celda disponible";
            }
        }
        
        // 2. Marcamos como reservados los que están en Firebase (Corregido el error del 00 al 09)
        Object.keys(datos).forEach(num => {
            // Forzamos a que el número tenga siempre 2 dígitos (ej: "5" pasa a "05")
            const numAjustado = num.toString().padStart(2, '0'); 
            const celda = document.getElementById(`num-${numAjustado}`);
            if (celda) {
                celda.className = "numero-celda reservado";
            }
        });
    });
});

// Lógica del Modal
const modal = document.getElementById("modal-reserva");
const numSeleccionadoTxt = document.getElementById("numero-seleccionado");
let numeroActual = null;

function abrirModal(numero) {
    const celda = document.getElementById(`num-${numero}`);
    if (celda.classList.contains("reservado")) {
        alert("Este número ya está reservado.");
        return;
    }
    
    numeroActual = numero;
    numSeleccionadoTxt.innerText = numero;
    modal.classList.remove("oculto");
}

document.getElementById("btn-cerrar").addEventListener("click", () => {
    modal.classList.add("oculto");
    document.getElementById("formulario-reserva").reset();
});

// Guardar la reserva en Firebase
document.getElementById("formulario-reserva").addEventListener("submit", (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById("nombre").value;
    const telefono = document.getElementById("telefono").value;
    
    if (numeroActual) {
        database.ref(`numeros/${numeroActual}`).set({
            nombre: nombre,
            telefono: telefono,
            fecha: new Date().toISOString()
        }, (error) => {
            if (error) {
                alert("Hubo un error al reservar. Intentá de nuevo.");
            } else {
                alert(`¡Número ${numeroActual} reservado con éxito para ${nombre}!`);
                modal.classList.add("oculto");
                document.getElementById("formulario-reserva").reset();
            }
        });
    }
});
