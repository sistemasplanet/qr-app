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
function onQRLeido(codigoQR) {

    alert(
        "QR leído: " + codigoQR +
        "\nCentro: " + centroActual.nombre +
        "\nMáquina: " + maquinaSeleccionada
    );

    const datos = {
        idCentro: centroActual.id,
        idMaquina: maquinaSeleccionada,
        codigoQR: codigoQR,
        fechaHora: new Date().toISOString()
    };

    console.log(datos);
}

    // AQUÍ irá luego el fetch() al backend Java
    // enviarDatosBackend(datos);

