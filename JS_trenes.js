let sesionIniciada = false;
let reservaTemporal = {}; // Guarda datos del cliente antes de evaluar
let idReservaGuardada = null;
let baseDatosVentas = []; // Memoria global para almacenar reservas y encuestas

const datosRutas = {
    antigua: {
        nombre: "Antigua Guatemala",
        mapa: "imagenes/mapaA.png",
        fondo: "imagenes/AntiguaG.jpg",
        qr: "imagenes/qrAntigua.png",
        origen: "Estación Central",
        destino: "Antigua Guatemala",
        distancia: "45 km",
        velocidad: "40 km/h",
        tiempo: "1h 15min",
        horarios: ["07:00 AM", "10:30 AM", "02:00 PM", "05:15 PM"],
        precios: { basico: 45, ejecutivo: 85, vip: 140 }
    },
    escuintla: {
        nombre: "Escuintla (Costa Sur)",
        mapa: "imagenes/mapaE.png",
        fondo: "imagenes/Escuintla.jpg",
        qr: "imagenes/qrescuintla.png",
        origen: "Estación Central",
        destino: "Escuintla",
        distancia: "65 km",
        velocidad: "55 km/h",
        tiempo: "1h 30min",
        horarios: ["06:30 AM", "09:30 AM", "01:15 PM", "04:30 PM"],
        precios: { basico: 60, ejecutivo: 105, vip: 175 }
    },
    quetzaltenango: {
        nombre: "Quetzaltenango (Xela)",
        mapa: "imagenes/mapaQ.png",
        fondo: "imagenes/Quetzaltenango.jpg",
        qr: "imagenes/qrXela.png",
        origen: "Estación Central",
        destino: "Quetzaltenango",
        distancia: "205 km",
        velocidad: "50 km/h",
        tiempo: "4h 30min",
        horarios: ["05:00 AM", "08:00 AM", "01:00 PM"],
        precios: { basico: 120, ejecutivo: 180, vip: 260 }
    },
    barrios: {
        nombre: "Puerto Barrios (Atlántico)",
        mapa: "imagenes/mapaP.png",
        fondo: "imagenes/PuertoBarrios.jpg",
        qr: "imagenes/qrpuerto.png",
        origen: "Estación Central",
        destino: "Puerto Barrios",
        distancia: "295 km",
        velocidad: "65 km/h",
        tiempo: "6h 30min",
        horarios: ["04:30 AM", "07:00 AM", "11:00 AM"],
        precios: { basico: 150, ejecutivo: 220, vip: 320 }
    }
};

const infoDestinos = {
    antigua: {
        titulo: "LULATRÉN: Antigua Guatemala",
        descripcion: "Viaje al corazón de la arquitectura colonial y vistas volcánicas.",
        hoteles: "Hotel Casa Santo Domingo, Porta Hotel Antigua.",
        restaurantes: "La Cuevita del Urquizú.",
        actividad: "Tour de café y recorrido por el Arco.",
        maps: "https://www.google.com/maps/search/Antigua+Guatemala",
        guia: "https://www.google.com/search?q=turismo+Antigua+Guatemala"
    },
    escuintla: {
        titulo: "LULATRÉN: Costa Sur Escuintla",
        descripcion: "Conexión rápida con vagones climatizados hacia la Costa Sur.",
        hoteles: "Hotel Soleil La Pacífico.",
        restaurantes: "Restaurante Sarita.",
        actividad: "Auto Safari Chapín.",
        maps: "https://www.google.com/maps/search/Escuintla",
        guia: "https://www.google.com/search?q=turismo+Escuintla"
    },
    quetzaltenango: {
        titulo: "LULATRÉN: Quetzaltenango (Xela)",
        descripcion: "Ruta panorámica de montaña con cafetería a bordo.",
        hoteles: "Hotel Pensión Bonifaz.",
        restaurantes: "Utz Hua Café.",
        actividad: "Fuentes Georginas.",
        maps: "https://www.google.com/maps/search/Quetzaltenango",
        guia: "https://www.google.com/search?q=turismo+Quetzaltenango"
    },
    barrios: {
        titulo: "LULATRÉN: Puerto Barrios",
        descripcion: "Ruta histórica hacia el Caribe guatemalteco.",
        hoteles: "Amatique Bay Resort.",
        restaurantes: "El Tenedor del Caribe.",
        actividad: "Tour a Livingston.",
        maps: "https://www.google.com/maps/search/Puerto+Barrios",
        guia: "https://www.google.com/search?q=turismo+Puerto+Barrios"
    }
};

function abrirDetalle(llaveDestino) {
    const destino = infoDestinos[llaveDestino];
    const modal = document.getElementById('modal-destino');
    if (destino && modal) {
        document.getElementById('modal-titulo-destino').innerText = destino.titulo;
        document.getElementById('modal-cuerpo-destino').innerHTML = `
            <p style="margin-bottom: 10px; color: #555;">${destino.descripcion}</p>
            <p><strong>Hoteles:</strong> ${destino.hoteles}</p>
            <p><strong>Restaurantes:</strong> ${destino.restaurantes}</p>
            <p><strong>Actividad:</strong> ${destino.actividad}</p>
            <hr style="margin: 10px 0;">
            <a href="${destino.maps}" target="_blank" style="color: #4285F4;"> Google Maps</a> |
            <a href="${destino.guia}" target="_blank" style="color: #27ae60;">Guía Oficial</a>
        `;
        modal.classList.remove('hidden');
    }
}

