function ControlWeb(){
	
	this.mostrarAgregarUsuario=function(){
		var cadena='<div id="mAU" class="form-group">';
		cadena=cadena+'<label for="nick">Nick:</label>';
		cadena=cadena+'<input type="text" class="form-control" id="nick">';
		cadena=cadena+'<button id="btnAU" type="submit" class="btn btn-primary">Submit</button>';
		cadena=cadena+'</div>';
		$("#au").append(cadena);
		
		$("#btnAU").on("click",function(){
			let nick=$("#nick").val();
			if(nick){
				rest.agregarUsuario(nick);
				$("#mAU").remove();
			}
			else{
				alert("Por favor, ingrese un nick");
			}
		});
	}
	
	this.mostrarObtenerUsuarios=function(){
		var cadena='<div id="mOU" class="form-group">';
		cadena=cadena+'<h4>Obtener Usuarios</h4>';
		cadena=cadena+'<button id="btnOU" type="button" class="btn btn-info">Mostrar Usuarios</button>';
		cadena=cadena+'<div id="listaUsuarios" class="mt-3"></div>';
		cadena=cadena+'</div>';
		$("#contenido").append(cadena);
		
		$("#btnOU").on("click",function(){
			$.ajax({
				type:'GET',
				url:'/obtenerUsuarios',
				success:function(data){
					var usuarios = '<h5>Lista de Usuarios:</h5><ul class="list-group">';
					for(var nick in data){
						usuarios += '<li class="list-group-item">' + nick + '</li>';
					}
					usuarios += '</ul>';
					$("#listaUsuarios").html(usuarios);
				},
				error:function(xhr, textStatus, errorThrown){
					$("#listaUsuarios").html('<div class="alert alert-danger">Error: ' + errorThrown + '</div>');
				}
			});
		});
	}
	
	this.mostrarNumeroUsuarios=function(){
		var cadena='<div id="mNU" class="form-group">';
		cadena=cadena+'<h4>Número de Usuarios</h4>';
		cadena=cadena+'<button id="btnNU" type="button" class="btn btn-success">Contar Usuarios</button>';
		cadena=cadena+'<div id="conteoUsuarios" class="mt-3"></div>';
		cadena=cadena+'</div>';
		$("#contenido").append(cadena);
		
		$("#btnNU").on("click",function(){
			$.ajax({
				type:'GET',
				url:'/numeroUsuarios',
				success:function(data){
					$("#conteoUsuarios").html('<div class="alert alert-info"><strong>Total de usuarios: ' + data.num + '</strong></div>');
				},
				error:function(xhr, textStatus, errorThrown){
					$("#conteoUsuarios").html('<div class="alert alert-danger">Error: ' + errorThrown + '</div>');
				}
			});
		});
	}
	
	this.mostrarUsuarioActivo=function(){
		var cadena='<div id="mUA" class="form-group">';
		cadena=cadena+'<h4>Verificar Usuario Activo</h4>';
		cadena=cadena+'<label for="nickActivo">Nick a verificar:</label>';
		cadena=cadena+'<input type="text" class="form-control" id="nickActivo" placeholder="Ingrese el nick">';
		cadena=cadena+'<button id="btnUA" type="button" class="btn btn-warning mt-2">Verificar</button>';
		cadena=cadena+'<div id="resultadoActivo" class="mt-3"></div>';
		cadena=cadena+'</div>';
		$("#contenido").append(cadena);
		
		$("#btnUA").on("click",function(){
			let nick=$("#nickActivo").val();
			if(nick){
				$.ajax({
					type:'GET',
					url:'/usuarioActivo/'+nick,
					success:function(data){
						var mensaje = data.activo ? 
							'<div class="alert alert-success">El usuario <strong>' + nick + '</strong> está activo</div>' :
							'<div class="alert alert-warning">El usuario <strong>' + nick + '</strong> no está activo</div>';
						$("#resultadoActivo").html(mensaje);
					},
					error:function(xhr, textStatus, errorThrown){
						$("#resultadoActivo").html('<div class="alert alert-danger">Error: ' + errorThrown + '</div>');
					}
				});
			}
			else{
				$("#resultadoActivo").html('<div class="alert alert-danger">Por favor, ingrese un nick</div>');
			}
		});
	}
	
	this.mostrarEliminarUsuario=function(){
		var cadena='<div id="mEU" class="form-group">';
		cadena=cadena+'<h4>Eliminar Usuario</h4>';
		cadena=cadena+'<label for="nickEliminar">Nick a eliminar:</label>';
		cadena=cadena+'<input type="text" class="form-control" id="nickEliminar" placeholder="Ingrese el nick">';
		cadena=cadena+'<button id="btnEU" type="button" class="btn btn-danger mt-2">Eliminar</button>';
		cadena=cadena+'<div id="resultadoEliminar" class="mt-3"></div>';
		cadena=cadena+'</div>';
		$("#contenido").append(cadena);
		
		$("#btnEU").on("click",function(){
			let nick=$("#nickEliminar").val();
			if(nick){
				$.ajax({
					type:'GET',
					url:'/eliminarUsuario/'+nick,
					success:function(data){
						var mensaje = data.nick !== -1 ? 
							'<div class="alert alert-success">Usuario <strong>' + nick + '</strong> eliminado correctamente</div>' :
							'<div class="alert alert-warning">El usuario <strong>' + nick + '</strong> no existe</div>';
						$("#resultadoEliminar").html(mensaje);
						if(data.nick !== -1){
							$("#nickEliminar").val(''); // Limpiar el input
						}
					},
					error:function(xhr, textStatus, errorThrown){
						$("#resultadoEliminar").html('<div class="alert alert-danger">Error: ' + errorThrown + '</div>');
					}
				});
			}
			else{
				$("#resultadoEliminar").html('<div class="alert alert-danger">Por favor, ingrese un nick</div>');
			}
		});
	}
}