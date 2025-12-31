/**
 * NEXUS PROTOCOL - Motor de Juego de Tanques
 * Sistema de juego con tanques, disparos, colisiones y multijugador
 */

function JuegoTanques() {
    // Referencias
    this.canvas = null;
    this.ctx = null;
    this.ws = null;
    this.cw = null;
    
    // Estado del juego
    this.miTanque = null;
    this.tanquesEnemigos = {};
    this.proyectiles = [];
    this.obstaculos = [];
    this.particulas = [];
    this.powerUps = [];
    
    // Configuración
    this.anchoCampo = 1200;
    this.altoCampo = 800;
    this.codigoPartida = null;
    this.jugadorId = null;
    this.modo = null;
    
    // Control de tiempo
    this.tiempoInicio = null;
    this.ultimoFrame = Date.now();
    this.fps = 60;
    this.intervaloJuego = null;
    
    // Estadísticas
    this.enemigosNeutralizados = 0;
    this.datosRecopilados = 0;
    this.vidas = 3;
    this.juegoTerminado = false;
    
    // Controles
    this.teclas = {};
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseClick = false;
}

// =============== TIPOS DE TANQUES ===============
JuegoTanques.prototype.tiposTanques = {
    rapido: {
        nombre: "RAYO",
        icono: "⚡",
        color: "#ff1493", // Rosa fuerte
        velocidad: 4,
        vida: 80,
        cadenciaDisparo: 300,
        dañoProyectil: 15,
        tamañoProyectil: 4,
        descripcion: "Veloz y ágil, ideal para ataques rápidos"
    },
    pesado: {
        nombre: "TITÁN",
        icono: "🛡️",
        color: "#9d4edd", // Morado
        velocidad: 2,
        vida: 150,
        cadenciaDisparo: 600,
        dañoProyectil: 30,
        tamañoProyectil: 6,
        descripcion: "Resistente y poderoso, disparo devastador"
    },
    equilibrado: {
        nombre: "NEXUS",
        icono: "⭐",
        color: "#ff6b35", // Naranja
        velocidad: 3,
        vida: 100,
        cadenciaDisparo: 400,
        dañoProyectil: 20,
        tamañoProyectil: 5,
        descripcion: "Balance perfecto entre velocidad y potencia"
    },
    francotirador: {
        nombre: "VIPER",
        icono: "🎯",
        color: "#ff69b4", // Rosa claro
        velocidad: 2.5,
        vida: 90,
        cadenciaDisparo: 800,
        dañoProyectil: 40,
        tamañoProyectil: 3,
        descripcion: "Disparo preciso y letal a larga distancia"
    }
};

// =============== CLASE TANQUE ===============
function Tanque(x, y, tipo, id, esJugador) {
    const config = JuegoTanques.prototype.tiposTanques[tipo];
    
    this.x = x;
    this.y = y;
    this.ancho = 40;
    this.alto = 40;
    this.angulo = 0;
    this.tipo = tipo;
    this.id = id;
    this.esJugador = esJugador || false;
    
    // Propiedades del tipo
    this.velocidad = config.velocidad;
    this.vidaMaxima = config.vida;
    this.vida = config.vida;
    this.color = config.color;
    this.cadenciaDisparo = config.cadenciaDisparo;
    this.dañoProyectil = config.dañoProyectil;
    this.tamañoProyectil = config.tamañoProyectil;
    this.nombre = config.nombre;
    
    // Estado
    this.ultimoDisparo = 0;
    this.invulnerable = false;
    this.tiempoInvulnerable = 0;
    
    // Movimiento
    this.velocidadX = 0;
    this.velocidadY = 0;
}