function cerrarDetalle() {
    const modal = document.getElementById('modal-destino');
    if (modal) modal.classList.add('hidden');
}

function actualizarPanelTarifas() {
    const selectDestino = document.getElementById('select-destino');
    if (!selectDestino) return;

    const clave = selectDestino.value;
    const ruta = datosRutas[clave];

    document.getElementById('img-mapa-destino').src = ruta.mapa;
    const fondoFullScreen = document.querySelector('.capa-fondo-fullscreen');
    if (fondoFullScreen) {
        fondoFullScreen.style.backgroundImage = `url('${ruta.fondo}')`;
    }

    document.getElementById('mapa-titulo-destino').innerText = `${ruta.origen} - ${ruta.destino}`;
    document.getElementById('info-origen').innerText = ruta.origen;
    document.getElementById('info-destino').innerText = ruta.destino;
    document.getElementById('info-distancia').innerText = ruta.distancia;
    document.getElementById('info-velocidad').innerText = ruta.velocidad;
    document.getElementById('info-tiempo').innerText = ruta.tiempo;

    const boxHorarios = document.getElementById('box-horarios');
    boxHorarios.innerHTML = '';
    ruta.horarios.forEach(hora => {
        const badge = document.createElement('span');
        badge.className = 'badge-hora';
        badge.innerText = hora;
        boxHorarios.appendChild(badge);
    });

    document.getElementById('precio-basico').innerText = `Q ${ruta.precios.basico}.00`;
    document.getElementById('precio-ejecutivo').innerText = `Q ${ruta.precios.ejecutivo}.00`;
    document.getElementById('precio-vip').innerText = `Q ${ruta.precios.vip}.00`;

    calcularTotalCotizacion();
}

function calcularTotalCotizacion() {
    const selectDestino = document.getElementById('select-destino');
    if (!selectDestino) return;

    const clave = selectDestino.value;
    const ruta = datosRutas[clave];

    const numAdultos = parseInt(document.getElementById('num-adultos').value) || 0;
    const numNinos = parseInt(document.getElementById('num-ninos').value) || 0;

    const bloqueEdadNinos = document.getElementById('bloque-edad-ninos');

    if (numNinos > 0) {
        bloqueEdadNinos.classList.remove('hidden-section');
    } else {
        bloqueEdadNinos.classList.add('hidden-section');
    }

    const paqueteRadio = document.querySelector('input[name="paquete"]:checked');
    const tipoPaquete = paqueteRadio ? paqueteRadio.value : 'basico';
    const precioUnitario = ruta.precios[tipoPaquete];

    const edadNinos = document.getElementById('select-edad-ninos').value;
    let factorNino = 1.0;

    if (edadNinos === 'menor') {
        factorNino = 0.5;
    }

    const totalAdultos = numAdultos * precioUnitario;
    const totalNinos = numNinos * (precioUnitario * factorNino);
    const granTotal = totalAdultos + totalNinos;

    document.getElementById('total-cotizado').innerText =
            `Q ${granTotal.toFixed(2)}`;
}

function borrarDatos() {
    const passengerForm = document.getElementById('passengerForm');

    if (passengerForm) {
        passengerForm.reset();
    }

    const childContainer = document.getElementById('childDataContainer');

    if (childContainer) {
        childContainer.innerHTML = '';
    }
}

async function cargarDatosAdministrador() {
    try {
        const respuesta = await fetch("ConsultarAdminServlet");

        if (!respuesta.ok) {
            throw new Error("No se pudieron consultar las reservas");
        }

        const datos = await respuesta.json();

        baseDatosVentas = datos.reservas.map(reg => {
            const ruta = datosRutas[reg.ruta];

            return {
                codigoTicket: reg.codigoTicket,
                nombre: reg.nombre,
                dpi: reg.dpi,
                ruta: ruta
                    ? `${ruta.origen} ➔ ${ruta.destino}`
                    : reg.ruta,
                pasajerosDetalle: `${reg.numNinos} niño(s) registrado(s)`,
                montoTotal: `Q ${Number(reg.montoTotal).toFixed(2)}`,
                fechaEmision: reg.fechaEmision,
                encuesta: {
                    usabilidad: reg.encuesta.usabilidad,
                    motivo: reg.encuesta.motivo,
                    aspectos: reg.encuesta.aspectos,
                    nps: reg.encuesta.nps,
                    frecuencia: reg.encuesta.frecuencia,
                    comentarios: reg.encuesta.comentarios
                }
            };
        });

        console.log("Reservas cargadas desde MySQL:", baseDatosVentas);

    } catch (error) {
        console.error("Error al consultar MySQL:", error);
        alert("No se pudieron cargar los datos del administrador.");
    }
}


