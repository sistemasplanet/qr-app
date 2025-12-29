let qrScanner = null;

function iniciarLectorQR() {

    const lector = document.getElementById("lectorQR");

    if (!lector) {
        alert("No existe el contenedor lectorQR");
        return;
    }

    lector.style.display = "block";

    qrScanner = new Html5Qrcode("lectorQR");

    qrScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        qrTexto => {
            qrScanner.stop();
            lector.style.display = "none";

            // Llamamos a la función del otro archivo
            onQRLeido(qrTexto);
        },
        error => {
            // errores normales de escaneo (ignorar)
        }
    );
}

