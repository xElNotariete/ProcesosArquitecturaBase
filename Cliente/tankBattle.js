/**
 * TANK BATTLE - Juego estilo Bomberman con tanques
 * Vista top-down con laberinto, power-ups y combate estratégico
 */

function TankBattle() {
    // Canvas y contexto
    this.canvas = null;
    this.ctx = null;
    
    // Configuración del juego (responsive)
    this.tamañoCelda = 50;
    this.filas = 13;
    this.columnas = 15;
    this.ancho = 0; // Se calculará dinámicamente
    this.alto = 0;  // Se calculará dinámicamente
    
    // Estado del juego
    this.jugador = null;
    this.enemigos = [];
    this.proyectiles = [];
    this.explosiones = [];
    this.powerUps = [];
    this.particulas = [];
    this.mapa = [];
    
    // Multijugador
    this.esMultijugador = false;
    this.jugadoresRemoto = {};
    this.codigoPartida = null;
    this.ws = null;
    
    // Control
    this.teclas = {};
    this.juegoActivo = true;
    this.nivel = 1;
    this.puntuacion = 0;
    this.tiempoInicio = null;
    this.ultimoFrame = 0;
    this.fps = 60;
    
    // Tipos de celdas
    this.VACIO = 0;
    this.PARED_SOLIDA = 1;
    this.PARED_DESTRUCTIBLE = 2;
    
    // Power-ups
    this.POWERUP_VELOCIDAD = 1;
    this.POWERUP_DISPARO = 2;
    this.POWERUP_VIDA = 3;
    this.POWERUP_ESCUDO = 4;
    this.POWERUP_DISPARO_MULTIPLE = 5;
    this.POWERUP_BOMBA = 6;
    
    // Colores (rosa/morado/naranja)
    this.colores = {
        fondo: '#0a0520',
        paredSolida: '#6a0dad',
        paredDestructible: '#9d4edd',
        jugador: '#ff1493',
        enemigo1: '#ff6b35',
        enemigo2: '#ff69b4',
        proyectil: '#ff1493',
        explosion: '#ff6b35',
        powerUp: '#9d4edd'
    };
}

// =============== CLASES AUXILIARES ===============

function Tanque(x, y, color, esJugador) {
    this.x = x;
    this.y = y;
    this.tamaño = 40;
    this.color = color;
    this.esJugador = esJugador;
    this.tipo = 'equilibrado'; // Por defecto
    this.velocidad = 2;
    this.vida = 3;
    this.vidaMaxima = 3;
    this.direccion = 0; // 0=derecha, 1=abajo, 2=izquierda, 3=arriba
    this.angulo = 0; // Ángulo en radianes para IA
    this.cadenciaDisparo = 500;
    this.ultimoDisparo = 0;
    this.velocidadProyectil = 6;
    this.alcanceProyectil = 400;
    this.dañoProyectil = 1;
    this.disparoMultiple = false;
    this.escudo = false;
    this.tiempoEscudo = 0;
    this.invulnerable = false;
    this.tiempoInvulnerable = 0;
    this.puedeColocarBomba = false;
    this.radioBomba = 2;
    this.bombas = 1; // Cantidad de bombas disponibles
    
    // IA mejorada
    this.modoIA = 'agresivo'; // 'agresivo', 'defensivo', 'esquivo'
    this.objetivo = null;
    this.rutaIA = [];
    this.tiempoDecisionIA = 0;
    this.ultimaCambioIA = 0;
    this.distanciaSegura = 200;
}

Tanque.prototype.mover = function(dx, dy, mapa, tamañoCelda) {
    const nuevoX = this.x + dx;
    const nuevoY = this.y + dy;
    
    // Actualizar dirección
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) this.direccion = 0;
        else if (dx < 0) this.direccion = 2;
    } else {
        if (dy > 0) this.direccion = 1;
        else if (dy < 0) this.direccion = 3;
    }
    
    // Actualizar ángulo
    if (dx !== 0 || dy !== 0) {
        this.angulo = Math.atan2(dy, dx);
    }
    
    // Verificar colisiones
    if (!this.colisionaConMapa(nuevoX, nuevoY, mapa, tamañoCelda)) {
        this.x = nuevoX;
        this.y = nuevoY;
        return true;
    }
    return false;
};

Tanque.prototype.colisionaConMapa = function(x, y, mapa, tamañoCelda) {
    const margen = this.tamaño / 2;
    const puntos = [
        {x: x - margen, y: y - margen},
        {x: x + margen, y: y - margen},
        {x: x - margen, y: y + margen},
        {x: x + margen, y: y + margen}
    ];
    
    for (let punto of puntos) {
        const col = Math.floor(punto.x / tamañoCelda);
        const fila = Math.floor(punto.y / tamañoCelda);
        
        if (fila < 0 || fila >= mapa.length || col < 0 || col >= mapa[0].length) {
            return true;
        }
        
        if (mapa[fila][col] === 1 || mapa[fila][col] === 2) {
            return true;
        }
    }
    
    return false;
};

Tanque.prototype.disparar = function() {
    const ahora = Date.now();
    if (ahora - this.ultimoDisparo < this.cadenciaDisparo) return null;
    
    this.ultimoDisparo = ahora;
    
    const offset = 25;
    const proyectiles = [];
    
    const direcciones = [
        {dx: 1, dy: 0},   // derecha
        {dx: 0, dy: 1},   // abajo
        {dx: -1, dy: 0},  // izquierda
        {dx: 0, dy: -1}   // arriba
    ];
    
    const dir = direcciones[this.direccion];
    
    // Disparo principal
    proyectiles.push({
        x: this.x + dir.dx * offset,
        y: this.y + dir.dy * offset,
        vx: dir.dx * this.velocidadProyectil,
        vy: dir.dy * this.velocidadProyectil,
        tamaño: 6,
        color: this.color,
        dueño: this,
        alcance: this.alcanceProyectil,
        distanciaRecorrida: 0,
        daño: this.dañoProyectil
    });
    
    // Disparo múltiple
    if (this.disparoMultiple) {
        const perpendicular = [
            {dx: dir.dy, dy: -dir.dx},
            {dx: -dir.dy, dy: dir.dx}
        ];
        
        for (let perp of perpendicular) {
            proyectiles.push({
                x: this.x + perp.dx * 15 + dir.dx * offset,
                y: this.y + perp.dy * 15 + dir.dy * offset,
                vx: dir.dx * this.velocidadProyectil,
                vy: dir.dy * this.velocidadProyectil,
                tamaño: 5,
                color: this.color,
                dueño: this,
                alcance: this.alcanceProyectil,
                distanciaRecorrida: 0,
                daño: this.dañoProyectil
            });
        }
    }
    
    return proyectiles;
};

