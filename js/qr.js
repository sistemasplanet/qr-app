// Configuración de URL
const BASE_URL = "https://jerkily-unperturbing-sadie.ngrok-free.dev/api";

// 1. CARGA INICIAL: Intentar recuperar sesión guardada al abrir la página
let usuarioLogueado = JSON.parse(localStorage.getItem("usuarioQR")) || {
    nombre: "",
    idCentro: null,
    nombreCentro: ""
};

// Si ya había alguien logueado, saltamos directo a la interfaz principal
window.onload = () => {
    if (usuarioLogueado.idCentro) {
        mostrarInterfazPrincipal();
    }
};

// ==========================================
// 2. LÓGICA DE LOGIN
// ==========================================
async function procesarLogin() {
    const user = document.getElementById("userInput").value.trim();
    const pass = document.getElementById("passInput").value.trim();

    if (!user || !pass) {
        alert("⚠️ Por favor ingresa usuario y contraseña");
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': '69420' },
            body: JSON.stringify({ usuario: user, contrasenia: pass })
        });

        if (response.ok) {
            const data = await response.json(); 
            
            usuarioLogueado = {
                nombre: data.nombre,
                idCentro: data.idCentro,
                nombreCentro: data.nombreCentro
            };
            localStorage.setItem("usuarioQR", JSON.stringify(usuarioLogueado));

            mostrarInterfazPrincipal();
        } else {
            alert("❌ Usuario o contraseña incorrectos");
        }
    } catch (error) {
        console.error("Error Login:", error);
        alert("❌ Error de conexión con el servidor");
    }
}

// ==========================================
// 3. CERRAR SESIÓN
// ==========================================
function cerrarSesion() {
    localStorage.clear(); 
    sessionStorage.clear();
    
    if (typeof detenerCamara === "function") detenerCamara();
    
    location.reload(); 
}

function mostrarInterfazPrincipal() {
    document.getElementById("seccionLogin").style.display = "none";
    document.getElementById("seccionPrincipal").style.display = "block";

    document.getElementById("saludoUsuario").textContent = `Hola, ${usuarioLogueado.nombre}`;
    document.getElementById("nombreCentro").textContent = usuarioLogueado.nombreCentro;
    
    iniciarEscaner();
}

function iniciarEscaner() {
    const btnReanudar = document.getElementById("btnReanudar");
    if (btnReanudar) btnReanudar.style.display = "none";
    
    if (typeof iniciarLectorQR === "function") {
        iniciarLectorQR();
    } else {
        alert("Error: Lector QR no disponible.");
    }
}

// ==========================================
// 4. LÓGICA DE ESCANEO Y ENVÍO DIRECTO
// ==========================================
function onQRLeido(codigoQR) {
    const datos = {
        idCentroComercial: usuarioLogueado.idCentro,
        codigo: codigoQR,
        estado: true
    };

    enviarDatosBackend(datos); 
}

async function enviarDatosBackend(datos) {
    try {
        const response = await fetch(`${BASE_URL}/scan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': '69420'
            },
            body: JSON.stringify(datos)
        });

        if (typeof detenerCamara === "function") await detenerCamara(); 

        const resultado = await response.json();

        if (response.ok) {
            const ahora = new Date().toLocaleTimeString();
            alert(`✅ ¡ENTRADA VÁLIDA!\n\nHora: ${ahora}\nCentro: ${usuarioLogueado.nombreCentro}`);
        } else {
            alert(`❌ ${resultado.mensaje || "Error al validar"}`);
        }
    } catch (error) {
        console.error("Error de red:", error);
        alert("❌ Error de conexión: El servidor no responde.");
    } finally {
        // Muestra el botón para escanear de nuevo al terminar la petición
        const btnReanudar = document.getElementById("btnReanudar");
        if (btnReanudar) btnReanudar.style.display = "block";
    }
}