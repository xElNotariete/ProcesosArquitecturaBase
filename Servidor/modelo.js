const datos = require("./cad.js");
const bcrypt = require('bcrypt');
const correo = require("./email.js");

function Sistema(){
 this.usuarios={};

 this.cad = new datos.CAD();
 
 this.cad.conectar(function(db){
   console.log("Conectado a Mongo Atlas");
 }).catch(function(err){
   console.error("No se pudo conectar a Mongo Atlas:", err && err.message ? err.message : err);
 });

 this.agregarUsuario=function(nick){
let res={"nick":-1};
if (!this.usuarios[nick]){
this.usuarios[nick]=new Usuario(nick);
res.nick=nick;
}
return res;
}

this.obtenerUsuarios=function(){
 return this.usuarios;
 }
this.usuarioActivo = function(nick) {
    let res = {"activo": false};
    if (this.usuarios.hasOwnProperty(nick)) {
        res.activo = true;
    }
    return res;
  }

  this.eliminarUsuario = function(nick, callback) {
    const modelo = this;
    
    // Buscar usuario por nick
    this.cad.buscarUsuario({"nick": nick}, function(usuario) {
      if (!usuario) {
        callback({ok: false, mensaje: "Usuario no encontrado"});
        return;
      }
      
      // Eliminar de la memoria (si existe)
      if (modelo.usuarios.hasOwnProperty(nick)) {
        delete modelo.usuarios[nick];
      }
      
      // Eliminar de MongoDB
      modelo.cad.eliminarUsuario(usuario.email, function(resultado) {
        callback(resultado);
      });
    });
  }

   this.numeroUsuarios = function() {
    let res = {"num": Object.keys(this.usuarios).length};
    return res;
  };

 
  this.usuarioGoogle = function(usr, callback) {
    // Asegurar que los usuarios provenientes de Google queden marcados como confirmados
    try {
      if (!usr) usr = {};
      // usar el email como nick si no existe
      if (usr.email && !usr.nick) usr.nick = usr.email;
      // marcar como confirmada para permitir login local si se desea
      usr.confirmada = true;
    } catch (e) {
      // no bloquear el flujo por un fallo menor en el objeto
    }
    this.cad.buscarOCrearUsuario(usr, function(obj) {
      callback(obj);
    });
  };
  
  this.verificarUsuarioGoogle = function(usr, callback) {
    // Verificar si el usuario de Google ya existe y tiene nick
    this.cad.buscarUsuario({"email": usr.email}, function(usuario) {
      if (usuario && usuario.nick) {
        // Usuario existe con nick
        callback({necesitaNick: false, nick: usuario.nick, email: usuario.email});
      } else {
        // Usuario nuevo o sin nick
        callback({necesitaNick: true, email: usr.email});
      }
    });
  };
  
  this.guardarNickGoogle = function(obj, callback) {
    let modelo = this;
    
    // Validar nick
    const nickRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!nickRegex.test(obj.nick)) {
      callback({success: false, error: "Nick inválido"});
      return;
    }
    
    // Verificar que el nick no esté en uso
    this.cad.buscarUsuario({"nick": obj.nick}, function(usrNick) {
      if (usrNick) {
        callback({success: false, error: "nick"});
        return;
      }
      
      // Buscar usuario por email y actualizar con nick
      modelo.cad.buscarUsuario({"email": obj.email}, function(usuario) {
        if (usuario) {
          // Usuario existe, actualizar nick
          usuario.nick = obj.nick;
          modelo.cad.actualizarUsuario(usuario, function(res) {
            modelo.agregarUsuario(obj.nick);
            callback({success: true, nick: obj.nick});
          });
        } else {
          // Usuario no existe, crear con nick
          let nuevoUsuario = {
            email: obj.email,
            nick: obj.nick,
            confirmada: true
          };
          modelo.cad.insertarUsuario(nuevoUsuario, function(res) {
            modelo.agregarUsuario(obj.nick);
            callback({success: true, nick: obj.nick});
          });
        }
      });
    });
  };

  
  this.registrarUsuario=function(obj,callback){
    let modelo=this;
    
    // Validar que tenga nick
    if (!obj.nick){
      callback({"nick":-1, "error":"nick"});
      return;
    }
    
    // Verificar si el nick ya existe
    this.cad.buscarUsuario({"nick":obj.nick},function(usrNick){
      if (usrNick){
        // El nick ya está en uso
        callback({"nick":-1, "error":"nick"});
        return;
      }
      
      // Verificar si el email ya existe
      modelo.cad.buscarUsuario({"email":obj.email},function(usrEmail){
        if (usrEmail){
          // El email ya existe
          callback({"nick":-1, "error":"email"});
          return;
        }
        
        // Usuario no existe, proceder con el registro
        obj.key=Date.now().toString();
        obj.confirmada=false;
        
        // Cifrar la contraseña con bcrypt
        bcrypt.hash(obj.password, 10, function(err, hash) {
          if (err) {
            console.error("Error al cifrar la contraseña:", err);
            callback({"nick":-1, "error":"bcrypt"});
            return;
          }
          obj.password = hash;
          
          modelo.cad.insertarUsuario(obj,function(res){
            callback(res);
            // Enviar correo después de insertar el usuario
            correo.enviarEmail(obj.email,obj.key,"Confirmar cuenta");
          });
        });
      });
    });
  }


  this.loginUsuario=function(obj,callback){
    this.cad.buscarUsuario({"email":obj.email,"confirmada":true},function(usr){
      if(usr){
        // Si el usuario no tiene contraseña (usuario de Google), no permitir login local
        if (!usr.password) {
          console.log("[loginUsuario] Usuario de Google, no puede hacer login con contraseña");
          callback({"email":-1, "mensaje": "Usuario registrado con Google. Usa 'Iniciar sesión con Google'"});
          return;
        }
        
        // Comparar la contraseña usando bcrypt
        bcrypt.compare(obj.password, usr.password, function(err, result) {
          if (err) {
            console.error("Error al comparar contraseñas:", err);
            callback({"email":-1});
            return;
          }
          if(result){
            callback(usr);
          }
          else{
            callback({"email":-1});
          }
        });
      }
      else
      {
        callback({"email":-1});
      }
    });
  }

  
  this.confirmarUsuario=function(obj,callback){
    let modelo=this;
    console.log("[modelo] Buscando usuario para confirmar:", obj);
    this.cad.buscarUsuario({"email":obj.email,"confirmada":false,"key":obj.key},function(usr){
      console.log("[modelo] Usuario encontrado:", usr);
      if (usr){
        usr.confirmada=true;
        console.log("[modelo] Actualizando usuario con confirmada=true");
        modelo.cad.actualizarUsuario(usr,function(res){
          console.log("[modelo] Usuario actualizado, resultado:", res);
          callback({"email":res.email, "nick":res.nick});
        })
      }
      else
      {
        console.log("[modelo] Usuario no encontrado o ya confirmado");
        callback({"email":-1});
      }
    })
  }

}

function Usuario(nick){
 this.nick=nick;
}
module.exports.Sistema=Sistema