Tanque.prototype.dispararPorAngulo = function(angulo) {
    const ahora = Date.now();
    if (ahora - this.ultimoDisparo < this.cadenciaDisparo) return null;
    
    this.ultimoDisparo = ahora;
    
    const offset = 25;
    const proyectiles = [];
    
    const dx = Math.cos(angulo);
    const dy = Math.sin(angulo);
    
    // Disparo principal
    proyectiles.push({
        x: this.x + dx * offset,
        y: this.y + dy * offset,
        vx: dx * this.velocidadProyectil,
        vy: dy * this.velocidadProyectil,
        tamaño: 6,
        color: this.color,
        dueño: this,
        alcance: this.alcanceProyectil,
        distanciaRecorrida: 0,
        daño: this.dañoProyectil
    });
    
    // Disparo múltiple
    if (this.disparoMultiple) {
        const angulos = [angulo - Math.PI/6, angulo + Math.PI/6];
        for (let ang of angulos) {
            const dx2 = Math.cos(ang);
            const dy2 = Math.sin(ang);
            proyectiles.push({
                x: this.x + dx2 * offset,
                y: this.y + dy2 * offset,
                vx: dx2 * this.velocidadProyectil,
                vy: dy2 * this.velocidadProyectil,
                tamaño: 5,
                color: this.color,
                dueño: this,
                alcance: this.alcanceProyectil,
                distanciaRecorrida: 0,
                daño: this.dañoProyectil
            });
        }
    }
    
    return proyectiles;
};

Tanque.prototype.colocarBomba = function() {
    if (!this.puedeColocarBomba) return null;
    
    return {
        x: this.x,
        y: this.y,
        radio: this.radioBomba,
        tiempo: 3000,
        tiempoColocada: Date.now(),
        color: this.color
    };
};

Tanque.prototype.recibirDaño = function(daño) {
    if (this.invulnerable || this.escudo) return false;
    
    this.vida -= daño;
    if (this.vida <= 0) {
        this.vida = 0;
        return true; // Destruido
    }
    
    this.invulnerable = true;
    this.tiempoInvulnerable = 60; // 1 segundo
    return false;
};

Tanque.prototype.aplicarPowerUp = function(tipo) {
    switch(tipo) {
        case 1: // VELOCIDAD
            this.velocidad = Math.min(4, this.velocidad + 0.5);
            break;
        case 2: // DISPARO RÁPIDO
            this.cadenciaDisparo = Math.max(200, this.cadenciaDisparo - 100);
            break;
        case 3: // VIDA
            this.vida = Math.min(this.vidaMaxima + 1, this.vida + 1);
            this.vidaMaxima++;
            break;
        case 4: // ESCUDO
            this.escudo = true;
            this.tiempoEscudo = 300; // 5 segundos
            break;
        case 5: // DISPARO MÚLTIPLE
            this.disparoMultiple = true;
            break;
        case 6: // BOMBA
            this.puedeColocarBomba = true;
            this.radioBomba = Math.min(4, this.radioBomba + 1);
            break;
    }
};

Tanque.prototype.actualizar = function() {
    if (this.invulnerable) {
        this.tiempoInvulnerable--;
        if (this.tiempoInvulnerable <= 0) {
            this.invulnerable = false;
        }
    }
    
    if (this.escudo) {
        this.tiempoEscudo--;
        if (this.tiempoEscudo <= 0) {
            this.escudo = false;
        }
    }
};

Tanque.prototype.dibujar = function(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Escudo
    if (this.escudo) {
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, this.tamaño / 2 + 8, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Parpadeo si es invulnerable
    if (this.invulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.globalAlpha = 0.5;
    }
    
    // Rotar según dirección o ángulo (para IA)
    if (this.esJugador) {
        ctx.rotate(this.direccion * Math.PI / 2);
    } else {
        // Para enemigos, rotar visualmente hacia donde están mirando
        ctx.rotate(this.angulo);
    }
    
    // Sombra del tanque
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;
    
    // Adaptar apariencia según tipo
    let tamañoCuerpo = this.tamaño;
    let anchoOrugas = 7;
    let longitudCañon = 18;
    
    if (this.tipo === 'rapido') {
        // Tanque más pequeño y aerodinámico
        tamañoCuerpo = this.tamaño * 0.9;
        anchoOrugas = 5;
        longitudCañon = 15;
    } else if (this.tipo === 'pesado') {
        // Tanque más grande y robusto
        tamañoCuerpo = this.tamaño * 1.1;
        anchoOrugas = 9;
        longitudCañon = 20;
    } else if (this.tipo === 'francotirador') {
        // Tanque normal con cañón largo
        longitudCañon = 25;
        anchoOrugas = 6;
    }
    
    // Cuerpo principal del tanque
    ctx.fillStyle = this.color;
    ctx.fillRect(-tamañoCuerpo/2 + 3, -tamañoCuerpo/2 + 5, tamañoCuerpo - 6, tamañoCuerpo - 10);
    
    // Orugas
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(-tamañoCuerpo/2, -tamañoCuerpo/2 + 3, tamañoCuerpo, anchoOrugas);
    ctx.fillRect(-tamañoCuerpo/2, tamañoCuerpo/2 - anchoOrugas - 3, tamañoCuerpo, anchoOrugas);
    
    // Detalles de las orugas
    ctx.fillStyle = '#1a1a1a';
    for (let i = -tamañoCuerpo/2; i < tamañoCuerpo/2; i += 8) {
        ctx.fillRect(i, -tamañoCuerpo/2 + 4, 6, anchoOrugas - 2);
        ctx.fillRect(i, tamañoCuerpo/2 - anchoOrugas - 2, 6, anchoOrugas - 2);
    }
    
    // Borde del cuerpo
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 0;
    ctx.strokeRect(-tamañoCuerpo/2 + 3, -tamañoCuerpo/2 + 5, tamañoCuerpo - 6, tamañoCuerpo - 10);
    
    // Torreta (tamaño según tipo)
    let radioTorreta = this.tipo === 'pesado' ? 16 : (this.tipo === 'rapido' ? 12 : 14);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, 0, radioTorreta, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 0;
    ctx.stroke();
    
    // Cañón principal (longitud según tipo)
    ctx.fillStyle = '#333';
    ctx.shadowBlur = 0;
    ctx.fillRect(0, -4, longitudCañon, 8);
    
    // Brillo del cañón
    ctx.fillStyle = '#555';
    ctx.fillRect(0, -3, 18, 3);
    
    // Cúpula superior
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // Barra de vida (siempre mostrar para enemigos)
    if (!this.esJugador || this.vida < this.vidaMaxima) {
        const barraAncho = this.tamaño;
        const barraAlto = 6;
        const offsetY = this.tamaño/2 + 12;
        
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(this.x - barraAncho/2, this.y - offsetY, barraAncho, barraAlto);
        
        const porcentaje = Math.max(0, this.vida / this.vidaMaxima);
        ctx.fillStyle = porcentaje > 0.5 ? '#00ff00' : porcentaje > 0.25 ? '#ffaa00' : '#ff0000';
        ctx.fillRect(this.x - barraAncho/2 + 1, this.y - offsetY + 1, (barraAncho - 2) * porcentaje, barraAlto - 2);
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x - barraAncho/2, this.y - offsetY, barraAncho, barraAlto);
    }
};

