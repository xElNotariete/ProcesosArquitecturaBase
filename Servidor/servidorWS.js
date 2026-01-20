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
			
			// Evento: Unirse a partida multijugador (para sala de espera)
			socket.on("unirsePartida", function(datos) {
				console.log("[servidorWS] Jugador intentando unirse a partida:", datos.codigo, "con nick:", datos.nick);
				console.log("[servidorWS] Partidas disponibles:", Object.keys(sistema.partidas));
				const partida = sistema.partidas[datos.codigo];
				
				if (!partida) {
					console.log("[servidorWS] ERROR: Partida no encontrada. Código buscado:", datos.codigo);
					console.log("[servidorWS] Códigos existentes:", Object.keys(sistema.partidas));
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
				socket.join(datos.codigo);
				console.log("[servidorWS] Jugador unido. Total en partida:", partida.jugadores.length + "/" + partida.maxJug);
				
				// Enviar actualización a todos en la sala
				io.to(datos.codigo).emit("partidaActualizada", {
					codigo: partida.codigo,
					modo: partida.modo,
					jugadores: partida.jugadores,
					maxJug: partida.maxJug
				});
				
				// Si la partida está completa, iniciarla
				const minJugadores = partida.modo === '1vs1' ? 2 : 2; // Min 2 para todos contra todos
				if (partida.jugadores.length >= minJugadores && partida.estado === 'esperando') {
					console.log("[servidorWS] ¡Partida completa! Iniciando juego...");
					partida.estado = 'en-curso';
					partida.tiempoInicio = Date.now();
					
					// Pequeño delay para que todos vean la pantalla completa
					setTimeout(() => {
						io.to(datos.codigo).emit("partidaIniciada", {
							codigo: partida.codigo,
							modo: partida.modo,
							jugadores: partida.jugadores
						});
					}, 1000);
				}
			});
			
			socket.on("obtenerPartidasDisponibles",function(datos){
				console.log("[servidorWS] Obteniendo partidas disponibles...");
				console.log("[servidorWS] Total partidas en sistema:", Object.keys(sistema.partidas).length);
				const lista = sistema.obtenerPartidasDisponibles();
				console.log("[servidorWS] Partidas filtradas (disponibles):", lista.length);
				// Convertir array a objeto con código como clave
				const partidasObj = {};
				lista.forEach(p => {
					console.log("[servidorWS] Partida disponible:", p.codigo, "Estado:", p.estado || "sin estado");
					partidasObj[p.codigo] = {owner: p.emailCreador || (p.jugadores && p.jugadores[0] && p.jugadores[0].nick)};
				});
				console.log("[servidorWS] Enviando partidas:", Object.keys(partidasObj));
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
