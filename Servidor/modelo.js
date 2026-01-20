const datos = require("./cad.js");
const bcrypt = require('bcrypt');
const correo = require("./email.js");

function Sistema(){
 this.usuarios={};
 this.partidas = {};

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
    const modelo = this;
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
      // Agregar usuario a memoria
      if (obj && obj.nick && !modelo.usuarios[obj.nick]) {
        modelo.usuarios[obj.nick] = obj;
        console.log("[usuarioGoogle] Usuario agregado a memoria:", obj.nick);
      }
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
    
    // Validar contraseña
    if (!obj.password || obj.password.length < 6) {
      callback({success: false, error: "Contraseña inválida"});
      return;
    }
    
    // Verificar que el nick no esté en uso
    this.cad.buscarUsuario({"nick": obj.nick}, function(usrNick) {
      if (usrNick) {
        callback({success: false, error: "nick"});
        return;
      }
      
      // Encriptar contraseña
      bcrypt.hash(obj.password, 10, function(err, hash) {
        if (err) {
          callback({success: false, error: "Error al encriptar contraseña"});
          return;
        }
        
        // Buscar usuario por email y actualizar con nick y contraseña
        modelo.cad.buscarUsuario({"email": obj.email}, function(usuario) {
          if (usuario) {
            // Usuario existe, actualizar nick y contraseña
            usuario.nick = obj.nick;
            usuario.password = hash;
            modelo.cad.actualizarUsuario(usuario, function(res) {
              modelo.agregarUsuario(obj.nick);
              callback({success: true, nick: obj.nick});
            });
          } else {
            // Usuario no existe, crear con nick y contraseña
            let nuevoUsuario = {
              email: obj.email,
              nick: obj.nick,
              password: hash,
              confirmada: true
            };
            modelo.cad.insertarUsuario(nuevoUsuario, function(res) {
              modelo.agregarUsuario(obj.nick);
              callback({success: true, nick: obj.nick});
            });
          }
        });
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
    const modelo = this;
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
            // Agregar usuario a memoria
            if (!modelo.usuarios[usr.nick]) {
              modelo.usuarios[usr.nick] = usr;
              console.log("[loginUsuario] Usuario agregado a memoria:", usr.nick);
            }
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

  // ------------------ Gestión de partidas ------------------
  this.obtenerCodigo = function(){
    const rnd = Math.floor(Math.random()*9000)+1000;
    return Date.now().toString(36) + '-' + rnd.toString(36);
  };

  this.obtenerUsuarioPorEmail = function(email){
    if (!email) return null;
    const lista = Object.values(this.usuarios);
    for (let i=0;i<lista.length;i++){
      const u = lista[i];
      if (u && u.email && u.email === email) return u;
    }
    return null;
  };

  this.crearPartida = function(email){
    const modelo = this;
    const usr = this.obtenerUsuarioPorEmail(email);
    if (!usr) return {ok:false, error:'Usuario no encontrado'};
    const codigo = this.obtenerCodigo();
    const p = new Partida(codigo);
    const jugadorId = usr.nick || usr.email;
    p.jugadores.push(jugadorId);
    this.partidas[codigo] = p;
    return {ok:true, codigo:codigo, partida:p};
  };

  this.unirAPartida = function(email, codigo){
    const modelo = this;
    const usr = this.obtenerUsuarioPorEmail(email);
    if (!usr) return {ok:false, error:'Usuario no encontrado'};
    const p = this.partidas[codigo];
    if (!p) return {ok:false, error:'Partida no encontrada'};
    const jugadorId = usr.nick || usr.email;
    if (p.jugadores.indexOf(jugadorId) !== -1) return {ok:true, mensaje:'Jugador ya en la partida', partida:p};
    if (p.jugadores.length >= p.maxJug) return {ok:false, error:'Partida llena'};
    p.jugadores.push(jugadorId);
    return {ok:true, partida:p};
  };

  this.obtenerPartidasDisponibles = function(){
    let lista = [];
    for(var codigo in this.partidas){
      const partida = this.partidas[codigo];
      if (partida.jugadores.length < partida.maxJug){
        const creadorId = partida.jugadores[0];
        let emailCreador = creadorId;
        const usr = this.usuarios[creadorId];
        if (usr && usr.email) emailCreador = usr.email;
        const codigoPartida = partida.codigo;
        const obj = {
          codigo: codigoPartida,
          emailCreador: emailCreador
        };
        lista.push(obj);
      }
    }
    return lista;
  };

}

function Partida(codigo){
  this.codigo = codigo;
  this.jugadores = [];
  this.maxJug = 2;
  this.enemigosNeutralizados = 0;
  this.tiempoInicio = null;
  this.datosRecopilados = 0;
  this.modo = null; // 'individual', '1vs1', 'todos-contra-todos'
  this.estado = 'esperando'; // 'esperando', 'en-curso', 'finalizada'
  this.nombre = null; // Nombre de la partida
}

// Métodos para gestión de partidas multijugador
Sistema.prototype.crearPartidaMultijugador = function(datos) {
  const codigo = 'GAME_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  const partida = new Partida(codigo);
  
  partida.modo = datos.modo || 'individual';
  partida.nombre = datos.nombre || 'Partida sin nombre';
  partida.maxJug = datos.modo === '1vs1' ? 2 : 4;
  partida.estado = 'esperando';
  
  // Agregar jugador creador (sin socketId aún, se agregará cuando se conecte por WebSocket)
  partida.jugadores.push({
    email: datos.jugador.email,
    nick: datos.jugador.nick,
    socketId: null, // Se asignará cuando se conecte
    tanque: null, // Se elegirá después
    puntos: 0,
    vidas: 3
  });
  
  this.partidas[codigo] = partida;
  
  console.log('[Sistema] Partida creada:', codigo, 'Modo:', partida.modo, 'Creador:', datos.jugador.nick);
  console.log('[Sistema] Total partidas en sistema:', Object.keys(this.partidas).length);
  console.log('[Sistema] Códigos de partidas:', Object.keys(this.partidas));
  return partida;
};

Sistema.prototype.obtenerPartidasDisponibles = function() {
  const disponibles = [];
  
  for (let codigo in this.partidas) {
    const partida = this.partidas[codigo];
    
    // Solo mostrar partidas que están esperando jugadores
    if (partida.estado === 'esperando') {
      disponibles.push({
        codigo: partida.codigo,
        nombre: partida.nombre,
        modo: partida.modo,
        jugadores: partida.jugadores,
        maxJug: partida.maxJug,
        estado: partida.estado
      });
    }
  }
  
  return disponibles;
};

Sistema.prototype.unirseAPartida = function(codigo, jugador) {
  const partida = this.partidas[codigo];
  
  if (!partida) {
    return { ok: false, error: 'Partida no encontrada' };
  }
  
  if (partida.estado !== 'esperando') {
    return { ok: false, error: 'La partida ya comenzó' };
  }
  
  if (partida.jugadores.length >= partida.maxJug) {
    return { ok: false, error: 'Partida llena' };
  }
  
  // Verificar que el jugador no esté ya en la partida
  const yaEsta = partida.jugadores.some(j => j.email === jugador.email);
  if (yaEsta) {
    return { ok: true, mensaje: 'Ya estás en esta partida' };
  }
  
  partida.jugadores.push({
    email: jugador.email,
    nick: jugador.nick,
    tanque: null, // Se elegirá después
    puntos: 0,
    vidas: 3
  });
  
  console.log('[Sistema] Jugador unido:', jugador.nick, 'a partida:', codigo);
  
  // Si se llenó la partida, cambiar estado
  if (partida.jugadores.length >= partida.maxJug) {
    partida.estado = 'en-curso';
    partida.tiempoInicio = Date.now();
  }
  
  return { ok: true, partida: partida };
};

Sistema.prototype.obtenerPartida = function(codigo) {
  return this.partidas[codigo] || null;
};

Sistema.prototype.actualizarEstadoPartida = function(codigo, estado) {
  if (this.partidas[codigo]) {
    this.partidas[codigo].estado = estado;
    return true;
  }
  return false;
};
function Usuario(nick){
  this.nick=nick;
}

module.exports.Sistema=Sistema;