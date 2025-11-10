function ClienteRest(){
	this.agregarUsuario=function(nick){
		var cli=this;
		$.getJSON("/agregarUsuario/"+nick,function(data){
			let msg="El nick "+nick+" está ocupado";
			if (data.nick!=-1){
				console.log("Usuario "+nick+" ha sido registrado");
				msg="Bienvenido al sistema, "+nick;
				$.cookie("nick", nick, { expires: 365 }); 
			}
			else{
				console.log("El nick ya está ocupado");
			}
			cw.mostrarMensaje(msg);
		});
	}
	
	this.obtenerUsuarios=function(){
		var cli=this;
		$.ajax({
			type:'GET',
			url:'/obtenerUsuarios',
			success:function(data){
				console.log("Respuesta obtenerUsuarios:");
				console.log(data);
			},
			error:function(xhr, textStatus, errorThrown){
				console.log("Status: " + textStatus);
				console.log("Error: " + errorThrown);
			},
			contentType:'application/json'
		});
	}
	
	this.numeroUsuarios=function(){
		var cli=this;
		$.ajax({
			type:'GET',
			url:'/numeroUsuarios',
			success:function(data){
				console.log("Respuesta numeroUsuarios:");
				console.log(data);
			},
			error:function(xhr, textStatus, errorThrown){
				console.log("Status: " + textStatus);
				console.log("Error: " + errorThrown);
			},
			contentType:'application/json'
		});
	}
	
	this.usuarioActivo=function(nick){
		var cli=this;
		$.ajax({
			type:'GET',
			url:'/usuarioActivo/'+nick,
			success:function(data){
				console.log("Respuesta usuarioActivo para " + nick + ":");
				console.log(data);
			},
			error:function(xhr, textStatus, errorThrown){
				console.log("Status: " + textStatus);
				console.log("Error: " + errorThrown);
			},
			contentType:'application/json'
		});
	}
	
	this.eliminarUsuario=function(nick){
		var cli=this;
		$.ajax({
			type:'GET',
			url:'/eliminarUsuario/'+nick,
			success:function(data){
				console.log("Respuesta eliminarUsuario para " + nick + ":");
				console.log(data);
				
				if (data.ok) {
					cw.mostrarMensaje(data.mensaje);
					
					// Si se cerró la sesión del usuario actual, redirigir al login
					if (data.sesionCerrada) {
						// Borrar cookie
						document.cookie = "nick=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
						cw.mostrarMensaje("Tu cuenta ha sido eliminada. Serás redirigido al login...");
						setTimeout(function() {
							window.location.href = "/login.html";
						}, 2000);
					} else {
						// Actualizar la lista de usuarios
						cw.comprobarSesion();
					}
				} else {
					cw.mostrarMensaje("Error: " + data.mensaje);
				}
			},
			error:function(xhr, textStatus, errorThrown){
				console.log("Status: " + textStatus);
				console.log("Error: " + errorThrown);
				cw.mostrarMensaje("Error al eliminar usuario");
			},
			contentType:'application/json'
		});
	}

	this.registrarUsuario=function(nick, email, password, callback){
		$.ajax({
			type:'POST',
			url:'/registrarUsuario',
			data: JSON.stringify({"nick":nick,"email":email,"password":password}),
			success:function(data){
				if (callback) callback(data);
			},
			error:function(xhr, textStatus, errorThrown){
				console.log("Status: " + textStatus);
				console.log("Error: " + errorThrown);
				if (callback) callback({error: "Error de conexión"});
			},
			contentType:'application/json'
		});
	}

	this.loginUsuario=function(email, password, callback){
		$.ajax({
			type:'POST',
			url:'/loginUsuario',
			data: JSON.stringify({"email":email,"password":password}),
			success:function(data){
				if (callback) callback(data);
			},
			error:function(xhr, textStatus, errorThrown){
				console.error("Error en login:", textStatus, errorThrown);
				if (callback) callback(null);
			},
			contentType:'application/json'
		});
	}

	this.cerrarSesion=function(){
		$.getJSON("/cerrarSesion",function(){
			console.log("Sesión cerrada");
			document.cookie = "nick=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
		});
	}
}