// MOSTRAR INFORMACIÓN EN EL PANEL DE ADMINISTRADOR
function mostrarDetalleAdmin(tipo) {
    const menuBotones = document.getElementById('admin-menu-botones');
    const panelContenido = document.getElementById('admin-panel-contenido');
    const titulo = document.getElementById('admin-contenido-titulo');
    const body = document.getElementById('admin-contenido-body');

    if (!menuBotones || !panelContenido || !titulo || !body) return;

    let totalIngresos = 0;
    let sumaNPS = 0;

    baseDatosVentas.forEach(reg => {
        const montoLimpio = parseFloat(
                reg.montoTotal.replace('Q', '').trim()
                ) || 0;

        totalIngresos += montoLimpio;
        sumaNPS += parseInt(reg.encuesta.nps) || 0;
    });

    if (tipo === 'ingresos') {
        titulo.innerText = 'Total de Ingresos Acumulados';

        body.innerHTML = `
            <div class="kpi-modal-box">
                <p style="font-size: 1.1rem; color: #e2e8f0;">
                    Monto total recaudado por ventas de boletos:
                </p>
                <div class="kpi-modal-number">
                    Q ${totalIngresos.toFixed(2)}
                </div>
                <p style="color: #cbd5e1;">
                    Total de transacciones realizadas:
                    <strong>${baseDatosVentas.length}</strong>
                </p>
            </div>
        `;
    } else if (tipo === 'reservas') {

        titulo.innerText =
                `Reservas Emitidas (${baseDatosVentas.length} Boletos)`;

        if (baseDatosVentas.length === 0) {
            body.innerHTML = `
                <p style="text-align: center; color: #cbd5e1; padding: 30px;">
                    No hay reservas registradas en el sistema aún.
                </p>
            `;
        } else {
            let filas = '';

            baseDatosVentas.forEach(reg => {
                filas += `
                    <tr>
                        <td><strong>${reg.codigoTicket}</strong></td>
                        <td>${reg.nombre}</td>
                        <td>${reg.dpi}</td>
                        <td>${reg.ruta}</td>
                        <td>${reg.pasajerosDetalle}</td>
                        <td style="color: #facc15; font-weight: bold;">
                            ${reg.montoTotal}
                        </td>
                        <td>${reg.fechaEmision}</td>
                    </tr>
                `;
            });

            body.innerHTML = `
                <div class="table-responsive-wrapper">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Ticket</th>
                                <th>Cliente</th>
                                <th>DPI</th>
                                <th>Ruta</th>
                                <th>Pasajeros</th>
                                <th>Monto</th>
                                <th>Fecha</th>
                            </tr>
                        </thead>
                        <tbody>${filas}</tbody>
                    </table>
                </div>
            `;
        }

    } else if (tipo === 'evaluaciones') {

        const promNPS = baseDatosVentas.length > 0
                ? (sumaNPS / baseDatosVentas.length).toFixed(1)
                : "0.0";

        titulo.innerText = 'Resumen de Evaluaciones y Satisfacción';

        let encuestasHTML = '';

        if (baseDatosVentas.length === 0) {
            encuestasHTML = `
                <p style="text-align: center; color: #cbd5e1; padding: 20px;">
                    No hay encuestas registradas aún.
                </p>
            `;
        } else {
            baseDatosVentas.forEach(reg => {
                encuestasHTML += `
                    <div class="encuesta-card-item"
                         style="margin-bottom: 12px;">
                        <p>
                            <strong>Cliente:</strong>
                            ${reg.nombre} (${reg.codigoTicket})
                        </p>
                        <p>
                            <strong>Plataforma:</strong>
                            ${reg.encuesta.usabilidad}
                            |
                            <strong>Motivo:</strong>
                            ${reg.encuesta.motivo}
                        </p>
                        <p>
                            <strong>NPS Recomendación:</strong>
                            ${reg.encuesta.nps}/10
                            |
                            <strong>Viajes/Año:</strong>
                            ${reg.encuesta.frecuencia}
                        </p>
                        <p>
                            <strong>Aspectos:</strong>
                            ${reg.encuesta.aspectos}
                        </p>
                        <p style="margin-top: 4px;">
                            <strong>Comentario:</strong>
                            <em>"${reg.encuesta.comentarios}"</em>
                        </p>
                    </div>
                `;
            });
        }

        body.innerHTML = `
            <div class="kpi-modal-box" style="padding: 10px 0 20px 0;">
                <p style="font-size: 1rem; color: #e2e8f0;">
                    Promedio General de Satisfacción:
                </p>
                <div class="kpi-modal-number"
                     style="font-size: 2.8rem; margin: 5px 0;">
                    ${promNPS} / 10
                </div>
            </div>
            <h4 style="color: #facc15; margin-bottom: 15px;">
                Comentarios de Pasajeros:
            </h4>
            <div class="encuestas-admin-grid">
                ${encuestasHTML}
            </div>
        `;
    }

    menuBotones.classList.add('hidden-section');
    panelContenido.classList.remove('hidden-section');
}

function regresarMenuAdmin() {
    const menuBotones = document.getElementById('admin-menu-botones');
    const panelContenido = document.getElementById('admin-panel-contenido');

    if (menuBotones && panelContenido) {
        panelContenido.classList.add('hidden-section');
        menuBotones.classList.remove('hidden-section');
    }
}

