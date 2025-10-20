function Sistema() {
  this.usuarios = {};

  this.agregarUsuario = function(nick) {
    this.usuarios[nick] = new Usuario(nick);
  };

  this.obtenerUsuarios = function() {
    return this.usuarios;
  };

  this.usuarioActivo = function(nick) {
    return this.usuarios.hasOwnProperty(nick);
  };

  this.eliminarUsuario = function(nick) {
    if (this.usuarios.hasOwnProperty(nick)) {
      delete this.usuarios[nick];
      console.log(`Usuario "${nick}" eliminado correctamente.`);
    } else {
      console.log(`No existe ningún usuario con el nick "${nick}".`);
    }
  };

  this.numeroUsuarios = function() {
    return Object.keys(this.usuarios).length;
  };
}

function Usuario(nick) {
  this.nick = nick;
}