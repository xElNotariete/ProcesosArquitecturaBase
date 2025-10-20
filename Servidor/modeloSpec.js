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

  it("eliminar usuario", function() {
    sistema.agregarUsuario("juan");
    const resultado = sistema.eliminarUsuario("juan");
    expect(resultado.nick).toEqual("juan");
    const activo = sistema.usuarioActivo("juan");
    expect(activo.activo).toBeFalse();
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