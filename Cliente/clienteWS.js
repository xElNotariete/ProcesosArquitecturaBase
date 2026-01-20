function ClienteWS(){
	this.socket=undefined;
	this.email=undefined;
	this.codigo=undefined;
	this.ini=function(){
		this.socket=io.connect();
	}
	this.lanzarServidorWS=function(){
		const ws = this;
		this.socket.on("partidaCreada",function(datos){
			console.log(datos.codigo);
			ws.codigo=datos.codigo;
			if ($("#codigoPartidaCard").length > 0) {
				$("#codigoPartidaCard").text(datos.codigo);
			}
			if ($("#codigoPartida").length > 0) {
				$("#codigoPartida").text(datos.codigo);
			}
		});
		this.socket.on("unidoAPartida",function(datos){
			console.log(datos.codigo);
			ws.codigo=datos.codigo;
			if ($("#estadoPartida").length > 0) {
				$("#estadoPartida").html('<div class="alert alert-success alert-sm mb-0"><i class="fas fa-check-circle"></i> ¡Unido a la partida ' + datos.codigo + '!</div>');
			}
		});
		this.socket.on("listaPartidas",function(lista){
			console.log(lista);
			// Actualizar tarjeta si está visible
			if ($("#listaPartidasCard").length > 0) {
				let html = '';
				if (!lista || Object.keys(lista).length === 0) {
					html = '<div class="alert alert-info alert-sm mb-0"><i class="fas fa-info-circle"></i> No hay partidas disponibles</div>';
				} else {
					html = '<div class="list-group list-group-flush">';
					for (let codigo in lista) {
						let partida = lista[codigo];
						html += '<div class="list-group-item d-flex justify-content-between align-items-center p-2">';
						html += '<div><small><strong>Código:</strong> ' + codigo + '</small>';
						html += '<br><small class="text-muted">Jugador: ' + (partida.owner || 'Usuario') + '</small></div>';
						html += '<button class="btn btn-success btn-sm" onclick="ejecutarUnirsePartida(\'' + codigo + '\')"><i class="fas fa-sign-in-alt"></i></button>';
						html += '</div>';
					}
					html += '</div>';
				}
				$("#listaPartidasCard").html(html);
			}
		});
		this.socket.on("partidasDisponibles",function(datos){
			console.log("Partidas disponibles:", datos);
			if (datos && datos.partidas) {
				// Procesar directamente como lista de partidas
				let lista = datos.partidas;
				if ($("#listaPartidasCard").length > 0) {
					let html = '';
					if (!lista || Object.keys(lista).length === 0) {
						html = '<div class="alert alert-info alert-sm mb-0"><i class="fas fa-info-circle"></i> No hay partidas disponibles</div>';
					} else {
						html = '<div class="list-group list-group-flush">';
						for (let codigo in lista) {
							let partida = lista[codigo];
							html += '<div class="list-group-item d-flex justify-content-between align-items-center p-2">';
							html += '<div><small><strong>Código:</strong> ' + codigo + '</small>';
							html += '<br><small class="text-muted">Jugador: ' + (partida.owner || 'Usuario') + '</small></div>';
							html += '<button class="btn btn-success btn-sm" onclick="ejecutarUnirsePartida(\'' + codigo + '\')"><i class="fas fa-sign-in-alt"></i></button>';
							html += '</div>';
						}
						html += '</div>';
					}
					$("#listaPartidasCard").html(html);
				}
			}
		});
		
		// Manejar errores del servidor
		this.socket.on("error", function(datos){
			console.error("[clienteWS] Error del servidor:", datos.mensaje);
			// Mostrar el error en la interfaz
			if ($("#listaPartidasCard").length > 0) {
				$("#listaPartidasCard").html(
					'<div class="alert alert-danger alert-sm mb-0">' +
					'<i class="fas fa-exclamation-triangle"></i> ' + datos.mensaje +
					'</div>'
				);
			}
			// También mostrar con la función cw.mostrarMensaje si está disponible
			if (typeof cw !== 'undefined' && cw.mostrarMensaje) {
				cw.mostrarMensaje(datos.mensaje);
			}
		});
	}
	this.crearPartida=function(){
		console.log("[WS] Creando partida con email:", this.email);
		this.socket.emit("crearPartida",{"email":this.email});
	}
	this.unirAPartida=function(codigo){
		// Obtener el nick del usuario de la cookie
		const nick = this.getCookie("nick");
		console.log("[clienteWS] Intentando unirse a partida:", codigo, "con nick:", nick);
		this.socket.emit("unirsePartida",{"codigo":codigo, "nick":nick});
	}
	this.getCookie = function(name) {
		let nameEQ = name + "=";
		let ca = document.cookie.split(";");
		for (let i = 0; i < ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) == " ") c = c.substring(1, c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
		}
		return null;
	};
	this.obtenerPartidasDisponibles=function(){
		this.socket.emit("obtenerPartidasDisponibles",{});
	}
	this.ini();
	this.lanzarServidorWS();
}
