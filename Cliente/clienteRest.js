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
			},
			error:function(xhr, textStatus, errorThrown){
				console.log("Status: " + textStatus);
				console.log("Error: " + errorThrown);
			},
			contentType:'application/json'
		});
	}
}