Tanque.prototype.actualizar = function(teclas, mouseX, mouseY) {
    // Movimiento con WASD o flechas
    this.velocidadX = 0;
    this.velocidadY = 0;
    
    if (teclas['w'] || teclas['ArrowUp']) this.velocidadY = -this.velocidad;
    if (teclas['s'] || teclas['ArrowDown']) this.velocidadY = this.velocidad;
    if (teclas['a'] || teclas['ArrowLeft']) this.velocidadX = -this.velocidad;
    if (teclas['d'] || teclas['ArrowRight']) this.velocidadX = this.velocidad;
    
    // Normalizar movimiento diagonal
    if (this.velocidadX !== 0 && this.velocidadY !== 0) {
        this.velocidadX *= 0.707;
        this.velocidadY *= 0.707;
    }
    
    this.x += this.velocidadX;
    this.y += this.velocidadY;
    
    // Límites del campo
    this.x = Math.max(this.ancho/2, Math.min(1200 - this.ancho/2, this.x));
    this.y = Math.max(this.alto/2, Math.min(800 - this.alto/2, this.y));
    
    // Rotación hacia el mouse
    if (mouseX && mouseY) {
        this.angulo = Math.atan2(mouseY - this.y, mouseX - this.x);
    }
    
    // Actualizar invulnerabilidad
    if (this.invulnerable) {
        this.tiempoInvulnerable--;
        if (this.tiempoInvulnerable <= 0) {
            this.invulnerable = false;
        }
    }
};

Tanque.prototype.dibujar = function(ctx, offsetX, offsetY) {
    ctx.save();
    ctx.translate(this.x - offsetX, this.y - offsetY);
    ctx.rotate(this.angulo);
    
    // Sombra
    ctx.shadowColor = this.color;
    ctx.shadowBlur = this.invulnerable ? 20 : 10;
    
    // Cuerpo del tanque
    ctx.fillStyle = this.invulnerable ? '#fff' : this.color;
    ctx.fillRect(-this.ancho/2, -this.alto/2, this.ancho, this.alto);
    
    // Borde brillante
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(-this.ancho/2, -this.alto/2, this.ancho, this.alto);
    
    // Cañón
    ctx.fillStyle = this.invulnerable ? this.color : '#fff';
    ctx.fillRect(0, -5, this.ancho/2 + 10, 10);
    
    // Torreta
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // Barra de vida
    if (this.vida < this.vidaMaxima) {
        const barraAncho = this.ancho;
        const barraAlto = 4;
        const barraY = this.y - this.alto/2 - 10 - offsetY;
        const barraX = this.x - barraAncho/2 - offsetX;
        
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(barraX, barraY, barraAncho, barraAlto);
        
        const vidaPorcentaje = this.vida / this.vidaMaxima;
        ctx.fillStyle = vidaPorcentaje > 0.5 ? '#00ff00' : vidaPorcentaje > 0.25 ? '#ffff00' : '#ff0000';
        ctx.fillRect(barraX, barraY, barraAncho * vidaPorcentaje, barraAlto);
    }
    
    // Nombre
    if (!this.esJugador) {
        ctx.fillStyle = '#fff';
        ctx.font = '12px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(this.id, this.x - offsetX, this.y - this.alto/2 - 20 - offsetY);
    }
};

Tanque.prototype.disparar = function() {
    const ahora = Date.now();
    if (ahora - this.ultimoDisparo < this.cadenciaDisparo) return null;
    
    this.ultimoDisparo = ahora;
    
    const proyectil = {
        x: this.x + Math.cos(this.angulo) * (this.ancho/2 + 15),
        y: this.y + Math.sin(this.angulo) * (this.ancho/2 + 15),
        velocidadX: Math.cos(this.angulo) * 8,
        velocidadY: Math.sin(this.angulo) * 8,
        tamaño: this.tamañoProyectil,
        daño: this.dañoProyectil,
        color: this.color,
        dueño: this.id,
        tipo: this.tipo
    };
    
    return proyectil;
};

Tanque.prototype.recibirDaño = function(daño) {
    if (this.invulnerable) return false;
    
    this.vida -= daño;
    if (this.vida <= 0) {
        this.vida = 0;
        return true; // Tanque destruido
    }
    
    // Invulnerabilidad temporal
    this.invulnerable = true;
    this.tiempoInvulnerable = 30; // 0.5 segundos a 60fps
    
    return false;
};

