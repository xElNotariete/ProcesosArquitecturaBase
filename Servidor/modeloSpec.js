const modelo = require("./modelo.js");
describe('El sistema...', function() {
let sistema;
beforeEach(function() {
sistema=new modelo.Sistema();
});


  it("agregar usuario", function() {
    const resultado = sistema.agregarUsuario("ana");
    expect(resultado.nick).toEqual("ana");
    const activo = sistema.usuarioActivo("ana");
    expect(activo.activo).toBeTrue();
  });

  xit("eliminar usuario", function(done) {
    sistema.agregarUsuario("juan");
    sistema.eliminarUsuario("juan", function(resultado){
      expect(resultado.ok).toBeTrue();
      const activo = sistema.usuarioActivo("juan");
      expect(activo.activo).toBeFalse();
      done();
    });
  });

  it("obtener usuarios", function() {
    sistema.agregarUsuario("ana");
    sistema.agregarUsuario("luis");
    const usuarios = sistema.obtenerUsuarios();
    expect(Object.keys(usuarios).length).toEqual(2);
  });

  it("inicialmente no hay usuarios", function() {
    const numUsuarios = sistema.numeroUsuarios();
    expect(numUsuarios.num).toEqual(0);
  });

  it("usuario activo", function() {
    sistema.agregarUsuario("ana");
    const activoAna = sistema.usuarioActivo("ana");
    const activoMaria = sistema.usuarioActivo("maria");
    expect(activoAna.activo).toBeTrue();
    expect(activoMaria.activo).toBeFalse();
  });
});
describe("Pruebas de las partidas", function(){
  let sistema;
  let usr;
  let usr2;
  let usr3;
  
  beforeEach(function(){
    sistema = new modelo.Sistema();
    usr = {"nick":"Pepe","email":"pepe@pepe.es"};
    usr2 = {"nick":"Pepa","email":"pepa@pepa.es"};
    usr3 = {"nick":"Pepo","email":"pepo@pepo.es"};
    sistema.agregarUsuario(usr.nick);
    sistema.agregarUsuario(usr2.nick);
    sistema.agregarUsuario(usr3.nick);
    // Asignar emails a los usuarios en memoria
    sistema.usuarios[usr.nick].email = usr.email;
    sistema.usuarios[usr2.nick].email = usr2.email;
    sistema.usuarios[usr3.nick].email = usr3.email;
  });

  it("Usuarios y partidas en el sistema", function(){
    expect(sistema.numeroUsuarios().num).toEqual(3);
    expect(sistema.obtenerPartidasDisponibles().length).toEqual(0);
  });

  it("Crear partida", function(){
    const resultado = sistema.crearPartida(usr.email);
    expect(resultado.ok).toBeTrue();
    expect(resultado.codigo).toBeDefined();
    expect(resultado.partida.jugadores.length).toEqual(1);
    expect(resultado.partida.jugadores[0]).toEqual(usr.nick);
  });

  it("Unir a partida", function(){
    const res1 = sistema.crearPartida(usr.email);
    const codigo = res1.codigo;
    const res2 = sistema.unirAPartida(usr2.email, codigo);
    expect(res2.ok).toBeTrue();
    expect(res2.partida.jugadores.length).toEqual(2);
    expect(res2.partida.jugadores).toContain(usr.nick);
    expect(res2.partida.jugadores).toContain(usr2.nick);
  });

  it("Un usuario no puede estar dos veces", function(){
    const res1 = sistema.crearPartida(usr.email);
    const codigo = res1.codigo;
    const res2 = sistema.unirAPartida(usr.email, codigo);
    expect(res2.ok).toBeTrue();
    expect(res2.mensaje).toEqual('Jugador ya en la partida');
    expect(res2.partida.jugadores.length).toEqual(1);
  });

  it("Obtener partidas", function(){
    const res1 = sistema.crearPartida(usr.email);
    const codigo1 = res1.codigo;
    const res2 = sistema.crearPartida(usr3.email);
    const codigo2 = res2.codigo;
    let disponibles = sistema.obtenerPartidasDisponibles();
    expect(disponibles.length).toEqual(2);
    sistema.unirAPartida(usr2.email, codigo1);
    disponibles = sistema.obtenerPartidasDisponibles();
    expect(disponibles.length).toEqual(1);
    expect(disponibles[0].codigo).toEqual(codigo2);
    expect(disponibles[0].emailCreador).toEqual(usr3.email);
  });
});
