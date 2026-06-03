// CONFIGURACIÓN DE FIREBASE (¡Acá van tus claves, Marcelo!)
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
        // Formatear a dos dígitos (00, 01, 02...)
        const numeroFormateado = i.toString().padStart(2, '0');
        
        const celda = document.createElement("div");
        celda.classList.add("numero-celda", "disponible");
        celda.id = `num-${numeroFormateado}`;
        celda.innerText = numeroFormateado;
        
        // Escuchar el clic en cada número
        celda.addEventListener("click", () => abrirModal(numeroFormateado));
        
        contenedor.appendChild(celda);
    }
    
    // Escuchar los cambios en la base de datos en tiempo real
    database.ref("numeros").on("value", (snapshot) => {
        const datos = snapshot.val() || {};
        
        // Limpiar todos a disponible primero
        for (let i = 0; i < 100; i++) {
            const numStr = i.toString().padStart(2, '0');
            const celda = document.getElementById(`num-${numStr}`);
            if (celda) {
                celda.className = "numero-celda disponible";
            }
        }
        
        // Marcar los que ya están reservados
        Object.keys(datos).forEach(num => {
            const celda = document.getElementById(`num-${num}`);
            if (celda) {
                celda.className = "numero-celda reservado";
            }
        });
    });
});

// Lógica del Modal (Ventana flotante)
const modal = document.getElementById("modal-reserva");
const numSeleccionadoTxt = document.getElementById("numero-seleccionado");
let numeroActual = null;

function abrirModal(numero) {
    // Si ya está reservado, no hacer nada (se maneja visualmente)
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
