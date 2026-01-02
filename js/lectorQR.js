let html5QrCode = null;

function iniciarLectorQR() {
    const readerElement = document.getElementById("reader");
    
    // Mostramos el contenedor de la cámara si estaba oculto
    if (readerElement) {
        readerElement.style.display = "block";
    }

    // Si ya había una instancia corriendo, la detenemos
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            configurarYEmpezar();
        }).catch(() => {
            configurarYEmpezar();
        });
    } else {
        configurarYEmpezar();
    }
}

function configurarYEmpezar() {
    html5QrCode = new Html5Qrcode("reader");

    const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
    };

    // Iniciamos la cámara trasera (facingMode: environment)
    html5QrCode.start(
        { facingMode: "environment" }, 
        config,
        (decodedText) => {
            // CUANDO DETECTA EL QR:
            console.log("Código detectado:", decodedText);
            
            // 1. Detenemos la cámara
            detenerCamara();
            
            // 2. Pasamos el código a la función de qr.js para enviarlo al servidor
            if (typeof onQRLeido === "function") {
                onQRLeido(decodedText);
            }
        },
        (errorMessage) => {
            // Error de escaneo (normalmente ocurre mientras busca el código)
        }
    ).catch((err) => {
        console.error("No se pudo iniciar la cámara:", err);
        alert("Error al acceder a la cámara. Asegúrate de dar permisos.");
    });
}

function detenerCamara() {
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            document.getElementById("reader").style.display = "none";
            console.log("Cámara detenida.");
        }).catch(err => console.error("Error al detener cámara", err));
    }
}