// =============== INICIALIZACIÓN ===============

TankBattle.prototype.iniciar = function(canvasId, esMultijugador, codigoPartida, modo) {
    console.log('[TankBattle] Iniciando juego...', {esMultijugador, codigoPartida, modo});
    
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
        console.error('[TankBattle] Canvas no encontrado:', canvasId);
        return;
    }
    console.log('[TankBattle] Canvas encontrado');
    
    this.ctx = this.canvas.getContext('2d');
    this.esMultijugador = esMultijugador || false;
    this.codigoPartida = codigoPartida || null;
    this.modo = modo || 'individual';
    
    // Configurar tamaño responsive
    this.ajustarTamañoCanvas();
    window.addEventListener('resize', () => this.ajustarTamañoCanvas());
    
    this.tiempoInicio = Date.now();
    this.generarMapa();
    console.log('[TankBattle] Mapa generado');
    
    this.crearJugador();
    console.log('[TankBattle] Jugador creado');
    
    // CRITICAL FIX: Solo crear enemigos IA en modo individual
    // En modos multijugador (1vs1 y todos-contra-todos), los enemigos son jugadores humanos
    if (this.modo === 'individual') {
        this.crearEnemigos(3);
        console.log('[TankBattle] Enemigos IA creados:', this.enemigos.length);
    } else {
        console.log('[TankBattle] Modo multijugador - esperando jugadores humanos (sin IA)');
    }
    
    this.configurarControles();
    console.log('[TankBattle] Controles configurados');
    
    // Configurar WebSocket si es multijugador
    if (this.esMultijugador && this.ws) {
        this.configurarWebSocket();
        console.log('[TankBattle] WebSocket configurado');
    }
    
    this.bucleJuego();
    console.log('[TankBattle] Bucle de juego iniciado');
};

TankBattle.prototype.ajustarTamañoCanvas = function() {
    // Calcular tamaño del canvas basado en el grid
    this.ancho = this.columnas * this.tamañoCelda;
    this.alto = this.filas * this.tamañoCelda;
    
    this.canvas.width = this.ancho;
    this.canvas.height = this.alto;
    
    console.log('[Canvas] Tamaño ajustado:', this.ancho, 'x', this.alto);
};

TankBattle.prototype.configurarWebSocket = function() {
    if (!this.ws) return;
    
    const juego = this;
    
    // Recibir estado del juego
    this.ws.on('estadoJuego', function(data) {
        if (data.codigoPartida !== juego.codigoPartida) return;
        
        // Actualizar jugadores remotos
        juego.jugadoresRemoto = data.jugadores.filter(j => j.id !== juego.jugador.id);
    });
    
    // Nuevo jugador se une
    this.ws.on('jugadorUnido', function(data) {
        if (data.codigoPartida !== juego.codigoPartida) return;
        console.log('Jugador unido:', data.jugador.nombre);
    });
    
    // Jugador se desconecta
    this.ws.on('jugadorDesconectado', function(data) {
        if (data.codigoPartida !== juego.codigoPartida) return;
        juego.jugadoresRemoto = juego.jugadoresRemoto.filter(j => j.id !== data.jugadorId);
    });
    
    // Recibir disparos de otros jugadores
    this.ws.on('disparo', function(data) {
        if (data.codigoPartida !== juego.codigoPartida) return;
        if (data.jugadorId === juego.jugador.id) return;
        
        // Crear proyectiles del jugador remoto
        const proyectil = {
            x: data.x,
            y: data.y,
            vx: data.vx,
            vy: data.vy,
            tamaño: data.tamaño,
            color: data.color,
            daño: data.daño,
            alcance: data.alcance,
            distanciaRecorrida: 0,
            dueño: { esJugador: false, id: data.jugadorId }
        };
        juego.proyectiles.push(proyectil);
    });
};

TankBattle.prototype.enviarEstado = function() {
    if (!this.esMultijugador || !this.ws || !this.jugador) return;
    
    this.ws.emit('actualizarPosicion', {
        codigoPartida: this.codigoPartida,
        x: this.jugador.x,
        y: this.jugador.y,
        angulo: this.jugador.angulo,
        vida: this.jugador.vida
    });
};

TankBattle.prototype.generarMapa = function() {
    this.mapa = [];
    
    for (let f = 0; f < this.filas; f++) {
        this.mapa[f] = [];
        for (let c = 0; c < this.columnas; c++) {
            // Bordes siempre sólidos
            if (f === 0 || f === this.filas - 1 || c === 0 || c === this.columnas - 1) {
                this.mapa[f][c] = this.PARED_SOLIDA;
            }
            // Patrón de paredes sólidas (estilo Bomberman)
            else if (f % 2 === 0 && c % 2 === 0) {
                this.mapa[f][c] = this.PARED_SOLIDA;
            }
            // Áreas seguras para spawn
            else if ((f <= 2 && c <= 2) || (f <= 2 && c >= this.columnas - 3) ||
                     (f >= this.filas - 3 && c <= 2) || (f >= this.filas - 3 && c >= this.columnas - 3)) {
                this.mapa[f][c] = this.VACIO;
            }
            // Paredes destructibles aleatorias
            else if (Math.random() < 0.5) {
                this.mapa[f][c] = this.PARED_DESTRUCTIBLE;
            }
            else {
                this.mapa[f][c] = this.VACIO;
            }
        }
    }
};

