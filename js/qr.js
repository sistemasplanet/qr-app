// ================================
// CONFIGURACIÓN REAL
// ================================
const centroActual = {
    id: 36, // El ID que acabamos de probar
    nombre: "Centro Comercial 36"
};

let maquinaSeleccionada = null;

document.addEventListener("DOMContentLoaded", () => {
    // 1. Ponemos el título
    document.getElementById("nombreCentro").textContent = centroActual.nombre;

    // 2. Cargamos los botones desde el Backend
    cargarBotonesDinamicos();
});

async function cargarBotonesDinamicos() {
    try {
        const response = await fetch(`http://192.168.3.36:9095/api/maquinas/${centroActual.id}`);
        const maquinas = await response.json();

        // Buscamos el contenedor donde van los botones
        const contenedor = document.getElementById("contenedorBotones"); 
        contenedor.innerHTML = ""; // Limpiamos lo que haya

        maquinas.forEach(m => {
            // Creamos cada botón azul
            const boton = document.createElement("button");
            boton.textContent = m.nombre;
            boton.className = "btn-maquina"; // Asegúrate de tener esta clase en tu CSS
            
            // Al hacer clic, se selecciona y abre la cámara
            boton.onclick = () => seleccionarMaquina(m.idMaquina);
            
            contenedor.appendChild(boton);
        });
    } catch (error) {
        console.error("Error cargando botones:", error);
    }
}


// ================================
// CUANDO CARGA LA PÁGINA
// ================================
document.addEventListener("DOMContentLoaded", () => {

    const tituloCentro = document.getElementById("nombreCentro");

    if (tituloCentro) {
        tituloCentro.textContent = centroActual.nombre;
    } else {
        console.error("No se encontró el elemento nombreCentro");
    }

});


// ================================
// FUNCIÓN AL PRESIONAR UNA MÁQUINA
// ================================
function seleccionarMaquina(idMaquina) {
    maquinaSeleccionada = idMaquina;

    console.log("Centro:", centroActual);
    console.log("Máquina seleccionada:", maquinaSeleccionada);

    // Llama al lector QR (archivo lectorQR.js)
    iniciarLectorQR();
}


// ================================
// FUNCIÓN QUE SE LLAMA CUANDO YA SE LEYÓ EL QR
// (esta función la usa lectorQR.js)
// ================================
function onQRLeido(codigoQR) {
    // Preparamos el objeto con los nombres exactos de tu clase RegistroQR.java
    const datos = {
        idCentroComercial: centroActual.id,
        idMaquina: maquinaSeleccionada,
        serieMaquina: codigoQR, // El texto que leyó la cámara
        estado: true // Esto cambiará el false por true en la BD
    };

    console.log("Datos listos para enviar:", datos);

    // LLAMADA AL BACKEND
    enviarDatosBackend(datos); 
}

    // AQUÍ irá luego el fetch() al backend Java
    // enviarDatosBackend(datos);

// ================================
// CONEXIÓN CON EL BACKEND JAVA
// ================================
async function enviarDatosBackend(datos) {
    // 1. Usa la IP de tu PC y el puerto 9095 que configuramos
    const URL_API = "http://192.168.3.36:9095/api/scan"; 

    try {
        const response = await fetch(URL_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos) // Convertimos el objeto JS a JSON para Java
        });

        if (response.ok) {
            const respuesta = await response.json();
            alert("✅ Guardado: Estado actualizado a TRUE y hora registrada.");
            console.log("Respuesta del servidor:", respuesta);
        } else {
            throw new Error("Error en la respuesta del servidor");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("❌ No se pudo conectar al servidor de Java. Revisa la IP y el CORS.");
    }
}