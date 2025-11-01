const datos = require("./cad.js");

function Sistema(){
 this.usuarios={};
 // inicializar acceso a datos
 this.cad = new datos.CAD();
 // intentar conectar a Mongo Atlas; si funciona, se imprimirá el mensaje
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
else{
console.log("el nick "+nick+" está en uso");
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
this.eliminarUsuario = function(nick) {
    let res = {"nick": -1};
    if (this.usuarios.hasOwnProperty(nick)) {
      delete this.usuarios[nick];
      res.nick = nick;
      console.log(`Usuario "${nick}" eliminado correctamente.`);
    } else {
      console.log(`No existe ningún usuario con el nick "${nick}".`);
    }
    return res;
  }
   this.numeroUsuarios = function() {
    let res = {"num": Object.keys(this.usuarios).length};
    return res;
  };

  // buscar o crear usuario de Google en MongoDB
  this.usuarioGoogle = function(usr, callback) {
    this.cad.buscarOCrearUsuario(usr, function(obj) {
      callback(obj);
    });
  };

}

function Usuario(nick){
 this.nick=nick;
}
module.exports.Sistema=Sistema