// =============== INICIALIZACIÓN ===============
JuegoTanques.prototype.iniciar = function(canvasId, modo, tipoTanque, codigoPartida, jugadorId, ws, cw) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
        console.error('Canvas no encontrado');
        return;
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.modo = modo;
    this.codigoPartida = codigoPartida;
    this.jugadorId = jugadorId;
    this.ws = ws;
    this.cw = cw;
    
    // Configurar tamaño del canvas
    this.canvas.width = 1000;
    this.canvas.height = 600;
    
    // Crear mi tanque
    const posX = 100 + Math.random() * 200;
    const posY = 100 + Math.random() * 200;
    this.miTanque = new Tanque(posX, posY, tipoTanque, jugadorId, true);
    
    // Generar obstáculos
    this.generarObstaculos();
    
    // Configurar controles
    this.configurarControles();
    
    // Iniciar loop del juego
    this.tiempoInicio = Date.now();
    this.juegoTerminado = false;
    this.bucleJuego();
    
    console.log('[JUEGO] Iniciado - Modo:', modo, 'Tanque:', tipoTanque);
};

JuegoTanques.prototype.generarObstaculos = function() {
    const numObstaculos = 15;
    for (let i = 0; i < numObstaculos; i++) {
        this.obstaculos.push({
            x: Math.random() * (this.anchoCampo - 100) + 50,
            y: Math.random() * (this.altoCampo - 100) + 50,
            ancho: 50 + Math.random() * 50,
            alto: 50 + Math.random() * 50,
            color: '#6a0dad' // Morado oscuro
        });
    }
};

JuegoTanques.prototype.configurarControles = function() {
    const juego = this;
    
    // Teclado
    document.addEventListener('keydown', function(e) {
        juego.teclas[e.key.toLowerCase()] = true;
        juego.teclas[e.key] = true;
    });
    
    document.addEventListener('keyup', function(e) {
        juego.teclas[e.key.toLowerCase()] = false;
        juego.teclas[e.key] = false;
    });
    
    // Mouse
    this.canvas.addEventListener('mousemove', function(e) {
        const rect = juego.canvas.getBoundingClientRect();
        const offsetX = juego.miTanque.x - juego.canvas.width / 2;
        const offsetY = juego.miTanque.y - juego.canvas.height / 2;
        
        juego.mouseX = e.clientX - rect.left + offsetX;
        juego.mouseY = e.clientY - rect.top + offsetY;
    });
    
    this.canvas.addEventListener('click', function(e) {
        if (juego.juegoTerminado) return;
        const proyectil = juego.miTanque.disparar();
        if (proyectil) {
            juego.proyectiles.push(proyectil);
            juego.crearParticulas(proyectil.x, proyectil.y, proyectil.color, 5);
            
            // Enviar disparo por WebSocket
            if (juego.ws && juego.ws.socket) {
                juego.ws.socket.emit('disparoRealizado', {
                    codigo: juego.codigoPartida,
                    proyectil: proyectil
                });
            }
        }
    });
};

// =============== BUCLE PRINCIPAL ===============
JuegoTanques.prototype.bucleJuego = function() {
    if (this.juegoTerminado) return;
    
    const juego = this;
    requestAnimationFrame(function() {
        juego.bucleJuego();
    });
    
    const ahora = Date.now();
    const delta = ahora - this.ultimoFrame;
    
    if (delta < 1000 / this.fps) return;
    
    this.ultimoFrame = ahora - (delta % (1000 / this.fps));
    
    this.actualizar();
    this.dibujar();
};

