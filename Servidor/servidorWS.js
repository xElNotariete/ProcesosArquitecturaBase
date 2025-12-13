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
			
			socket.on("obtenerPartidasDisponibles",function(datos){
				const lista = sistema.obtenerPartidasDisponibles();
				// Convertir array a objeto con código como clave
				const partidasObj = {};
				lista.forEach(p => {
					partidasObj[p.codigo] = {owner: p.emailCreador};
				});
				yo.enviarAlRemitente(socket,"partidasDisponibles",{partidas:partidasObj});
			});
		});
	}
}

module.exports.ServidorWS=ServidorWS;