TankBattle.prototype.crearJugador = function() {
    const x = this.tamañoCelda * 1.5;
    const y = this.tamañoCelda * 1.5;
    this.jugador = new Tanque(x, y, this.colores.jugador, true);
};

TankBattle.prototype.crearEnemigos = function(cantidad) {
    // Spawns en 3 esquinas (dejando una libre para el jugador)
    const spawns = [
        {c: this.columnas - 2, f: 1},           // Esquina superior derecha
        {c: 1, f: this.filas - 2},              // Esquina inferior izquierda
        {c: this.columnas - 2, f: this.filas - 2} // Esquina inferior derecha
    ];
    
    const coloresEnemigos = [
        this.colores.enemigo1,
        this.colores.enemigo2,
        '#ff6b35'
    ];
    
    for (let i = 0; i < Math.min(cantidad, 3); i++) {
        const spawn = spawns[i];
        const x = this.tamañoCelda * (spawn.c + 0.5);
        const y = this.tamañoCelda * (spawn.f + 0.5);
        const color = coloresEnemigos[i];
        const enemigo = new Tanque(x, y, color, false);
        enemigo.velocidad = 1.8 + Math.random() * 0.4; // Más rápidos (1.8-2.2)
        enemigo.cadenciaDisparo = 500 + Math.random() * 200; // Disparan más (500-700ms)
        enemigo.vida = 3 + i; // Cada enemigo más resistente
        enemigo.vidaMaxima = 3 + i;
        this.enemigos.push(enemigo);
        console.log('[TankBattle] Enemigo', i+1, 'creado en:', x, y, 'Vida:', enemigo.vida);
    }
};

TankBattle.prototype.configurarControles = function() {
    const juego = this;
    
    document.addEventListener('keydown', function(e) {
        juego.teclas[e.key.toLowerCase()] = true;
        juego.teclas[e.key] = true;
        
        // Disparar con espacio
        if (e.key === ' ' && juego.jugador && juego.juegoActivo) {
            e.preventDefault();
            const proyectiles = juego.jugador.disparar();
            if (proyectiles) {
                juego.proyectiles.push(...proyectiles);
                juego.crearParticulas(juego.jugador.x, juego.jugador.y, juego.jugador.color, 5);
            }
        }
        
        // Colocar bomba con B
        if (e.key.toLowerCase() === 'b' && juego.jugador && juego.juegoActivo) {
            const bomba = juego.jugador.colocarBomba();
            if (bomba) {
                juego.explosiones.push(bomba);
            }
        }
    });
    
    document.addEventListener('keyup', function(e) {
        juego.teclas[e.key.toLowerCase()] = false;
        juego.teclas[e.key] = false;
    });
};

// =============== BUCLE PRINCIPAL ===============

TankBattle.prototype.bucleJuego = function() {
    if (!this.juegoActivo) return;
    
    const juego = this;
    requestAnimationFrame(function() {
        juego.bucleJuego();
    });
    
    // Limitar FPS para evitar que se vuelva loco
    const ahora = Date.now();
    const delta = ahora - this.ultimoFrame;
    
    if (delta > 1000 / this.fps) {
        this.ultimoFrame = ahora - (delta % (1000 / this.fps));
        this.actualizar();
        this.dibujar();
    }
};

// =============== IA MEJORADA ===============

