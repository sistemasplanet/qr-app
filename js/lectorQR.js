let html5QrCode = null;


async function iniciarLectorQR() {
    const readerElement = document.getElementById("reader");
    if (readerElement) {
        readerElement.style.display = "block";
        readerElement.innerHTML = ""; // <--- LIMPIEZA FÍSICA: Borra cualquier rastro de video previo
    }

    try {
        // 1. Si ya existe la instancia, la matamos por completo
        if (html5QrCode) {
            if (html5QrCode.isScanning) {
                await html5QrCode.stop();
            }
            await html5QrCode.clear();
            html5QrCode = null; // <--- DESTRUCCIÓN: Forzamos a que sea nulo
        }

        // 2. Pequeña pausa de 200ms para que el celular suelte la cámara
        setTimeout(() => {
            html5QrCode = new Html5Qrcode("reader");
            configurarYEmpezar();
        }, 200);

    } catch (err) {
        console.error("Error en reinicio:", err);
        html5QrCode = new Html5Qrcode("reader");
        configurarYEmpezar();
    }
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
