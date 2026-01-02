// ================================
// CONFIGURACIÓN GENERAL
// ================================

// Centro actual (luego vendrá de BD o URL)
const centroActual = {
    id: 1,
    nombre: "Peluchelandia"
};

// Máquina seleccionada
let maquinaSeleccionada = null;


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
async function onQRLeido(codigoQR) {
    // Definimos los datos que espera tu modelo RegistroQR en Java
    const datos = {
        idMaquina: maquinaSeleccionada,
        serieMaquina: codigoQR, // Asumimos que el QR contiene la serie
        idCentroComercial: centroActual.id,
        estado: true // Forzamos el estado a true como pediste
    };

    console.log("Enviando datos al servidor:", datos);

    try {
        // IMPORTANTE: Cambia 'localhost' por la IP de tu PC si pruebas desde un celular real
        const response = await fetch('http://localhost:9095/api/scan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        if (response.ok) {
            const resultado = await response.json();
            alert("¡Éxito! Máquina activada el: " + resultado.horaScan); 
            // El backend ya devuelve la fecha/hora que pediste
        } else {
            alert("Error al guardar en el servidor");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("No se pudo conectar con el servidor Java");
    }
}

    // AQUÍ irá luego el fetch() al backend Java
    // enviarDatosBackend(datos);

