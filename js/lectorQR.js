let html5QrCode = null;


async function iniciarLectorQR() {
    const readerElement = document.getElementById("reader");
    if (readerElement) readerElement.style.display = "block";

    // 1. Si la instancia no existe, la creamos UNA SOLA VEZ
    if (!html5QrCode) {
        html5QrCode = new Html5Qrcode("reader");
    }

    // 2. Si ya está escaneando, no hacemos nada o lo reiniciamos
    if (html5QrCode.isScanning) {
        await html5QrCode.stop();
    }

    configurarYEmpezar();
}

function configurarYEmpezar() {
    const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
    };

    html5QrCode.start(
        { facingMode: "environment" }, 
        config,
        (decodedText) => {
            console.log("Código detectado:", decodedText);
            
            // DETENER ES VITAL
            detenerCamara();
            
            if (typeof onQRLeido === "function") {
                onQRLeido(decodedText);
            }
        },
        (errorMessage) => { /* Escaneo en curso... */ }
    ).catch((err) => {
        console.error("Error al iniciar cámara:", err);
        // Si falla porque quedó bloqueada, intentamos limpiar
        html5QrCode.clear();
    });
}

function detenerCamara() {
    if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => {
            document.getElementById("reader").style.display = "none";
            // Limpia el DOM interno que deja la librería
            html5QrCode.clear(); 
        }).catch(err => console.error("Error al detener:", err));
    } else {
        document.getElementById("reader").style.display = "none";
    }
}