TankBattle.prototype.actualizarIAEnemigo = function(enemigo) {
    if (!this.jugador || this.jugador.vida <= 0) return;
    
    const ahora = Date.now();
    
    // Actualizar decisión cada cierto tiempo
    if (!enemigo.tiempoDecisionIA || ahora - enemigo.ultimaCambioIA > enemigo.tiempoDecisionIA) {
        enemigo.ultimaCambioIA = ahora;
        enemigo.tiempoDecisionIA = 500 + Math.random() * 1000; // 0.5-1.5 segundos
        
        // Calcular distancia y dirección al jugador
        const dx = this.jugador.x - enemigo.x;
        const dy = this.jugador.y - enemigo.y;
        const distancia = Math.hypot(dx, dy);
        const angulo = Math.atan2(dy, dx);
        
        // Evaluar amenazas (proyectiles cercanos)
        let amenazaCercana = false;
        let direccionEscape = null;
        
        for (let p of this.proyectiles) {
            if (p.dueño === enemigo) continue;
            const distProyectil = Math.hypot(p.x - enemigo.x, p.y - enemigo.y);
            
            if (distProyectil < 100) {
                amenazaCercana = true;
                // Escapar perpendicular a la dirección del proyectil
                const anguloProyectil = Math.atan2(p.vy, p.vx);
                direccionEscape = anguloProyectil + Math.PI / 2;
                break;
            }
        }
        
        // Evaluar bombas cercanas
        for (let bomba of this.explosiones) {
            const distBomba = Math.hypot(bomba.x - enemigo.x, bomba.y - enemigo.y);
            if (distBomba < 150) {
                amenazaCercana = true;
                const anguloBomba = Math.atan2(bomba.y - enemigo.y, bomba.x - enemigo.x);
                direccionEscape = anguloBomba + Math.PI; // Escapar en dirección opuesta
                break;
            }
        }
        
        // Determinar modo de IA
        if (amenazaCercana) {
            enemigo.modoIA = 'evasion';
            enemigo.objetivo = direccionEscape;
        } else if (distancia < enemigo.distanciaSegura) {
            // Muy cerca: retroceder y disparar
            enemigo.modoIA = 'retroceder';
            enemigo.objetivo = angulo + Math.PI; // Dirección opuesta
        } else if (distancia > 400) {
            // Muy lejos: acercarse
            enemigo.modoIA = 'perseguir';
            enemigo.objetivo = angulo;
        } else {
            // Distancia óptima: atacar con movimiento lateral
            enemigo.modoIA = 'atacar';
            enemigo.objetivo = angulo + (Math.random() < 0.5 ? Math.PI/2 : -Math.PI/2);
        }
    }
    
    // Ejecutar comportamiento según modo
    if (enemigo.modoIA === 'evasion') {
        // Movimiento evasivo en 4 direcciones
        const angulo = enemigo.objetivo;
        const direccion = this.anguloADireccion(angulo);
        const movimientos = [
            {dx: enemigo.velocidad * 2, dy: 0},  // derecha
            {dx: 0, dy: enemigo.velocidad * 2},  // abajo
            {dx: -enemigo.velocidad * 2, dy: 0}, // izquierda
            {dx: 0, dy: -enemigo.velocidad * 2}  // arriba
        ];
        
        const mov = movimientos[direccion];
        if (!enemigo.mover(mov.dx, mov.dy, this.mapa, this.tamañoCelda)) {
            // Si no puede moverse, probar otra dirección
            const direccionAlternativa = (direccion + 1) % 4;
            const movAlt = movimientos[direccionAlternativa];
            enemigo.mover(movAlt.dx, movAlt.dy, this.mapa, this.tamañoCelda);
        }
    } 
    else if (enemigo.modoIA === 'perseguir') {
        // Movimiento hacia el jugador solo en 4 direcciones
        const angulo = enemigo.objetivo;
        const direccion = this.anguloADireccion(angulo);
        const movimientos = [
            {dx: enemigo.velocidad, dy: 0},  // derecha
            {dx: 0, dy: enemigo.velocidad},  // abajo
            {dx: -enemigo.velocidad, dy: 0}, // izquierda
            {dx: 0, dy: -enemigo.velocidad}  // arriba
        ];
        
        const mov = movimientos[direccion];
        if (!enemigo.mover(mov.dx, mov.dy, this.mapa, this.tamañoCelda)) {
            // Intentar direcciones alternativas (perpendiculares)
            const alternativas = [(direccion + 1) % 4, (direccion + 3) % 4];
            for (let alt of alternativas) {
                const movAlt = movimientos[alt];
                if (enemigo.mover(movAlt.dx, movAlt.dy, this.mapa, this.tamañoCelda)) {
                    break;
                }
            }
        }
    }
    else if (enemigo.modoIA === 'retroceder') {
        // Retroceder en 4 direcciones
        const angulo = enemigo.objetivo;
        const direccion = this.anguloADireccion(angulo);
        const movimientos = [
            {dx: enemigo.velocidad, dy: 0},
            {dx: 0, dy: enemigo.velocidad},
            {dx: -enemigo.velocidad, dy: 0},
            {dx: 0, dy: -enemigo.velocidad}
        ];
        const mov = movimientos[direccion];
        enemigo.mover(mov.dx, mov.dy, this.mapa, this.tamañoCelda);
    }
    else if (enemigo.modoIA === 'atacar') {
        // Movimiento lateral en 4 direcciones
        const angulo = enemigo.objetivo;
        const direccion = this.anguloADireccion(angulo);
        const movimientos = [
            {dx: enemigo.velocidad, dy: 0},
            {dx: 0, dy: enemigo.velocidad},
            {dx: -enemigo.velocidad, dy: 0},
            {dx: 0, dy: -enemigo.velocidad}
        ];
        const mov = movimientos[direccion];
        if (!enemigo.mover(mov.dx, mov.dy, this.mapa, this.tamañoCelda)) {
            // Cambiar a dirección perpendicular
            enemigo.objetivo += Math.PI / 2;
        }
    }
    
    // Decisión de disparo inteligente (solo en 4 direcciones)
    const dx = this.jugador.x - enemigo.x;
    const dy = this.jugador.y - enemigo.y;
    const distancia = Math.hypot(dx, dy);
    const anguloAlJugador = Math.atan2(dy, dx);
    
    // Convertir ángulo a dirección discreta
    const direccionAlJugador = this.anguloADireccion(anguloAlJugador);
    const angulosDiscretos = [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2]; // derecha, abajo, izquierda, arriba
    const anguloDisparo = angulosDiscretos[direccionAlJugador];
    
    // Calcular diferencia entre dirección actual y dirección al jugador
    const direccionActual = enemigo.direccion;
    const diffDireccion = Math.abs(direccionAlJugador - direccionActual);
    
    // Disparar si está mirando hacia el jugador y está en rango
    if (diffDireccion === 0 && distancia < 600 && distancia > 30) {
        if (Math.random() < 0.1) { // 10% de probabilidad
            const proyectiles = enemigo.disparar(); // Usa el método normal que ya usa direccion
            if (proyectiles) {
                this.proyectiles.push(...proyectiles);
            }
        }
    }
    
    // Usar bombas estratégicamente si el jugador está cerca de paredes
    if (enemigo.bombas > 0 && distancia < 150) {
        if (Math.random() < 0.01) {
            const bomba = enemigo.colocarBomba();
            if (bomba) {
                this.explosiones.push(bomba);
                enemigo.bombas--;
            }
        }
    }
    
    // Actualizar dirección para apuntar al jugador (solo 4 direcciones)
    const direccionDeseada = this.anguloADireccion(anguloAlJugador);
    
    // Cambiar dirección gradualmente
    if (enemigo.direccion !== direccionDeseada) {
        // Determinar si girar en sentido horario o antihorario
        const diff = (direccionDeseada - enemigo.direccion + 4) % 4;
        if (diff === 1 || diff === 2) {
            enemigo.direccion = (enemigo.direccion + 1) % 4;
        } else if (diff === 3) {
            enemigo.direccion = (enemigo.direccion + 3) % 4;
        }
    }
    
    // Actualizar ángulo visual para que coincida con la dirección
    const angulosVisuales = [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2];
    enemigo.angulo = angulosVisuales[enemigo.direccion];
};

