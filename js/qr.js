// ==========================================
// 1. CONFIGURACIÓN GLOBAL
// ==========================================
const centroActual = {
    id: 36, 
    nombre: "Centro Comercial 36"
};

// Esta es la IP de tu computadora en la red local
//const BASE_URL = "http://192.168.3.36:9095/api";
const BASE_URL = "https://jerkily-unperturbing-sadie.ngrok-free.dev/api";
const URL_API = "https://jerkily-unperturbing-sadie.ngrok-free.dev/api/scan";

let maquinaSeleccionada = null;

// ==========================================
// 2. INICIALIZACIÓN AL CARGAR LA PÁGINA
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Actualizar el título del centro
    const tituloCentro = document.getElementById("nombreCentro");
    if (tituloCentro) {
        tituloCentro.textContent = centroActual.nombre;
    }

    // Cargar los botones de las máquinas desde el backend
    cargarBotonesDinamicos();
});

// ==========================================
// 3. CARGA DE BOTONES (GET)
// ==========================================
async function cargarBotonesDinamicos() {
    const contenedor = document.getElementById("contenedorBotones");
    if (!contenedor) return;

    try {
        const response = await fetch(`${BASE_URL}/maquinas/${centroActual.id}`);
        
        if (!response.ok) throw new Error("No se pudo obtener la lista de máquinas");

        const maquinas = await response.json();
        
        // Limpiamos el mensaje de "Cargando..."
        contenedor.innerHTML = ""; 

        if (maquinas.length === 0) {
            contenedor.innerHTML = "<p>No hay máquinas registradas para este centro.</p>";
            return;
        }

        maquinas.forEach(m => {
            const boton = document.createElement("button");
            boton.textContent = m.nombre;
            boton.className = "btn-maquina"; 
            
            // Al hacer clic, guardamos el ID y abrimos la cámara
            boton.onclick = () => seleccionarMaquina(m.idMaquina);
            
            contenedor.appendChild(boton);
        });

    } catch (error) {
        console.error("Error cargando botones:", error);
        contenedor.innerHTML = `<p style="color:red;">Error de conexión: ${error.message}</p>`;
    }
}

// ==========================================
// 4. LÓGICA DE SELECCIÓN Y ESCANEO
// ==========================================
function seleccionarMaquina(idMaquina) {
    maquinaSeleccionada = idMaquina;
    console.log("Máquina seleccionada ID:", maquinaSeleccionada);
    
    // Función que debe estar en tu lectorQR.js para abrir la cámara
    if (typeof iniciarLectorQR === "function") {
        iniciarLectorQR();
    } else {
        alert("Error: No se encontró la función del lector QR.");
    }
}

/**
 * Esta función es llamada automáticamente por el lector cuando detecta un código
 */
function onQRLeido(codigoQR) {
    if (!maquinaSeleccionada) {
        alert("⚠️ Por favor, selecciona una máquina antes de escanear.");
        return;
    }

    // Los nombres de estas llaves coinciden con tu clase RegistroQR.java
    const datos = {
        idCentroComercial: centroActual.id,
        idMaquina: maquinaSeleccionada,
        codigo: codigoQR, // Mapea a la columna 'codigo' de docsQr
        estado: true
    };

    console.log("Datos listos para enviar:", datos);
    enviarDatosBackend(datos); 
}

// ==========================================
// 5. ENVÍO DE DATOS (POST)
// ==========================================
async function enviarDatosBackend(datos) {
    const URL_API = "http://192.168.3.36:9095/api/scan";
    
    try {
        console.log("Intentando enviar:", datos);
        
        const response = await fetch(URL_API, {
            method: 'POST',
            mode: 'cors', // Forzamos modo CORS
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        if (response.ok) {
            alert("✅ ¡ÉXITO! Guardado en la base de datos.");
        } else {
            const errorTexto = await response.text();
            alert("❌ ERROR SERVIDOR: " + response.status + " - " + errorTexto);
        }
    } catch (error) {
        // Si entra aquí y el firewall está OFF, es que la IP no es alcanzable
        alert("❌ FALLO DE RED: " + error.message + 
              "\n\nVerifica que el celular no haya saltado a Datos Móviles.");
    }
}