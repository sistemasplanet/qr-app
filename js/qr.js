
// Esta es la IP de tu computadora en la red local
//const BASE_URL = "http://192.168.3.36:9095/api";
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

let maquinaSeleccionada = null;

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
            
            // Guardamos en el objeto y en localStorage para persistencia
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
// 3. CERRAR SESIÓN (NUEVO)
// ==========================================
function cerrarSesion() {
    // Limpiamos memoria
    localStorage.removeItem("usuarioQR");
    usuarioLogueado = { nombre: "", idCentro: null, nombreCentro: "" };
    
    // Reset de inputs
    document.getElementById("userInput").value = "";
    document.getElementById("passInput").value = "";
    
    // Cambio de vista
    document.getElementById("seccionLogin").style.display = "block";
    document.getElementById("seccionPrincipal").style.display = "none";
    
    // Detener cámara si estaba abierta
    if (typeof detenerCamara === "function") detenerCamara();
    
    alert("Sesión cerrada correctamente");
}

function mostrarInterfazPrincipal() {
    document.getElementById("seccionLogin").style.display = "none";
    document.getElementById("seccionPrincipal").style.display = "block";

    document.getElementById("saludoUsuario").textContent = `Hola, ${usuarioLogueado.nombre}`;
    document.getElementById("nombreCentro").textContent = usuarioLogueado.nombreCentro;
    
    cargarBotonesDinamicos();
}

// ==========================================
// 4. CARGA DE MÁQUINAS (DINÁMICA)
// ==========================================
async function cargarBotonesDinamicos() {
    const contenedor = document.getElementById("contenedorBotones");
    if (!usuarioLogueado.idCentro) return;

    try {
        const response = await fetch(`${BASE_URL}/maquinas/${usuarioLogueado.idCentro}`, {
            headers: { "ngrok-skip-browser-warning": "69420" }
        });
        
        const maquinas = await response.json();
        contenedor.innerHTML = ""; 

        maquinas.forEach(m => {
            const boton = document.createElement("button");
            boton.innerHTML = `<span>📟</span><br>${m.nombre}`;
            boton.className = "btn-maquina"; 
            boton.onclick = () => seleccionarMaquina(m.idMaquina, boton);
            contenedor.appendChild(boton);
        });
    } catch (error) {
        console.error("Error cargar máquinas:", error);
        contenedor.innerHTML = "<p>Error al cargar máquinas</p>";
    }
}

function seleccionarMaquina(idMaquina, elementoBoton) {
    maquinaSeleccionada = idMaquina;
    // Resaltar visualmente el botón seleccionado
    document.querySelectorAll('.btn-maquina').forEach(b => b.classList.remove('selected'));
    elementoBoton.classList.add('selected');

    if (typeof iniciarLectorQR === "function") {
        iniciarLectorQR();
    } else {
        alert("Error: Lector QR no disponible.");
    }
}

// ==========================================
// 5. LÓGICA DE ESCANEO Y ENVÍO
// ==========================================
function onQRLeido(codigoQR) {
    if (!maquinaSeleccionada) {
        alert("⚠️ Selecciona una máquina primero.");
        return;
    }

    const datos = {
        idCentroComercial: usuarioLogueado.idCentro,
        idMaquina: maquinaSeleccionada,
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
            // Aquí mostrará el mensaje de "Tiempo agotado" que configuramos en Java
            alert(`❌ ${resultado.mensaje || "Error al validar"}`);
        }
        limpiarSeleccion();

    } catch (error) {
        console.error("Error de red:", error);
        alert("❌ Error de conexión: El servidor no responde.");
    }
}

function limpiarSeleccion() {
    maquinaSeleccionada = null;
    document.querySelectorAll('.btn-maquina').forEach(b => b.classList.remove('selected'));
}