// Configuración de URL
const BASE_URL = "https://jerkily-unperturbing-sadie.ngrok-free.dev/api";
let codigoQRPendiente = null;
let procesandoQR = false; // Evita escaneos múltiples accidentales

let usuarioLogueado = JSON.parse(localStorage.getItem("usuarioQR")) || {
    nombre: "", idCentro: null, nombreCentro: ""
};

window.onload = () => {
    if (usuarioLogueado.idCentro) mostrarInterfazPrincipal();
};

// ==========================================
// 1. LOGIN
// ==========================================
async function procesarLogin() {
    const user = document.getElementById("userInput").value.trim();
    const pass = document.getElementById("passInput").value.trim();

    if (!user || !pass) {
        Swal.fire("Atención", "Por favor ingresa usuario y contraseña", "warning");
        return;
    }

    // Mostrar estado de carga
    Swal.fire({ title: 'Iniciando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': '69420' },
            body: JSON.stringify({ usuario: user, contrasenia: pass })
        });

        if (response.ok) {
            const data = await response.json();
            usuarioLogueado = { nombre: data.nombre, idCentro: data.idCentro, nombreCentro: data.nombreCentro };
            localStorage.setItem("usuarioQR", JSON.stringify(usuarioLogueado));
            Swal.close();
            mostrarInterfazPrincipal();
        } else {
            Swal.fire("Error", "Usuario o contraseña incorrectos", "error");
        }
    } catch (error) {
        Swal.fire("Error de red", "No se pudo conectar con el servidor", "error");
    }
}

function cerrarSesion() {
    localStorage.clear(); sessionStorage.clear();
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

// ==========================================
// 2. ESCÁNER
// ==========================================
function iniciarEscaner() {
    codigoQRPendiente = null;
    procesandoQR = false;
    
    document.getElementById("btnReanudar").style.display = "none";
    document.getElementById("seccionMaquinas").style.display = "none";
    document.getElementById("contenedorCámara").style.display = "block";

    if (typeof iniciarLectorQR === "function") iniciarLectorQR();
}

function onQRLeido(codigoQR) {
    if (procesandoQR) return; // Si ya está procesando uno, ignora nuevas lecturas
    procesandoQR = true;

    const datos = {
        idCentroComercial: usuarioLogueado.idCentro,
        codigo: codigoQR,
        estado: true
    };
    enviarDatosBackend(datos);
}

// ==========================================
// 3. COMUNICACIÓN CON BACKEND
// ==========================================
async function enviarDatosBackend(datos) {
    let requiereMaquina = false;
    Swal.fire({ title: 'Validando ticket...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const response = await fetch(`${BASE_URL}/scan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': '69420' },
            body: JSON.stringify(datos)
        });

        if (typeof detenerCamara === "function") await detenerCamara();
        const resultado = await response.json();

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: '¡ENTRADA VÁLIDA!',
                text: `Hora: ${new Date().toLocaleTimeString()} | Centro: ${usuarioLogueado.nombreCentro}`,
                timer: 3000,
                showConfirmButton: false
            });
            codigoQRPendiente = null;
        } else {
            // Evaluamos si el error es porque falta seleccionar máquina
            if (resultado.mensaje && resultado.mensaje.includes("seleccionar una máquina")) {
                Swal.close();
                codigoQRPendiente = datos.codigo;
                requiereMaquina = true;
                await cargarYMostrarMaquinas();
            } else {
                Swal.fire("Ticket Inválido", resultado.mensaje || "Error al validar", "error");
            }
        }
    } catch (error) {
        Swal.fire("Error", "El servidor no responde", "error");
    } finally {
        if (!requiereMaquina) {
            document.getElementById("btnReanudar").style.display = "block";
            procesandoQR = false;
        }
    }
}

// ==========================================
// 4. FLUJO DE SELECCIÓN DE MÁQUINAS
// ==========================================
async function cargarYMostrarMaquinas() {
    Swal.fire({ title: 'Cargando máquinas...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const response = await fetch(`${BASE_URL}/maquinas/${usuarioLogueado.idCentro}`, {
            headers: { 'ngrok-skip-browser-warning': '69420' }
        });

        if (response.ok) {
            const maquinas = await response.json();
            Swal.close();
            
            if (maquinas.length === 0) {
                Swal.fire("Atención", "No hay máquinas registradas en este centro.", "info");
                cancelarSeleccionMaquina();
                return;
            }
            mostrarUISeleccionMaquinas(maquinas);
        } else {
            Swal.fire("Error", "No se pudieron cargar las máquinas", "error");
            cancelarSeleccionMaquina();
        }
    } catch (error) {
        Swal.fire("Error", "Error de red al obtener las máquinas", "error");
        cancelarSeleccionMaquina();
    }
}

function mostrarUISeleccionMaquinas(maquinas) {
    document.getElementById("seccionMaquinas").style.display = "block";
    document.getElementById("contenedorCámara").style.display = "none";
    
    const contenedor = document.getElementById("listaMaquinas");
    contenedor.innerHTML = "";

    maquinas.forEach((maquina) => {
        const btn = document.createElement("button");
        btn.className = "btn-maquina";
        
        const idMaq = maquina.idMaquina || maquina.id;
        btn.textContent = maquina.nombre || maquina.nombreMaquina || `Máquina ${idMaq}`;
        
        btn.onclick = () => seleccionarMaquina(idMaq);
        contenedor.appendChild(btn);
    });
}

function seleccionarMaquina(idMaquina) {
    if (!codigoQRPendiente) return cancelarSeleccionMaquina();

    const datosConMaquina = {
        idCentroComercial: usuarioLogueado.idCentro,
        codigo: codigoQRPendiente,
        idMaquina: idMaquina,
        estado: true
    };

    ocultarUISeleccionMaquinas();
    enviarDatosBackend(datosConMaquina); // Reintenta el canje con la máquina elegida
}

function cancelarSeleccionMaquina() {
    codigoQRPendiente = null;
    ocultarUISeleccionMaquinas();
    document.getElementById("btnReanudar").style.display = "block";
    procesandoQR = false;
}

function ocultarUISeleccionMaquinas() {
    document.getElementById("seccionMaquinas").style.display = "none";
    document.getElementById("contenedorCámara").style.display = "block";
}