JuegoTanques.prototype.actualizar = function() {
    // Actualizar mi tanque
    if (this.miTanque && this.miTanque.vida > 0) {
        this.miTanque.actualizar(this.teclas, this.mouseX, this.mouseY);
        
        // Enviar posición por WebSocket
        if (this.ws && this.ws.socket && Math.random() < 0.1) { // 10% de las veces
            this.ws.socket.emit('actualizarPosicion', {
                codigo: this.codigoPartida,
                x: this.miTanque.x,
                y: this.miTanque.y,
                angulo: this.miTanque.angulo,
                vida: this.miTanque.vida
            });
        }
    }
    
    // Actualizar tanques enemigos (IA simple o datos de red)
    for (let id in this.tanquesEnemigos) {
        const enemigo = this.tanquesEnemigos[id];
        if (enemigo.vida <= 0) continue;
        
        // IA simple: moverse hacia el jugador
        if (this.modo === 'individual' && this.miTanque) {
            const dx = this.miTanque.x - enemigo.x;
            const dy = this.miTanque.y - enemigo.y;
            const distancia = Math.sqrt(dx * dx + dy * dy);
            
            if (distancia > 200) {
                enemigo.x += (dx / distancia) * enemigo.velocidad * 0.5;
                enemigo.y += (dy / distancia) * enemigo.velocidad * 0.5;
            }
            
            enemigo.angulo = Math.atan2(dy, dx);
            
            // Disparar ocasionalmente
            if (Math.random() < 0.02 && distancia < 400) {
                const proyectil = enemigo.disparar();
                if (proyectil) {
                    this.proyectiles.push(proyectil);
                }
            }
        }
    }
    
    // Actualizar proyectiles
    for (let i = this.proyectiles.length - 1; i >= 0; i--) {
        const p = this.proyectiles[i];
        p.x += p.velocidadX;
        p.y += p.velocidadY;
        
        // Eliminar si sale del campo
        if (p.x < 0 || p.x > this.anchoCampo || p.y < 0 || p.y > this.altoCampo) {
            this.proyectiles.splice(i, 1);
            continue;
        }
        
        // Colisión con mi tanque
        if (this.miTanque && p.dueño !== this.jugadorId) {
            if (this.colisionCirculoRectangulo(p, this.miTanque)) {
                const destruido = this.miTanque.recibirDaño(p.daño);
                this.crearParticulas(p.x, p.y, p.color, 10);
                this.proyectiles.splice(i, 1);
                
                if (destruido) {
                    this.finalizarJuego(false);
                }
                continue;
            }
        }
        
        // Colisión con enemigos
        for (let id in this.tanquesEnemigos) {
            const enemigo = this.tanquesEnemigos[id];
            if (p.dueño === id || enemigo.vida <= 0) continue;
            
            if (this.colisionCirculoRectangulo(p, enemigo)) {
                const destruido = enemigo.recibirDaño(p.daño);
                this.crearParticulas(p.x, p.y, enemigo.color, 15);
                this.proyectiles.splice(i, 1);
                
                if (destruido && p.dueño === this.jugadorId) {
                    this.enemigosNeutralizados++;
                    this.datosRecopilados += 10;
                    
                    // Verificar victoria en modo individual
                    if (this.modo === 'individual') {
                        const enemigosVivos = Object.values(this.tanquesEnemigos).filter(e => e.vida > 0).length;
                        if (enemigosVivos === 0) {
                            this.datosRecopilados = 100;
                            this.finalizarJuego(true);
                        }
                    }
                }
                break;
            }
        }
        
        // Colisión con obstáculos
        for (let obs of this.obstaculos) {
            if (this.colisionCirculoRectangulo(p, obs)) {
                this.crearParticulas(p.x, p.y, obs.color, 8);
                this.proyectiles.splice(i, 1);
                break;
            }
        }
    }
    
    // Actualizar partículas
    for (let i = this.particulas.length - 1; i >= 0; i--) {
        const part = this.particulas[i];
        part.x += part.vx;
        part.y += part.vy;
        part.vida--;
        part.alpha = part.vida / part.vidaMax;
        
        if (part.vida <= 0) {
            this.particulas.splice(i, 1);
        }
    }
};