function generarDiploma(nombre, codigoTicket, puntuacion) {

    const seccionDiploma = document.getElementById('seccion-diploma');
    const areaDiploma = document.getElementById('area-diploma-imprimir');

    if (!seccionDiploma || !areaDiploma) return;

    const fecha = new Date().toLocaleDateString('es-GT');

    let resultado = "";

    if (puntuacion >= 9) {
        resultado = "Experiencia excelente";
    } else if (puntuacion >= 7) {
        resultado = "Experiencia satisfactoria";
    } else {
        resultado = "Experiencia con oportunidades de mejora";
    }

    // Crear el diploma sin modificar el boleto
    areaDiploma.innerHTML = `
        <div style="
            background: #fffdf5;
            color: #17324d;
            border: 8px double #c9a44c;
            border-radius: 12px;
            padding: 35px 20px;
            max-width: 750px;
            margin: 20px auto;
            text-align: center;
            font-family: Georgia, serif;
        ">
            <h1 style="color: #17324d;">
                LULATRÉN GUATEMALA
            </h1>

            <h2 style="color: #a8842e;">
                DIPLOMA DE APROBACIÓN
            </h2>

            <p>Se otorga el presente reconocimiento a:</p>

            <h2 id="nombre-diploma"></h2>

            <p>
                Por completar satisfactoriamente la
                evaluación de experiencia de viaje
                de LULATRÉN.
            </p>

            <h3>Resultado: ${resultado}</h3>

            <p>Calificación de satisfacción: ${puntuacion}/10</p>

            <p>Fecha: ${fecha}</p>

            <p>Código de reserva: <strong id="codigo-diploma"></strong></p>

            <hr style="margin-top: 30px;">

            <p>LULATRÉN - Guatemala</p>
        </div>
    `;

    // Insertar los datos del pasajero como texto
    document.getElementById('nombre-diploma').textContent = nombre;
    document.getElementById('codigo-diploma').textContent = codigoTicket;

    seccionDiploma.classList.remove('hidden-section');
}