TankBattle.prototype.anguloADireccion = function(angulo) {
    // Convertir ángulo a una de las 4 direcciones
    // 0: derecha, 1: abajo, 2: izquierda, 3: arriba
    const normalizado = ((angulo % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
    
    if (normalizado < Math.PI / 4 || normalizado >= 7 * Math.PI / 4) {
        return 0; // derecha
    } else if (normalizado >= Math.PI / 4 && normalizado < 3 * Math.PI / 4) {
        return 1; // abajo
    } else if (normalizado >= 3 * Math.PI / 4 && normalizado < 5 * Math.PI / 4) {
        return 2; // izquierda
    } else {
        return 3; // arriba
    }
};

TankBattle.prototype.actualizar = function() {
    // Actualizar jugador
    if (this.jugador && this.jugador.vida > 0) {
        let dx = 0, dy = 0;
        
        if (this.teclas['w'] || this.teclas['ArrowUp']) dy = -this.jugador.velocidad;
        if (this.teclas['s'] || this.teclas['ArrowDown']) dy = this.jugador.velocidad;
        if (this.teclas['a'] || this.teclas['ArrowLeft']) dx = -this.jugador.velocidad;
        if (this.teclas['d'] || this.teclas['ArrowRight']) dx = this.jugador.velocidad;
        
        if (dx !== 0 || dy !== 0) {
            this.jugador.mover(dx, dy, this.mapa, this.tamañoCelda);
        }
        
        this.jugador.actualizar();
        
        // Enviar estado si es multijugador
        if (this.esMultijugador) {
            this.enviarEstado();
        }
        
        // Colisión con power-ups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const pu = this.powerUps[i];
            const dist = Math.hypot(this.jugador.x - pu.x, this.jugador.y - pu.y);
            if (dist < 30) {
                this.jugador.aplicarPowerUp(pu.tipo);
                this.powerUps.splice(i, 1);
                this.puntuacion += 50;
                this.crearParticulas(pu.x, pu.y, pu.color, 15);
            }
        }
    }
    
    // Actualizar enemigos (IA mejorada)
    for (let enemigo of this.enemigos) {
        if (enemigo.vida <= 0) continue;
        
        enemigo.actualizar();
        this.actualizarIAEnemigo(enemigo);
    }
    
    // Actualizar proyectiles
    for (let i = this.proyectiles.length - 1; i >= 0; i--) {
        const p = this.proyectiles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.distanciaRecorrida += Math.hypot(p.vx, p.vy);
        
        // Eliminar si excede alcance
        if (p.distanciaRecorrida > p.alcance) {
            this.proyectiles.splice(i, 1);
            continue;
        }
        
        // Colisión con paredes
        const col = Math.floor(p.x / this.tamañoCelda);
        const fila = Math.floor(p.y / this.tamañoCelda);
        
        if (fila >= 0 && fila < this.filas && col >= 0 && col < this.columnas) {
            if (this.mapa[fila][col] === this.PARED_SOLIDA) {
                this.proyectiles.splice(i, 1);
                this.crearParticulas(p.x, p.y, p.color, 8);
                continue;
            } else if (this.mapa[fila][col] === this.PARED_DESTRUCTIBLE) {
                this.mapa[fila][col] = this.VACIO;
                this.proyectiles.splice(i, 1);
                this.crearParticulas(p.x, p.y, this.colores.paredDestructible, 15);
                this.puntuacion += 10;
                
                // Chance de spawn power-up
                if (Math.random() < 0.3) {
                    this.crearPowerUp(col * this.tamañoCelda + this.tamañoCelda/2, 
                                     fila * this.tamañoCelda + this.tamañoCelda/2);
                }
                continue;
            }
        }
        
        // Colisión con jugador
        if (this.jugador && !p.dueño.esJugador) {
            const dist = Math.hypot(this.jugador.x - p.x, this.jugador.y - p.y);
            if (dist < 25) {
                const destruido = this.jugador.recibirDaño(p.daño);
                this.proyectiles.splice(i, 1);
                this.crearParticulas(p.x, p.y, p.color, 12);
                
                if (destruido) {
                    console.log('[TankBattle] GAME OVER');
                    setTimeout(() => this.gameOver(false), 500);
                }
                continue;
            }
        }
        
        // Colisión con enemigos
        if (p.dueño.esJugador) {
            for (let j = 0; j < this.enemigos.length; j++) {
                const enemigo = this.enemigos[j];
                if (enemigo.vida <= 0) continue;
                
                const dist = Math.hypot(enemigo.x - p.x, enemigo.y - p.y);
                if (dist < 25) {
                    const destruido = enemigo.recibirDaño(p.daño);
                    this.proyectiles.splice(i, 1);
                    this.crearParticulas(p.x, p.y, enemigo.color, 15);
                    this.puntuacion += 20;
                    
                    if (destruido) {
                        this.puntuacion += 100;
                        enemigo.vida = 0; // Asegurar que está muerto
                        
                        // Verificar victoria
                        const enemigosVivos = this.enemigos.filter(e => e.vida > 0).length;
                        console.log('[TankBattle] Enemigos restantes:', enemigosVivos);
                        if (enemigosVivos === 0) {
                            console.log('[TankBattle] ¡VICTORIA!');
                            setTimeout(() => this.gameOver(true), 500);
                        }
                    }
                    break;
                }
            }
        }
    }
    
    // Actualizar bombas
    for (let i = this.explosiones.length - 1; i >= 0; i--) {
        const bomba = this.explosiones[i];
        const tiempoTranscurrido = Date.now() - bomba.tiempoColocada;
        
        if (tiempoTranscurrido >= bomba.tiempo) {
            this.explosiones.splice(i, 1);
            this.crearExplosion(bomba.x, bomba.y, bomba.radio);
        }
    }
    
    // Verificar colisiones entre jugador y enemigos
    if (this.jugador && this.jugador.vida > 0) {
        for (let i = 0; i < this.enemigos.length; i++) {
            const enemigo = this.enemigos[i];
            if (enemigo.vida <= 0) continue;
            
            const dist = Math.hypot(this.jugador.x - enemigo.x, this.jugador.y - enemigo.y);
            const radioColision = 35; // Radio de colisión entre tanques
            
            if (dist < radioColision) {
                // Efecto visual de colisión
                this.crearParticulas(this.jugador.x, this.jugador.y, '#ff0000', 8);
                
                // Quitar vida al jugador
                const destruido = this.jugador.recibirDaño(1);
                
                // Empujar tanques en direcciones opuestas para separarlos
                const angulo = Math.atan2(this.jugador.y - enemigo.y, this.jugador.x - enemigo.x);
                const empuje = 5;
                this.jugador.x += Math.cos(angulo) * empuje;
                this.jugador.y += Math.sin(angulo) * empuje;
                enemigo.x -= Math.cos(angulo) * empuje;
                enemigo.y -= Math.sin(angulo) * empuje;
                
                if (destruido) {
                    console.log('[TankBattle] GAME OVER - Colisión con enemigo');
                    setTimeout(() => this.gameOver(false), 500);
                }
                break; // Solo una colisión por frame
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

TankBattle.prototype.dibujar = function() {
    const ctx = this.ctx;
    
    // Fondo
    ctx.fillStyle = this.colores.fondo;
    ctx.fillRect(0, 0, this.ancho, this.alto);
    
    // Mapa (renderizado optimizado)
    ctx.shadowBlur = 0;
    
    // Dibujar todas las paredes sólidas primero
    ctx.fillStyle = this.colores.paredSolida;
    for (let f = 0; f < this.filas; f++) {
        for (let c = 0; c < this.columnas; c++) {
            if (this.mapa[f][c] === this.PARED_SOLIDA) {
                const x = c * this.tamañoCelda;
                const y = f * this.tamañoCelda;
                ctx.fillRect(x, y, this.tamañoCelda, this.tamañoCelda);
            }
        }
    }
    
    // Bordes de paredes sólidas
    ctx.strokeStyle = '#4a0080';
    ctx.lineWidth = 2;
    for (let f = 0; f < this.filas; f++) {
        for (let c = 0; c < this.columnas; c++) {
            if (this.mapa[f][c] === this.PARED_SOLIDA) {
                const x = c * this.tamañoCelda;
                const y = f * this.tamañoCelda;
                ctx.strokeRect(x, y, this.tamañoCelda, this.tamañoCelda);
            }
        }
    }
    
    // Paredes destructibles
    ctx.fillStyle = this.colores.paredDestructible;
    for (let f = 0; f < this.filas; f++) {
        for (let c = 0; c < this.columnas; c++) {
            if (this.mapa[f][c] === this.PARED_DESTRUCTIBLE) {
                const x = c * this.tamañoCelda;
                const y = f * this.tamañoCelda;
                ctx.fillRect(x + 2, y + 2, this.tamañoCelda - 4, this.tamañoCelda - 4);
            }
        }
    }
    
    // Bordes de paredes destructibles
    ctx.strokeStyle = '#ff69b4';
    ctx.lineWidth = 1;
    for (let f = 0; f < this.filas; f++) {
        for (let c = 0; c < this.columnas; c++) {
            if (this.mapa[f][c] === this.PARED_DESTRUCTIBLE) {
                const x = c * this.tamañoCelda;
                const y = f * this.tamañoCelda;
                ctx.strokeRect(x + 2, y + 2, this.tamañoCelda - 4, this.tamañoCelda - 4);
            }
        }
    }
    
    // Power-ups
    for (let pu of this.powerUps) {
        ctx.save();
        ctx.translate(pu.x, pu.y);
        ctx.rotate(Date.now() / 500);
        
        ctx.fillStyle = pu.color;
        ctx.shadowColor = pu.color;
        ctx.shadowBlur = 15;
        
        ctx.fillRect(-12, -12, 24, 24);
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 0;
        ctx.fillText(pu.icono, 0, 0);
        
        ctx.restore();
    }
    
    // Bombas
    for (let bomba of this.explosiones) {
        const tiempo = Date.now() - bomba.tiempoColocada;
        const parpadeo = Math.floor(tiempo / 200) % 2 === 0;
        
        if (parpadeo) {
            ctx.fillStyle = bomba.color;
            ctx.shadowColor = bomba.color;
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(bomba.x, bomba.y, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
    
    // Enemigos
    for (let enemigo of this.enemigos) {
        if (enemigo.vida > 0) {
            enemigo.dibujar(ctx);
        }
    }
    
    // Jugadores remotos (multijugador)
    if (this.esMultijugador && this.jugadoresRemoto) {
        for (let jugRemoto of this.jugadoresRemoto) {
            ctx.save();
            ctx.translate(jugRemoto.x, jugRemoto.y);
            ctx.rotate(jugRemoto.angulo);
            
            // Dibujar tanque remoto simplificado
            ctx.fillStyle = '#00fff9'; // Color cyan para diferenciar
            ctx.strokeStyle = '#0affff';
            ctx.lineWidth = 2;
            
            // Cuerpo
            ctx.fillRect(-20, -15, 40, 30);
            ctx.strokeRect(-20, -15, 40, 30);
            
            // Torreta
            ctx.beginPath();
            ctx.arc(0, 0, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Cañón
            ctx.fillRect(0, -4, 25, 8);
            ctx.strokeRect(0, -4, 25, 8);
            
            // Nombre del jugador
            ctx.rotate(-jugRemoto.angulo);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(jugRemoto.nombre || 'Jugador', 0, -35);
            
            ctx.restore();
        }
    }
    
    // Jugador
    if (this.jugador && this.jugador.vida > 0) {
        this.jugador.dibujar(ctx);
    }
    
    // Proyectiles
    for (let p of this.proyectiles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.tamaño, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    
    // Partículas
    ctx.globalAlpha = 1;
    for (let part of this.particulas) {
        ctx.globalAlpha = part.alpha;
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.tamaño, 0, Math.PI * 2);
        ctx.fillStyle = part.color;
        ctx.fill();
    }
    ctx.globalAlpha = 1;
    
    // HUD
    this.dibujarHUD();
};

TankBattle.prototype.dibujarHUD = function() {
    const ctx = this.ctx;
    
    // Panel superior
    ctx.fillStyle = 'rgba(10, 5, 32, 0.85)';
    ctx.fillRect(0, 0, this.ancho, 40);
    
    // Puntuación
    ctx.fillStyle = '#ff1493';
    ctx.font = 'bold 20px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText('SCORE: ' + this.puntuacion, 10, 27);
    
    // Vidas
    ctx.fillStyle = '#ff6b35';
    ctx.fillText('VIDAS: ', 250, 27);
    for (let i = 0; i < this.jugador.vida; i++) {
        ctx.fillStyle = '#ff1493';
        ctx.fillRect(340 + i * 25, 13, 20, 20);
    }
    
    // Tiempo
    const tiempoTranscurrido = Math.floor((Date.now() - this.tiempoInicio) / 1000);
    const minutos = Math.floor(tiempoTranscurrido / 60);
    const segundos = tiempoTranscurrido % 60;
    const tiempoStr = String(minutos).padStart(2, '0') + ':' + String(segundos).padStart(2, '0');
    
    ctx.fillStyle = '#9d4edd';
    ctx.textAlign = 'right';
    ctx.fillText('TIME: ' + tiempoStr, this.ancho - 10, 27);
    
    // Controles
    ctx.fillStyle = 'rgba(157, 78, 221, 0.7)';
    ctx.font = '12px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText('WASD: Mover | SPACE: Disparar | B: Bomba', 10, this.alto - 10);
};

// =============== UTILIDADES ===============

TankBattle.prototype.crearParticulas = function(x, y, color, cantidad) {
    for (let i = 0; i < cantidad; i++) {
        this.particulas.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            tamaño: Math.random() * 4 + 1,
            color: color,
            vida: Math.random() * 30 + 20,
            vidaMax: 50,
            alpha: 1
        });
    }
};

TankBattle.prototype.crearPowerUp = function(x, y) {
    const tipos = [
        {tipo: 1, color: '#ff69b4', icono: '⚡'},
        {tipo: 2, color: '#ff6b35', icono: '🔥'},
        {tipo: 3, color: '#00ff00', icono: '❤️'},
        {tipo: 4, color: '#00ffff', icono: '🛡️'},
        {tipo: 5, color: '#9d4edd', icono: '✨'},
        {tipo: 6, color: '#ff1493', icono: '💣'}
    ];
    
    const powerUp = tipos[Math.floor(Math.random() * tipos.length)];
    this.powerUps.push({
        x: x,
        y: y,
        tipo: powerUp.tipo,
        color: powerUp.color,
        icono: powerUp.icono
    });
};

TankBattle.prototype.crearExplosion = function(x, y, radio) {
    const col = Math.floor(x / this.tamañoCelda);
    const fila = Math.floor(y / this.tamañoCelda);
    
    // Crear partículas de explosión
    this.crearParticulas(x, y, this.colores.explosion, 30);
    
    // Dañar en área
    const direcciones = [[0,0], [1,0], [-1,0], [0,1], [0,-1]];
    
    for (let dir of direcciones) {
        for (let r = 0; r <= radio; r++) {
            const c = col + dir[0] * r;
            const f = fila + dir[1] * r;
            
            if (f < 0 || f >= this.filas || c < 0 || c >= this.columnas) break;
            if (this.mapa[f][c] === this.PARED_SOLIDA) break;
            
            // Destruir pared destructible
            if (this.mapa[f][c] === this.PARED_DESTRUCTIBLE) {
                this.mapa[f][c] = this.VACIO;
                this.crearParticulas(c * this.tamañoCelda + this.tamañoCelda/2, 
                                   f * this.tamañoCelda + this.tamañoCelda/2, 
                                   this.colores.paredDestructible, 10);
                if (Math.random() < 0.4) {
                    this.crearPowerUp(c * this.tamañoCelda + this.tamañoCelda/2, 
                                    f * this.tamañoCelda + this.tamañoCelda/2);
                }
                break;
            }
            
            // Dañar jugador
            if (this.jugador) {
                const distJugador = Math.hypot(this.jugador.x - x, this.jugador.y - y);
                if (distJugador < radio * this.tamañoCelda + 20) {
                    const destruido = this.jugador.recibirDaño(2);
                    if (destruido) {
                        console.log('[TankBattle] GAME OVER por explosión');
                        setTimeout(() => this.gameOver(false), 500);
                    }
                }
            }
            
            // Dañar enemigos
            for (let enemigo of this.enemigos) {
                if (enemigo.vida <= 0) continue;
                const distEnemigo = Math.hypot(enemigo.x - x, enemigo.y - y);
                if (distEnemigo < radio * this.tamañoCelda + 20) {
                    const destruido = enemigo.recibirDaño(2);
                    if (destruido) {
                        this.puntuacion += 150;
                        enemigo.vida = 0;
                        
                        // Verificar victoria
                        const enemigosVivos = this.enemigos.filter(e => e.vida > 0).length;
                        console.log('[TankBattle] Enemigos restantes tras explosión:', enemigosVivos);
                        if (enemigosVivos === 0) {
                            console.log('[TankBattle] ¡VICTORIA por explosión!');
                            setTimeout(() => this.gameOver(true), 500);
                        }
                    }
                }
            }
        }
    }
};

TankBattle.prototype.gameOver = function(victoria) {
    this.juegoActivo = false;
    
    console.log('[TankBattle] Game Over llamado - Victoria:', victoria);
    
    // Calcular estadísticas
    const tiempoTranscurrido = Date.now() - (this.tiempoInicio || Date.now());
    const minutos = Math.floor(tiempoTranscurrido / 60000);
    const segundos = Math.floor((tiempoTranscurrido % 60000) / 1000);
    const tiempoStr = String(minutos).padStart(2, '0') + ':' + String(segundos).padStart(2, '0');
    
    const enemigosNeutralizados = this.enemigos.filter(e => e.vida <= 0).length;
    const totalEnemigos = this.enemigos.length || 1; // Evitar división por cero
    
    const estadisticas = {
        enemigosNeutralizados: enemigosNeutralizados,
        tiempo: tiempoStr,
        datosRecopilados: victoria ? 100 : Math.min(100, Math.floor(enemigosNeutralizados / totalEnemigos * 100))
    };
    
    console.log('[TankBattle] Estadísticas calculadas:', estadisticas);
    
    // Esperar un momento y mostrar pantalla de resultado
    setTimeout(() => {
        console.log('[TankBattle] Intentando mostrar pantalla, cw disponible:', typeof cw !== 'undefined');
        // Verificar que controlWeb esté disponible
        if (typeof cw !== 'undefined' && cw.mostrarVictoriaNexus && cw.mostrarDerrotaNexus) {
            try {
                if (victoria) {
                    console.log('[TankBattle] Mostrando victoria...');
                    cw.mostrarVictoriaNexus(estadisticas);
                } else {
                    console.log('[TankBattle] Mostrando derrota...');
                    cw.mostrarDerrotaNexus(estadisticas);
                }
            } catch(e) {
                console.error('[TankBattle] Error mostrando pantalla:', e);
                alert(victoria ? '¡VICTORIA! Puntuación: ' + this.puntuacion : 'GAME OVER - Puntuación: ' + this.puntuacion);
                window.location.href = '/';
            }
        } else {
            console.error('[TankBattle] controlWeb no está disponible');
            // Fallback: recargar la página
            alert(victoria ? '¡VICTORIA! Puntuación: ' + this.puntuacion : 'GAME OVER - Puntuación: ' + this.puntuacion);
            window.location.href = '/';
        }
    }, 1000);
};
