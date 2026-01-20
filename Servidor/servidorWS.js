function ServidorWS(){
	this.enviarAlRemitente=function(socket,mensaje,datos){
		socket.emit(mensaje,datos);
	}
	
	this.enviarATodosMenosRemitente=function(socket,mens,datos){
		socket.broadcast.emit(mens,datos);
	}
	
	this.enviarGlobal=function(io,mens,datos){
		io.emit(mens,datos);
	}

	this.lanzarServidor=function(io, sistema){
		const yo = this;
		io.on('connection',function(socket){
			console.log("Capa WS activa");
			
			socket.on("crearPartida",function(datos){
			console.log("[servidorWS] Recibida solicitud crearPartida con email:", datos.email);
			let resultado = sistema.crearPartida(datos.email);
			console.log("[servidorWS] Resultado crearPartida:", resultado);
				if (resultado.ok){
					socket.join(resultado.codigo);
					yo.enviarAlRemitente(socket,"partidaCreada",{"codigo":resultado.codigo});
					let lista = sistema.obtenerPartidasDisponibles();
					const partidasObj = {};
					lista.forEach(p => {
						partidasObj[p.codigo] = {owner: p.emailCreador};
					});
					yo.enviarATodosMenosRemitente(socket,"listaPartidas",partidasObj);
				} else {
					yo.enviarAlRemitente(socket,"error",{"mensaje":resultado.error});
				}
			});
			
			socket.on("unirAPartida",function(datos){
				let resultado = sistema.unirAPartida(datos.email, datos.codigo);
				if (resultado.ok){
					socket.join(datos.codigo);
					yo.enviarAlRemitente(socket,"unidoAPartida",{"codigo":datos.codigo});
					let lista = sistema.obtenerPartidasDisponibles();
					const partidasObj = {};
					lista.forEach(p => {
						partidasObj[p.codigo] = {owner: p.emailCreador};
					});
					yo.enviarATodosMenosRemitente(socket,"listaPartidas",partidasObj);
				} else {
					yo.enviarAlRemitente(socket,"error",{"mensaje":resultado.error});
				}
			});
			
			// Nuevo evento: Unirse a partida multijugador (para sala de espera)
			socket.on("unirsePartida", function(datos) {
				const codigoBuscado = datos.codigo.toLowerCase(); // Normalizar a minúsculas
				console.log("[servidorWS] Jugador intentando unirse a partida:", codigoBuscado, "con nick:", datos.nick);
				console.log("[servidorWS] Partidas disponibles:", Object.keys(sistema.partidas));
				const partida = sistema.partidas[codigoBuscado];
				
				if (!partida) {
					console.log("[servidorWS] Partida NO encontrada. Código buscado:", codigoBuscado);
					yo.enviarAlRemitente(socket, "error", {mensaje: "Partida no encontrada"});
					return;
				}
				
				// Buscar si ya existe un jugador con este nick/email (el creador)
				let jugadorExistente = null;
				if (datos.nick) {
					jugadorExistente = partida.jugadores.find(j => 
						j.nick === datos.nick
					);
				}
				
				if (jugadorExistente) {
					// Es el jugador creador reconectándose, actualizar su socketId y tanque
					console.log("[servidorWS] Jugador creador reconectado");
					jugadorExistente.socketId = socket.id;
					jugadorExistente.tanque = datos.tanque || 'equilibrado';
				} else {
					// Es un nuevo jugador uniéndose
					console.log("[servidorWS] Nuevo jugador uniéndose");
					
					// Verificar si hay espacio
					if (partida.jugadores.length >= partida.maxJug) {
						yo.enviarAlRemitente(socket, "error", {mensaje: "Partida llena"});
						return;
					}
					
					// Agregar nuevo jugador
					partida.jugadores.push({
						socketId: socket.id,
						nick: datos.nick || "Jugador" + (partida.jugadores.length + 1),
						tanque: datos.tanque || 'equilibrado',
						puntos: 0,
						vidas: 3
					});
				}
				
				// Unir socket a la sala
				socket.join(codigoBuscado);
				console.log("[servidorWS] Jugador unido. Total en partida:", partida.jugadores.length + "/" + partida.maxJug);
				
				// Enviar actualización a todos en la sala
				io.to(codigoBuscado).emit("partidaActualizada", {
					codigo: partida.codigo,
					modo: partida.modo,
					jugadores: partida.jugadores,
					maxJug: partida.maxJug,
					semillaMapa: partida.semillaMapa
				});
				
				// Si la partida está completa, iniciarla
				const minJugadores = partida.modo === '1vs1' ? 2 : 2; // Min 2 para todos contra todos
				if (partida.jugadores.length >= minJugadores && partida.estado === 'esperando') {
					console.log("[servidorWS] ¡Partida completa! Iniciando juego...");
					partida.estado = 'en-curso';
					partida.tiempoInicio = Date.now();
					
					// Pequeño delay para que todos vean la pantalla completa
					setTimeout(() => {
						io.to(codigoBuscado).emit("partidaIniciada", {
							codigo: partida.codigo,
							modo: partida.modo,
							jugadores: partida.jugadores,
							semillaMapa: partida.semillaMapa
						});
					}, 1000);
				}
			});
			
			// Manejar actualización de posición de jugador
			socket.on("actualizarPosicion", function(datos) {
				const codigo = datos.codigo ? datos.codigo.toLowerCase() : null;
				if (!codigo) return;
				
				const partida = sistema.partidas[codigo];
				if (!partida) return;
				
				// Encontrar jugador por socketId
				const jugador = partida.jugadores.find(j => j.socketId === socket.id);
				if (jugador) {
					jugador.x = datos.x;
					jugador.y = datos.y;
					jugador.direccion = datos.direccion;
					jugador.vida = datos.vida;
				}
				
				// Retransmitir a todos los demás en la sala
				socket.to(codigo).emit("jugadorMovio", {
					socketId: socket.id,
					nick: jugador ? jugador.nick : 'Jugador',
					x: datos.x,
					y: datos.y,
					direccion: datos.direccion,
					vida: datos.vida,
					tanque: jugador ? jugador.tanque : 'equilibrado'
				});
			});
			
			// Manejar disparos
			socket.on("jugadorDisparo", function(datos) {
				const codigo = datos.codigo ? datos.codigo.toLowerCase() : null;
				if (!codigo) return;
				
				// Retransmitir disparo a todos los demás
				socket.to(codigo).emit("disparo", {
					socketId: socket.id,
					x: datos.x,
					y: datos.y,
					vx: datos.vx,
					vy: datos.vy,
					direccion: datos.direccion
				});
			});
			
			// Manejar daño a jugador
			socket.on("jugadorDañado", function(datos) {
				const codigo = datos.codigo ? datos.codigo.toLowerCase() : null;
				if (!codigo) return;
				
				const partida = sistema.partidas[codigo];
				if (!partida) return;
				
				// Encontrar jugador dañado
				const jugador = partida.jugadores.find(j => j.socketId === datos.targetSocketId);
				if (jugador) {
					jugador.vida = datos.vidaRestante;
					
					// Notificar a todos
					io.to(codigo).emit("jugadorRecibeDaño", {
						socketId: datos.targetSocketId,
						vidaRestante: datos.vidaRestante,
						atacanteSocketId: socket.id
					});
					
					// Si el jugador murió
					if (datos.vidaRestante <= 0) {
						io.to(codigo).emit("jugadorEliminado", {
							socketId: datos.targetSocketId,
							nick: jugador.nick,
							eliminadoPor: datos.atacanteNick
						});
					}
				}
			});
			
			socket.on("obtenerPartidasDisponibles",function(datos){
				const lista = sistema.obtenerPartidasDisponibles();
				// Convertir array a objeto con código como clave
				const partidasObj = {};
				lista.forEach(p => {
					partidasObj[p.codigo] = {owner: p.emailCreador};
				});
				yo.enviarAlRemitente(socket,"partidasDisponibles",{partidas:partidasObj});
			});
			
			// Manejar desconexión
			socket.on("disconnect", function() {
				console.log("[servidorWS] Socket desconectado:", socket.id);
				
				// Buscar en qué partida estaba el jugador
				for (let codigo in sistema.partidas) {
					const partida = sistema.partidas[codigo];
					const index = partida.jugadores.findIndex(j => j.socketId === socket.id);
					
					if (index !== -1) {
						console.log("[servidorWS] Jugador salió de partida:", codigo);
						partida.jugadores.splice(index, 1);
						
						// Notificar a los demás
						io.to(codigo).emit("partidaActualizada", {
							codigo: partida.codigo,
							modo: partida.modo,
							jugadores: partida.jugadores,
							maxJug: partida.maxJug
						});
						
						// Si la partida queda vacía, eliminarla
						if (partida.jugadores.length === 0) {
							delete sistema.partidas[codigo];
							console.log("[servidorWS] Partida eliminada por falta de jugadores");
						}
					}
				}
			});
		});
	}
}

module.exports.ServidorWS=ServidorWS;