function imprimirDiploma() {
    const areaDiploma = document.getElementById('area-diploma-imprimir');

    if (!areaDiploma || !areaDiploma.innerHTML.trim()) {
        alert("Primero debes completar la evaluación.");
        return;
    }

    const ventana = window.open('', '_blank');

    if (!ventana) {
        alert("Permite las ventanas emergentes para imprimir el diploma.");
        return;
    }

    ventana.document.open();
    ventana.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Diploma LULATRÉN</title>
            <style>
                body {
                    font-family: Georgia, serif;
                    margin: 30px;
                    background: white;
                }

                @page {
                    size: A4 landscape;
                    margin: 15mm;
                }

                @media print {
                    body {
                        margin: 0;
                    }
                }
            </style>
        </head>
        <body>
            ${areaDiploma.innerHTML}
        </body>
        </html>
    `);
    ventana.document.close();

    ventana.onload = () => {
        ventana.focus();
        ventana.print();
    };
}



document.addEventListener('DOMContentLoaded', () => {

    // Carrusel principal
    let currentSlide = 0;
    const slides = document.querySelectorAll('.hero-slider .slide');

    if (slides.length > 0) {
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 4000);
    }

    // Mostrar galería de destinos
    const btnVerDestinos = document.getElementById('btn-ver-destinos');
    const galeriaDestinos = document.getElementById('galeria-destinos');

    if (btnVerDestinos && galeriaDestinos) {
        btnVerDestinos.addEventListener('click', () => {
            galeriaDestinos.classList.remove('hidden-section');
            galeriaDestinos.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Modal para crear cuenta
    const modalCuenta = document.getElementById('modal-crear-cuenta');
    const btnHeroCrearCuenta = document.getElementById('btn-hero-crear-cuenta');
    const closeModalCuenta = document.getElementById('close-modal-cuenta');
    const formCrearCuenta = document.getElementById('form-crear-cuenta');
    const cuentaMsg = document.getElementById('cuenta-msg');

    const abrirModalCuenta = () => {
        if (modalCuenta) modalCuenta.classList.remove('hidden');
    };

    const cerrarModalCuenta = () => {
        if (modalCuenta) modalCuenta.classList.add('hidden');
    };

    if (btnHeroCrearCuenta) {
        btnHeroCrearCuenta.addEventListener('click', abrirModalCuenta);
    }

    if (closeModalCuenta) {
        closeModalCuenta.addEventListener('click', cerrarModalCuenta);
    }

    if (formCrearCuenta) {
        formCrearCuenta.addEventListener('submit', (e) => {
            e.preventDefault();

            const pass = document.getElementById('nueva-pass').value;
            const confirmPass = document.getElementById('confirmar-pass').value;

            if (pass !== confirmPass) {
                if (cuentaMsg) cuentaMsg.classList.remove('hidden');
                return;
            }

            if (cuentaMsg) cuentaMsg.classList.add('hidden');

            const usuario = document.getElementById('nuevo-usuario').value;

            sesionIniciada = true;

            alert(`¡Cuenta creada con éxito para "${usuario}"! Ya puede cotizar sus viajes.`);

            cerrarModalCuenta();
            formCrearCuenta.reset();

            if (galeriaDestinos &&
                !galeriaDestinos.classList.contains('hidden-section')) {

                galeriaDestinos.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Inicio de sesión del administrador
    const modalAdmin = document.getElementById('modal-admin');
    const btnLoginModal = document.getElementById('btn-login-modal');
    const closeModal = document.getElementById('close-modal');
    const formAdmin = document.getElementById('form-admin');
    const btnCerrarAdmin = document.getElementById('btn-cerrar-admin');
    const seccionAdminDashboard =
            document.getElementById('seccion-admin-dashboard');
    const seccionHero = document.getElementById('seccion-hero');

    const abrirModalAdmin = () => {
        if (modalAdmin) modalAdmin.classList.remove('hidden');
    };

    const cerrarModalAdmin = () => {
        if (modalAdmin) modalAdmin.classList.add('hidden');
    };

    if (btnLoginModal) {
        btnLoginModal.addEventListener('click', abrirModalAdmin);
    }

    if (closeModal) {
        closeModal.addEventListener('click', cerrarModalAdmin);
    }

    if (formAdmin) {
        formAdmin.addEventListener('submit', (e) => {
            e.preventDefault();

            const user = document.getElementById('user-admin').value;
            const pass = document.getElementById('pass-admin').value;

            if (user === 'admin' && pass === '2026') {
                sesionIniciada = true;
cargarDatosAdministrador();
                document.getElementById('admin-msg')
                        .classList.add('hidden');

                cerrarModalAdmin();
                formAdmin.reset();

                if (btnLoginModal) {
                    btnLoginModal.classList.add('hidden');
                }

                if (btnCerrarAdmin) {
                    btnCerrarAdmin.classList.remove('hidden');
                }

                if (seccionHero) {
                    seccionHero.classList.add('hidden-section');
                }

                if (galeriaDestinos) {
                    galeriaDestinos.classList.add('hidden-section');
                }

                if (seccionAdminDashboard) {
                    seccionAdminDashboard.classList.remove('hidden-section');

                    seccionAdminDashboard.scrollIntoView({
                        behavior: 'smooth'
                    });
                }

            } else {
                document.getElementById('admin-msg')
                        .classList.remove('hidden');
            }
        });
    }

    // Cerrar sesión del administrador
    const accionCerrarAdmin = () => {
        sesionIniciada = false;

        regresarMenuAdmin();

        if (btnCerrarAdmin) {
            btnCerrarAdmin.classList.add('hidden');
        }

        if (btnLoginModal) {
            btnLoginModal.classList.remove('hidden');
        }

        if (seccionAdminDashboard) {
            seccionAdminDashboard.classList.add('hidden-section');
        }

        if (seccionHero) {
            seccionHero.classList.remove('hidden-section');
        }
    };

    if (btnCerrarAdmin) {
        btnCerrarAdmin.addEventListener('click', accionCerrarAdmin);
    }

    const btnCerrarPanelSplit =
            document.getElementById('btn-cerrar-admin-panel');

    if (btnCerrarPanelSplit) {
        btnCerrarPanelSplit.addEventListener('click', accionCerrarAdmin);
    }

    // Acceso al cotizador
    const btnVerTarifasGate =
            document.getElementById('btn-ver-tarifas-gate');

    const seccionTarifas =
            document.getElementById('seccion-tarifas');

    if (btnVerTarifasGate) {
        btnVerTarifasGate.addEventListener('click', () => {

            if (!sesionIniciada) {
                alert('Debe crear una cuenta o iniciar sesión para ver las tarifas y cotizar.');
                abrirModalCuenta();

            } else {
                if (seccionTarifas) {
                    seccionTarifas.classList.remove('hidden-section');

                    actualizarPanelTarifas();

                    seccionTarifas.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    }

    // Actualizar tarifas cuando cambien las opciones
    const selectDestino = document.getElementById('select-destino');

    if (selectDestino) {
        selectDestino.addEventListener(
                'change', actualizarPanelTarifas
        );
    }

    const inputsCotizador = document.querySelectorAll(
            '#num-adultos, #num-ninos, #select-edad-ninos, input[name="paquete"]'
    );

    inputsCotizador.forEach(input => {
        input.addEventListener(
                input.tagName === 'SELECT' ? 'change' : 'input',
                calcularTotalCotizacion
        );
    });

    // Modal de registro de pasajeros
    const btnReservarFinal =
            document.getElementById('btn-reservar-final');

    const modalRegistro =
            document.getElementById('modal-registro');

    const closeModalRegistro =
            document.getElementById('close-modal-registro');

    const modalEvaluacion =
            document.getElementById('modal-evaluacion');

    const abrirModalRegistro = () => {
        if (modalRegistro) {
            modalRegistro.classList.remove('hidden');
        }

        // Mantener sincronizada la cantidad de niños
        const numNinos = parseInt(
                document.getElementById('num-ninos').value
        ) || 0;

        const inputCount = document.getElementById('inputCount');

        if (inputCount) {
            inputCount.value = numNinos;
            inputCount.dispatchEvent(new Event('input'));
        }
    };

    const cerrarModalRegistro = () => {
        if (modalRegistro) {
            modalRegistro.classList.add('hidden');
        }
    };

    if (btnReservarFinal) {
        btnReservarFinal.addEventListener('click', abrirModalRegistro);
    }

    if (closeModalRegistro) {
        closeModalRegistro.addEventListener('click', cerrarModalRegistro);
    }

    window.addEventListener('click', (e) => {
        if (e.target === modalRegistro) cerrarModalRegistro();
        if (e.target === modalAdmin) cerrarModalAdmin();
        if (e.target === modalCuenta) cerrarModalCuenta();
    });


    // Contador dinámico de niños
    const inputCount = document.getElementById('inputCount');
    const childDataContainer =
            document.getElementById('childDataContainer');

    if (inputCount && childDataContainer) {
        inputCount.addEventListener('input', function () {

            const count = parseInt(this.value) || 0;
            childDataContainer.innerHTML = '';

            for (let i = 1; i <= count; i++) {

                const childBox = document.createElement('div');
                childBox.className = 'child-record-box';

                childBox.innerHTML = `
                    <h4>Niño ${i}</h4>

                    <div class="form-row-custom">
                        <div class="form-group-custom">
                            <label>Nombre:</label>
                            <input type="text"
                                   class="input-crema"
                                   name="minorName[]"
                                   required>
                        </div>

                        <div class="form-group-custom">
                            <label>CUI:</label>
                            <input type="text"
                                   class="input-crema"
                                   name="minorCui[]"
                                   maxlength="13"
                                   required>
                        </div>

                        <div class="form-group-custom">
                            <label>Fecha de nacimiento:</label>
                            <input type="date"
                                   class="input-crema"
                                   name="minorBirth[]"
                                   required>
                        </div>
                    </div>
                `;

                childDataContainer.appendChild(childBox);
            }
        });
    }

    // Registro del pasajero y guardado en MySQL
    const passengerForm = document.getElementById('passengerForm');

    if (passengerForm) {
        passengerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nombre = document.getElementById('fullName').value.trim();
            const dpi = document.getElementById('dpi').value.trim();
            const pasaporte =
                    document.getElementById('passport').value.trim();

            const email = document.getElementById('email').value.trim();
            const telefono = document.getElementById('phone').value.trim();

            const numAdultos = parseInt(
                    document.getElementById('num-adultos').value
            ) || 1;

            const numNinos = parseInt(
                    document.getElementById('num-ninos').value
            ) || 0;

            const nombresNinos = document.querySelectorAll(
                    'input[name="minorName[]"]'
            );

            const cuiNinos = document.querySelectorAll(
                    'input[name="minorCui[]"]'
            );

            const nacimientosNinos = document.querySelectorAll(
                    'input[name="minorBirth[]"]'
            );

            // Comprobar que coincida la cantidad de niños
            if (nombresNinos.length !== numNinos) {
                alert("La cantidad de niños no coincide con la cotización.");
                return;
            }

            // Obtener ruta y servicio seleccionados
            const claveDestino = selectDestino.value;

            const paqueteSeleccionado = document.querySelector(
                    'input[name="paquete"]:checked'
            );

            const tipoPaquete = paqueteSeleccionado
                    ? paqueteSeleccionado.value
                    : 'basico';

            const nombresServicios = {
                basico: "Servicio Básico LULA",
                ejecutivo: "Servicio Ejecutivo",
                vip: "LULA VIP Premium"
            };

            const tipoServicio = nombresServicios[tipoPaquete];

            // Calcular el precio real
            calcularTotalCotizacion();

            const textoTotal = document.getElementById(
                    'total-cotizado'
            ).innerText;

            const montoTotal = parseFloat(
                    textoTotal.replace(/[^0-9.]/g, '')
            );

            if (!Number.isFinite(montoTotal)) {
                alert("No se pudo calcular el monto de la reserva.");
                return;
            }

            // Generar un único código de ticket
            const codigoTicket = "LULA-"
                    + Date.now()
                    + "-"
                    + Math.floor(Math.random() * 10000);

            const fechaViaje = new Date().toLocaleDateString('en-CA');

            // Guardar datos para generar el boleto
            reservaTemporal = {
                codigoTicket: codigoTicket,
                nombre: nombre,
                dpi: dpi || pasaporte,
                email: email,
                telefono: telefono,
                numAdultos: numAdultos,
                numNinos: numNinos,
                claveDestino: claveDestino,
                tipoPaquete: tipoPaquete,
                tipoServicio: tipoServicio,
                montoTotal: montoTotal,
                fechaViaje: fechaViaje
            };

            // Preparar datos para el servlet
            const datosReserva = new URLSearchParams();

            datosReserva.append(
                    "codigo_ticket", codigoTicket
            );

            datosReserva.append(
                    "nombre_titular", nombre
            );

            datosReserva.append(
                    "dpi_pasaporte", dpi || pasaporte
            );

            datosReserva.append(
                    "email", email
            );

            datosReserva.append(
                    "telefono", telefono
            );

            datosReserva.append(
                    "ruta", claveDestino
            );

            datosReserva.append(
                    "tipo_servicio", tipoServicio
            );

            datosReserva.append(
                    "monto_total", montoTotal.toFixed(2)
            );

            datosReserva.append(
                    "fecha_viaje", fechaViaje
            );

            // Enviar cantidad de niños
            datosReserva.append(
                    "total_pasajeros", nombresNinos.length
            );

            // Enviar información de cada niño
            nombresNinos.forEach((input, i) => {

                datosReserva.append(
                        "pasajero_" + i + "_tipo",
                        "Niño"
                );

                datosReserva.append(
                        "pasajero_" + i + "_nombre",
                        input.value.trim()
                );

                datosReserva.append(
                        "pasajero_" + i + "_cui",
                        cuiNinos[i].value.trim()
                );

                datosReserva.append(
                        "pasajero_" + i + "_nacimiento",
                        nacimientosNinos[i].value
                );
            });

            // Guardar reserva y niños en MySQL
            try {
                const respuesta = await fetch(
                        "GuardarReservaServlet",
                        {
                            method: "POST",
                            body: datosReserva
                        }
                );

                if (!respuesta.ok) {
                    throw new Error(
                            "Error HTTP: " + respuesta.status
                    );
                }

                const data = await respuesta.json();

                console.log("Respuesta de MySQL:", data);

                if (data.status === "success") {

                    idReservaGuardada = data.id_reserva;

                    alert("¡Reserva guardada con éxito!");

                    cerrarModalRegistro();

                    if (modalEvaluacion) {
                        modalEvaluacion.classList.remove('hidden');
                    }

                } else {
                    alert(
                            "Error al guardar la reserva: "
                            + data.message
                    );
                }

            } catch (error) {
                console.error(
                        "Error al guardar la reserva:", error
                );

                alert(
                        "No se pudo guardar la reserva en MySQL. "
                        + "Revisa la conexión con el servidor."
                );
            }
        });
    }

    // Paso 2: Evaluación y generación del boleto
    const formSatisfaccion = document.getElementById('form-satisfaccion');
    const seccionBoleto = document.getElementById('seccion-boleto');

    if (formSatisfaccion) {
        formSatisfaccion.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Obtener las respuestas de la evaluación
            const p1_radio = document.querySelector(
                    'input[name="eval_p1"]:checked'
            )?.value || "N/A";

            const p2_select =
                    document.getElementById('eval_p2').value;

            const p3_checkboxes = Array.from(
                    document.querySelectorAll(
                            'input[name="eval_p3"]:checked'
                    )
            ).map(cb => cb.value).join(', ') || "Ninguno";

            const p4_range = parseInt(
                    document.getElementById('eval_p4').value
            ) || 8;

            const p5_number = parseInt(
                    document.getElementById('eval_p5').value
            ) || 1;

            const p6_textarea =
                    document.getElementById('eval_p6').value.trim()
                    || "Sin comentarios";

            // Preparar datos de la evaluación para MySQL
            const datosEvaluacion = new URLSearchParams();

            datosEvaluacion.append(
                    "id_reserva", idReservaGuardada
            );

            datosEvaluacion.append(
                    "usabilidad_p1", p1_radio
            );

            datosEvaluacion.append(
                    "motivo_p2", p2_select
            );

            datosEvaluacion.append(
                    "aspectos_p3", p3_checkboxes
            );

            datosEvaluacion.append(
                    "nps_p4", p4_range
            );

            datosEvaluacion.append(
                    "frecuencia_p5", p5_number
            );

            datosEvaluacion.append(
                    "comentarios_p6", p6_textarea
            );

            // Guardar evaluación en MySQL
            try {
                if (!idReservaGuardada) {
                    alert("Primero debes guardar una reserva.");
                    return;
                }

                const respuesta = await fetch(
                        "GuardarEvaluacionServlet",
                        {
                            method: "POST",
                            body: datosEvaluacion
                        }
                );

                if (!respuesta.ok) {
                    throw new Error(
                            "Error HTTP: " + respuesta.status
                    );
                }

                const data = await respuesta.json();

                if (data.status !== "success") {
                    alert(
                            "Error al guardar la evaluación: "
                            + data.message
                    );
                    return;
                }

            } catch (error) {
                console.error(
                        "Error al guardar la evaluación:", error
                );

                alert(
                        "No se pudo guardar la evaluación en MySQL."
                );
                return;
            }

            // Preparar información del boleto
            const ruta = datosRutas[reservaTemporal.claveDestino];

            const totalPasajeros =
                    reservaTemporal.numAdultos
                    + reservaTemporal.numNinos;

            const textoPasajeros =
                    `${reservaTemporal.numAdultos} Adulto(s), `
                    + `${reservaTemporal.numNinos} Niño(s)`;

            const asientoInicial = Math.floor(
                    1 + Math.random() * Math.max(1, 31 - totalPasajeros)
            );

            let textoAsientosTabla = "";
            let textoAsientosStub = "";
            let etiquetaAsientoStub = "ASIENTO";

            if (totalPasajeros === 1) {
                textoAsientosTabla =
                        `Vagón A - Asiento ${asientoInicial}`;

                textoAsientosStub = `${asientoInicial}`;

            } else {
                const asientoFinal =
                        asientoInicial + totalPasajeros - 1;

                textoAsientosTabla =
                        `Vagón A - Asientos ${asientoInicial} al ${asientoFinal}`;

                textoAsientosStub =
                        `${asientoInicial} - ${asientoFinal}`;

                etiquetaAsientoStub = "ASIENTOS";
            }

            // Utilizar el mismo servicio y código guardados
            const tipoServicioText = reservaTemporal.tipoServicio;

            const total =
                    `Q ${reservaTemporal.montoTotal.toFixed(2)}`;

            const ticketId = reservaTemporal.codigoTicket;

            const fechaHoy = new Date().toLocaleDateString('es-GT');

            // Registro temporal para el panel de administrador
            const nuevoRegistroBD = {
                codigoTicket: ticketId,
                nombre: reservaTemporal.nombre,
                dpi: reservaTemporal.dpi,
                ruta: `${ruta.origen} ➔ ${ruta.destino}`,
                pasajerosDetalle: textoPasajeros,
                asientos: textoAsientosTabla,
                montoTotal: total,
                fechaEmision: fechaHoy,
                encuesta: {
                    usabilidad: p1_radio,
                    motivo: p2_select,
                    aspectos: p3_checkboxes,
                    nps: p4_range,
                    frecuencia: p5_number,
                    comentarios: p6_textarea
                }
            };

            baseDatosVentas.push(nuevoRegistroBD);
generarDiploma(
    reservaTemporal.nombre,
    reservaTemporal.codigoTicket,
    p4_range
);
            // Mostrar sección del boleto
            if (modalEvaluacion) {
                modalEvaluacion.classList.add('hidden');
            }

            if (seccionTarifas) {
                seccionTarifas.classList.add('hidden-section');
            }

            if (galeriaDestinos) {
                galeriaDestinos.classList.add('hidden-section');
            }

            if (seccionBoleto) {
                seccionBoleto.classList.remove('hidden-section');
            }

            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

            // AQUÍ CONTINÚA EL HTML ORIGINAL DEL BOLETO

            document.getElementById('area-ticket-imprimir').innerHTML = `
                <div class="ticket-boarding-card">
                    <div class="ticket-main-section">
                        <div class="ticket-header-blue">
                            <div class="ticket-logo-circle">
                                <img src="imagenes/lulatren_logo.png" alt="LULATRÉN" onerror="this.src='https://via.placeholder.com/50?text=LULA'">
                            </div>
                            <div class="ticket-header-title">
                                <h2>LULATRÉN GUATEMALA</h2>
                                <span>BOLETO DE ABORDAJE OFICIAL</span>
                            </div>
                        </div>

                        <div class="ticket-table-container">
                            <table class="ticket-table">
                                <tr>
                                    <td colspan="2">
                                        <div class="cell-data">
                                            <label>Titular de la Reserva:</label>
                                            <strong>${reservaTemporal.nombre}</strong>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="cell-data">
                                            <label>DPI / Pasaporte:</label>
                                            <strong>${reservaTemporal.dpi}</strong>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="2">
                                        <div class="cell-data">
                                            <label>Ruta:</label>
                                            <strong>${ruta.origen} ➔ ${ruta.destino}</strong>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="cell-data">
                                            <label>Distancia:</label>
                                            <strong>${ruta.distancia}</strong>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div class="cell-data">
                                            <label>Fecha de Viaje:</label>
                                            <strong>${fechaHoy}</strong>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="cell-data">
                                            <label>Hora de Salida:</label>
                                            <strong>${ruta.horarios[0]}</strong>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="cell-data">
                                            <label>Vagón / Asientos:</label>
                                            <strong>${textoAsientosTabla}</strong>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="2">
                                        <div class="cell-data">
                                            <label>Detalle de Pasajeros:</label>
                                            <strong>${textoPasajeros} (${totalPasajeros} Persona/s)</strong>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="cell-data">
                                            <label>Servicio:</label>
                                            <strong>${tipoServicioText}</strong>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="2">
                                        <div class="cell-data">
                                            <label>NIT FEL:</label>
                                            <strong>1234567-K</strong>
                                        </div>
                                    </td>
                                    <td class="highlight-total">
                                        <div class="cell-data">
                                            <label>Monto Total:</label>
                                            <strong>${total}</strong>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>

                    <div class="ticket-stub-section">
                        <div class="stub-header">
                            <img src="imagenes/lulatren_logo.png" alt="LULATRÉN" class="stub-logo" onerror="this.src='https://via.placeholder.com/40?text=LULA'">
                            <span class="stub-title">TICKET ABORDAJE</span>
                        </div>

                        <div class="stub-seat-info">
                            <span class="seat-label">${etiquetaAsientoStub}</span>
                            <span class="seat-number" style="font-size: ${totalPasajeros > 1 ? '1.8rem' : '2.4rem'}">${textoAsientosStub}</span>
                            <span class="vagon-label">VAGÓN A</span>
                        </div>

                        <div class="stub-qr-box">
                            <img src="${ruta.qr}" alt="Código QR Turístico" onerror="this.src='https://via.placeholder.com/100?text=QR+LULA'">
                            <span class="qr-verified-tag">✓ [ESCANEAR VIDEO]</span>
                        </div>

                        <div class="stub-footer-info">
                            <p><strong>N° TICKET:</strong> ${ticketId}</p>
                            <p><strong>FECHA:</strong> ${fechaHoy}</p>
                            <p class="stub-guau">LULATRÉN les desea un guau viaje!</p>
                        </div>
                    </div>
                </div>
            `;
        });
    }
        // Botón para imprimir únicamente el diploma
    const btnImprimirDiploma =
            document.getElementById('btn-imprimir-diploma');

    if (btnImprimirDiploma) {
        btnImprimirDiploma.addEventListener('click', imprimirDiploma);
    }
    // Botón para realizar una nueva reserva
    const btnNuevaReserva = document.getElementById('btn-nueva-reserva');

    if (btnNuevaReserva) {
        btnNuevaReserva.addEventListener('click', () => {

            if (seccionBoleto) {
                seccionBoleto.classList.add('hidden-section');
            }

            if (galeriaDestinos) {
                galeriaDestinos.classList.remove('hidden-section');
            }

            if (seccionTarifas) {
                seccionTarifas.classList.remove('hidden-section');

                seccionTarifas.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    }

});