JuegoTanques.prototype.dibujar = function() {
    const ctx = this.ctx;
    
    // Calcular offset de la cámara (seguir al jugador)
    const offsetX = this.miTanque ? this.miTanque.x - this.canvas.width / 2 : 0;
    const offsetY = this.miTanque ? this.miTanque.y - this.canvas.height / 2 : 0;
    
    // Fondo
    ctx.fillStyle = '#0a0520'; // Morado muy oscuro
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Grid
    ctx.strokeStyle = 'rgba(157, 78, 221, 0.1)'; // Morado claro transparente
    ctx.lineWidth = 1;
    const gridSize = 50;
    const startX = -(offsetX % gridSize);
    const startY = -(offsetY % gridSize);
    
    for (let x = startX; x < this.canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, this.canvas.height);
        ctx.stroke();
    }
    
    for (let y = startY; y < this.canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.canvas.width, y);
        ctx.stroke();
    }
    
    // Obstáculos
    for (let obs of this.obstaculos) {
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x - offsetX, obs.y - offsetY, obs.ancho, obs.alto);
        ctx.strokeStyle = '#9d4edd';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x - offsetX, obs.y - offsetY, obs.ancho, obs.alto);
    }
    
    // Tanques enemigos
    for (let id in this.tanquesEnemigos) {
        const enemigo = this.tanquesEnemigos[id];
        if (enemigo.vida > 0) {
            enemigo.dibujar(ctx, offsetX, offsetY);
        }
    }
    
    // Mi tanque
    if (this.miTanque && this.miTanque.vida > 0) {
        this.miTanque.dibujar(ctx, offsetX, offsetY);
    }
    
    // Proyectiles
    for (let p of this.proyectiles) {
        ctx.beginPath();
        ctx.arc(p.x - offsetX, p.y - offsetY, p.tamaño, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    
    // Partículas
    for (let part of this.particulas) {
        ctx.globalAlpha = part.alpha;
        ctx.beginPath();
        ctx.arc(part.x - offsetX, part.y - offsetY, part.tamaño, 0, Math.PI * 2);
        ctx.fillStyle = part.color;
        ctx.fill();
    }
    ctx.globalAlpha = 1;
    
    // HUD
    this.dibujarHUD();
};

JuegoTanques.prototype.dibujarHUD = function() {
    const ctx = this.ctx;
    
    // Panel superior
    ctx.fillStyle = 'rgba(10, 5, 32, 0.8)';
    ctx.fillRect(0, 0, this.canvas.width, 60);
    
    // Vida
    ctx.fillStyle = '#ff1493'; // Rosa
    ctx.font = '16px Courier New';
    ctx.fillText('VIDA:', 20, 25);
    
    const vidaPorcentaje = this.miTanque ? this.miTanque.vida / this.miTanque.vidaMaxima : 0;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(20, 35, 200, 15);
    ctx.fillStyle = vidaPorcentaje > 0.5 ? '#00ff00' : vidaPorcentaje > 0.25 ? '#ffff00' : '#ff0000';
    ctx.fillRect(20, 35, 200 * vidaPorcentaje, 15);
    
    // Enemigos neutralizados
    ctx.fillStyle = '#ff6b35'; // Naranja
    ctx.font = '16px Courier New';
    ctx.fillText('ENEMIGOS: ' + this.enemigosNeutralizados, 250, 25);
    
    // Datos recopilados
    ctx.fillStyle = '#9d4edd'; // Morado
    ctx.fillText('DATOS: ' + Math.min(100, this.datosRecopilados) + '%', 250, 45);
    
    // Tiempo
    if (this.tiempoInicio) {
        const tiempoTranscurrido = Math.floor((Date.now() - this.tiempoInicio) / 1000);
        const minutos = Math.floor(tiempoTranscurrido / 60);
        const segundos = tiempoTranscurrido % 60;
        const tiempoStr = String(minutos).padStart(2, '0') + ':' + String(segundos).padStart(2, '0');
        
        ctx.fillStyle = '#ff69b4'; // Rosa claro
        ctx.fillText('TIEMPO: ' + tiempoStr, this.canvas.width - 150, 30);
    }
    
    // Controles
    ctx.fillStyle = 'rgba(157, 78, 221, 0.6)';
    ctx.font = '12px Courier New';
    ctx.fillText('WASD: Mover | Mouse: Apuntar | Click: Disparar', 20, this.canvas.height - 10);
};

// =============== UTILIDADES ===============
JuegoTanques.prototype.colisionCirculoRectangulo = function(circulo, rectangulo) {
    const cercanoX = Math.max(rectangulo.x - rectangulo.ancho/2, Math.min(circulo.x, rectangulo.x + rectangulo.ancho/2));
    const cercanoY = Math.max(rectangulo.y - rectangulo.alto/2, Math.min(circulo.y, rectangulo.y + rectangulo.alto/2));
    
    const distanciaX = circulo.x - cercanoX;
    const distanciaY = circulo.y - cercanoY;
    
    return (distanciaX * distanciaX + distanciaY * distanciaY) < (circulo.tamaño * circulo.tamaño);
};

JuegoTanques.prototype.crearParticulas = function(x, y, color, cantidad) {
    for (let i = 0; i < cantidad; i++) {
        this.particulas.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            tamaño: Math.random() * 3 + 1,
            color: color,
            vida: Math.random() * 30 + 20,
            vidaMax: 50,
            alpha: 1
        });
    }
};

