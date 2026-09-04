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

    // Por si veníamos de la pantalla de selección de máquinas, la ocultamos
    // y volvemos a mostrar el contenedor de la cámara
    const seccionMaquinas = document.getElementById("seccionMaquinas");
    if (seccionMaquinas) seccionMaquinas.style.display = "none";
    const camara = document.getElementById("contenedorCámara");
    if (camara) camara.style.display = "block";

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
    let mostrandoSeleccionMaquinas = false;

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
            // Ticket normal (isPromocion = 0): el backend manda la lista de máquinas
            // del centro comercial para que el usuario elija con cuál jugar/canjear
            if (Array.isArray(resultado.maquinas) && resultado.maquinas.length > 0) {
                mostrarSeleccionMaquinas(resultado.maquinas);
                mostrandoSeleccionMaquinas = true;
            } else {
                // Ticket promocional (isPromocion = 1), o sin máquinas asociadas
                const ahora = new Date().toLocaleTimeString();
                alert(`✅ ¡ENTRADA VÁLIDA!\n\nHora: ${ahora}\nCentro: ${usuarioLogueado.nombreCentro}`);
            }
        } else {
            alert(`❌ ${resultado.mensaje || "Error al validar"}`);
        }
    } catch (error) {
        console.error("Error de red:", error);
        alert("❌ Error de conexión: El servidor no responde.");
    } finally {
        // Si estamos mostrando la selección de máquinas, el botón "Escanear Nuevo"
        // aparece recién cuando el usuario elige o cancela (ver ocultarSeleccionMaquinas)
        if (!mostrandoSeleccionMaquinas) {
            const btnReanudar = document.getElementById("btnReanudar");
            if (btnReanudar) btnReanudar.style.display = "block";
        }
    }
}

// ==========================================
// 5. SELECCIÓN DE MÁQUINA (tickets con isPromocion = 0)
// ==========================================
function mostrarSeleccionMaquinas(maquinas) {
    const seccion = document.getElementById("seccionMaquinas");
    const camara = document.getElementById("contenedorCámara");
    if (seccion) seccion.style.display = "block";
    if (camara) camara.style.display = "none";

    const contenedor = document.getElementById("listaMaquinas");
    if (!contenedor) return;
    contenedor.innerHTML = "";

    maquinas.forEach((maquina) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn-maquina";
        // OJO: ajusta estos nombres de campo según lo que realmente devuelva
        // MaquinaDTO en el JSON (no tengo el archivo MaquinaDTO.java para confirmarlo)
        const nombre = maquina.nombre || maquina.nombreMaquina || maquina.codigo
            || `Máquina ${maquina.idMaquina ?? maquina.id ?? ""}`;
        btn.textContent = nombre;
        btn.onclick = () => seleccionarMaquina(maquina);
        contenedor.appendChild(btn);
    });
}

function seleccionarMaquina(maquina) {
    const nombre = maquina.nombre || maquina.nombreMaquina || maquina.codigo || "la máquina seleccionada";
    alert(`✅ Máquina seleccionada: ${nombre}`);

    // TODO: si hace falta avisarle al backend qué máquina eligió el usuario
    // (por ejemplo, para registrar en qué máquina se usó el ticket),
    // aquí se agregaría el fetch correspondiente. Por ahora solo confirma la selección.

    ocultarSeleccionMaquinas();
}

function cancelarSeleccionMaquina() {
    ocultarSeleccionMaquinas();
}

function ocultarSeleccionMaquinas() {
    const seccion = document.getElementById("seccionMaquinas");
    const camara = document.getElementById("contenedorCámara");
    if (seccion) seccion.style.display = "none";
    if (camara) camara.style.display = "block";

    const btnReanudar = document.getElementById("btnReanudar");
    if (btnReanudar) btnReanudar.style.display = "block";
}
