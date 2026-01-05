
// Esta es la IP de tu computadora en la red local
//const BASE_URL = "http://192.168.3.36:9095/api";
const BASE_URL = "https://jerkily-unperturbing-sadie.ngrok-free.dev/api";
//const URL_API = "https://jerkily-unperturbing-sadie.ngrok-free.dev/api/scan";

// Estos datos se llenarán al iniciar sesión
let usuarioLogueado = {
    nombre: "",
    idCentro: null,
    nombreCentro: ""
};

let maquinaSeleccionada = null;

// ==========================================
// 2. LÓGICA DE LOGIN
// ==========================================
async function procesarLogin() {
    const user = document.getElementById("userInput").value;
    const pass = document.getElementById("passInput").value;

    try {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': '69420' },
            body: JSON.stringify({ usuario: user, contrasenia: pass })
        });

        if (response.ok) {
            const data = await response.json(); 
            
            // MAPEO CORRECTO DE VARIABLES
            usuarioLogueado.nombre = data.nombre;
            usuarioLogueado.idCentro = data.idCentro;
            usuarioLogueado.nombreCentro = data.nombreCentro;

            mostrarInterfazPrincipal();
        } else {
            alert("❌ Usuario o contraseña incorrectos");
        }
    } catch (error) {
        alert("❌ Error de conexión");
    }
}

function mostrarInterfazPrincipal() {
    // Ocultamos login y mostramos la app
    document.getElementById("seccionLogin").style.display = "none";
    document.getElementById("seccionPrincipal").style.display = "block";

    // Saludo Dinámico
    document.getElementById("saludoUsuario").textContent = `Hola, ${usuarioLogueado.nombre}`;
    document.getElementById("nombreCentro").textContent = usuarioLogueado.nombreCentro;
    // Cargamos máquinas del centro obtenido en el login
    cargarBotonesDinamicos();
}

// ==========================================
// 3. CARGA DE BOTONES (GET)
// ==========================================
async function cargarBotonesDinamicos() {
    const contenedor = document.getElementById("contenedorBotones");
    try {
        // Ahora usuarioLogueado.idCentro tiene el valor real (ej. 36)
        const response = await fetch(`${BASE_URL}/maquinas/${usuarioLogueado.idCentro}`, {
            headers: { "ngrok-skip-browser-warning": "69420" }
        });
        
        const maquinas = await response.json();
        contenedor.innerHTML = ""; 

        maquinas.forEach(m => {
            const boton = document.createElement("button");
            boton.innerHTML = `<span>📟</span><br>${m.nombre}`;
            boton.className = "btn-maquina"; 
            boton.onclick = () => seleccionarMaquina(m.idMaquina);
            contenedor.appendChild(boton);
        });
    } catch (error) {
        contenedor.innerHTML = "<p>Error al cargar máquinas</p>";
    }
}

// ==========================================
// 4. LÓGICA DE ESCANEO
// ==========================================
function seleccionarMaquina(idMaquina) {
    maquinaSeleccionada = idMaquina;
    if (typeof iniciarLectorQR === "function") {
        iniciarLectorQR();
    } else {
        alert("Error: Lector QR no disponible.");
    }
}

function onQRLeido(codigoQR) {
    if (!maquinaSeleccionada) {
        alert("⚠️ Selecciona una máquina primero.");
        return;
    }

    const datos = {
        idCentroComercial: usuarioLogueado.idCentro, // ID dinámico
        idMaquina: maquinaSeleccionada,
        codigo: codigoQR,
        estado: true
    };

    enviarDatosBackend(datos); 
}


function seleccionarMaquina(idMaquina) {
    maquinaSeleccionada = idMaquina;
    document.querySelectorAll('.btn-maquina').forEach(b => b.classList.remove('selected'));
    // Lógica para abrir cámara...
    if (typeof iniciarLectorQR === "function") iniciarLectorQR();
}
// ==========================================
// 5. ENVÍO DE DATOS (POST)
// ==========================================
async function enviarDatosBackend(datos) {
    try {
        const response = await fetch(`${BASE_URL}/scan`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': '69420'
            },
            body: JSON.stringify(datos)
        });

        if (response.ok) {
            const ahora = new Date();
            alert(`✅ ¡GUARDADO!
Fecha: ${ahora.toLocaleDateString()}
Hora: ${ahora.toLocaleTimeString()}
Centro: ${usuarioLogueado.nombreCentro}`);
        } else {
            alert("❌ ERROR: " + response.status);
        }
    } catch (error) {
        alert("❌ FALLO DE RED: " + error.message);
    }
}