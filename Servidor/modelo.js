function Sistema(){
 this.usuarios={};

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

}

function Usuario(nick){
 this.nick=nick;
}
module.exports.Sistema=Sistema