JuegoTanques.prototype.agregarTanqueEnemigo = function(id, tipo, x, y) {
    this.tanquesEnemigos[id] = new Tanque(x, y, tipo, id, false);
};

JuegoTanques.prototype.actualizarTanqueEnemigo = function(id, x, y, angulo, vida) {
    if (this.tanquesEnemigos[id]) {
        this.tanquesEnemigos[id].x = x;
        this.tanquesEnemigos[id].y = y;
        this.tanquesEnemigos[id].angulo = angulo;
        this.tanquesEnemigos[id].vida = vida;
    }
};

JuegoTanques.prototype.finalizarJuego = function(ganaste) {
    this.juegoTerminado = true;
    
    // Calcular estadísticas
    const tiempoFin = Date.now();
    const tiempoTranscurrido = tiempoFin - this.tiempoInicio;
    const minutos = Math.floor(tiempoTranscurrido / 60000);
    const segundos = Math.floor((tiempoTranscurrido % 60000) / 1000);
    const tiempoStr = String(minutos).padStart(2, '0') + ':' + String(segundos).padStart(2, '0');
    
    const estadisticas = {
        enemigosNeutralizados: this.enemigosNeutralizados,
        tiempo: tiempoStr,
        datosRecopilados: ganaste ? 100 : Math.min(100, this.datosRecopilados)
    };
    
    // Notificar al servidor
    if (this.ws && this.ws.socket) {
        this.ws.socket.emit('partidaFinalizada', {
            codigo: this.codigoPartida,
            ganaste: ganaste,
            estadisticas: estadisticas
        });
    }
    
    // Mostrar pantalla de resultado
    setTimeout(() => {
        if (ganaste) {
            this.cw.mostrarVictoriaNexus(estadisticas);
        } else {
            this.cw.mostrarDerrotaNexus(estadisticas);
        }
    }, 2000);
};

// Modo individual: generar enemigos IA
JuegoTanques.prototype.generarEnemigosIA = function(cantidad) {
    const tipos = ['rapido', 'pesado', 'equilibrado', 'francotirador'];
    
    for (let i = 0; i < cantidad; i++) {
        const tipo = tipos[Math.floor(Math.random() * tipos.length)];
        const x = Math.random() * (this.anchoCampo - 200) + 100;
        const y = Math.random() * (this.altoCampo - 200) + 100;
        const id = 'IA_' + i;
        
        this.agregarTanqueEnemigo(id, tipo, x, y);
    }
};
