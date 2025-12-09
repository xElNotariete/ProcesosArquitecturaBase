function ControlWeb() {
  // Función auxiliar para leer cookies
  this.getCookie = function (name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  this.mostrarAgregarUsuario = function () {
    $("#bnv").remove();
    $("#mAU").remove();
    let cadena = '<div id="mAU">';
    cadena = cadena + '<div class="card"><div class="card-body">';
    cadena = cadena + '<h5 class="card-title">Iniciar Sesión</h5>';
    cadena =
      cadena +
      '<p class="card-text text-muted">Inicia sesión con tu cuenta de Google</p>';
    cadena =
      cadena +
      '<div class="text-center"><a href="/auth/google"><img src="./img/btn_google_signin.svg" style="height:46px;" alt="Sign in with Google"></a></div>';
    cadena = cadena + "</div></div></div>";
    $("#au").html(cadena);
    $("#au").show();
  };

  this.mostrarObtenerUsuarios = function () {
    var cadena = '<div id="mOU" class="form-group">';
    cadena = cadena + "<h4>Obtener Usuarios</h4>";
    cadena =
      cadena +
      '<button id="btnOU" type="button" class="btn btn-info">Mostrar Usuarios</button>';
    cadena = cadena + '<div id="listaUsuarios" class="mt-3"></div>';
    cadena = cadena + "</div>";
    $("#contenido").append(cadena);

    $("#btnOU").on("click", function () {
      $.ajax({
        type: "GET",
        url: "/obtenerUsuarios",
        success: function (data) {
          var usuarios = '<h5>Lista de Usuarios:</h5><ul class="list-group">';
          for (var nick in data) {
            usuarios += '<li class="list-group-item">' + nick + "</li>";
          }
          usuarios += "</ul>";
          $("#listaUsuarios").html(usuarios);
        },
        error: function (xhr, textStatus, errorThrown) {
          $("#listaUsuarios").html(
            '<div class="alert alert-danger">Error: ' + errorThrown + "</div>"
          );
        },
      });
    });
  };

  this.mostrarNumeroUsuarios = function () {
    var cadena = '<div id="mNU" class="form-group">';
    cadena = cadena + "<h4>Número de Usuarios</h4>";
    cadena =
      cadena +
      '<button id="btnNU" type="button" class="btn btn-success">Contar Usuarios</button>';
    cadena = cadena + '<div id="conteoUsuarios" class="mt-3"></div>';
    cadena = cadena + "</div>";
    $("#contenido").append(cadena);

    $("#btnNU").on("click", function () {
      $.ajax({
        type: "GET",
        url: "/numeroUsuarios",
        success: function (data) {
          $("#conteoUsuarios").html(
            '<div class="alert alert-info"><strong>Total de usuarios: ' +
              data.num +
              "</strong></div>"
          );
        },
        error: function (xhr, textStatus, errorThrown) {
          $("#conteoUsuarios").html(
            '<div class="alert alert-danger">Error: ' + errorThrown + "</div>"
          );
        },
      });
    });
  };

  this.mostrarUsuarioActivo = function () {
    var cadena = '<div id="mUA" class="form-group">';
    cadena = cadena + "<h4>Verificar Usuario Activo</h4>";
    cadena = cadena + '<label for="nickActivo">Nick a verificar:</label>';
    cadena =
      cadena +
      '<input type="text" class="form-control" id="nickActivo" placeholder="Ingrese el nick">';
    cadena =
      cadena +
      '<button id="btnUA" type="button" class="btn btn-warning mt-2">Verificar</button>';
    cadena = cadena + '<div id="resultadoActivo" class="mt-3"></div>';
    cadena = cadena + "</div>";
    $("#contenido").append(cadena);

    $("#btnUA").on("click", function () {
      let nick = $("#nickActivo").val();
      if (nick) {
        $.ajax({
          type: "GET",
          url: "/usuarioActivo/" + nick,
          success: function (data) {
            var mensaje = data.activo
              ? '<div class="alert alert-success">El usuario <strong>' +
                nick +
                "</strong> está activo</div>"
              : '<div class="alert alert-warning">El usuario <strong>' +
                nick +
                "</strong> no está activo</div>";
            $("#resultadoActivo").html(mensaje);
          },
          error: function (xhr, textStatus, errorThrown) {
            $("#resultadoActivo").html(
              '<div class="alert alert-danger">Error: ' + errorThrown + "</div>"
            );
          },
        });
      } else {
        $("#resultadoActivo").html(
          '<div class="alert alert-danger">Por favor, ingrese un nick</div>'
        );
      }
    });
  };

  this.mostrarEliminarUsuario = function () {
    var cadena = '<div id="mEU" class="form-group">';
    cadena = cadena + "<h4>Eliminar Usuario</h4>";
    cadena = cadena + '<label for="nickEliminar">Nick a eliminar:</label>';
    cadena =
      cadena +
      '<input type="text" class="form-control" id="nickEliminar" placeholder="Ingrese el nick">';
    cadena =
      cadena +
      '<button id="btnEU" type="button" class="btn btn-danger mt-2">Eliminar</button>';
    cadena = cadena + '<div id="resultadoEliminar" class="mt-3"></div>';
    cadena = cadena + "</div>";
    $("#contenido").append(cadena);

    $("#btnEU").on("click", function () {
      let nick = $("#nickEliminar").val();
      if (nick) {
        $.ajax({
          type: "GET",
          url: "/eliminarUsuario/" + nick,
          success: function (data) {
            var mensaje =
              data.nick !== -1
                ? '<div class="alert alert-success">Usuario <strong>' +
                  nick +
                  "</strong> eliminado correctamente</div>"
                : '<div class="alert alert-warning">El usuario <strong>' +
                  nick +
                  "</strong> no existe</div>";
            $("#resultadoEliminar").html(mensaje);
            if (data.nick !== -1) {
              $("#nickEliminar").val(""); // Limpiar el input
            }
          },
          error: function (xhr, textStatus, errorThrown) {
            $("#resultadoEliminar").html(
              '<div class="alert alert-danger">Error: ' + errorThrown + "</div>"
            );
          },
        });
      } else {
        $("#resultadoEliminar").html(
          '<div class="alert alert-danger">Por favor, ingrese un nick</div>'
        );
      }
    });
  };

  this.comprobarSesion = function () {
    let nick = this.getCookie("nick");
    if (nick) {
      // Usuario logueado - mostrar dashboard
      $("#landingPage").hide();
      $("#dashboard").show();
      $("#btnSalir").show();

      // Mostrar mensaje de bienvenida
      $("#welcomeMessage").html(
        '<div class="alert alert-success alert-dismissible fade show" role="alert">' +
          "<strong>¡Bienvenido al sistema, " +
          nick +
          "!</strong> " +
          '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
          '<span aria-hidden="true">&times;</span>' +
          "</button>" +
          "</div>"
      );
    } else {
      // Sin sesión - mostrar landing page
      $("#dashboard").hide();
      $("#landingPage").show();
      $("#btnSalir").hide();
    }
  };

  this.mostrarLoginForm = function () {
    // Ocultar la hero section
    $("#landingPage .hero-section").hide();
    $("#registroFormSection").hide();
    $("#loginFormSection").show();
    this.setupLoginForm();
  };

  this.mostrarRegistroForm = function () {
    // Ocultar la hero section
    $("#landingPage .hero-section").hide();
    $("#loginFormSection").hide();
    $("#registroFormSection").show();
    this.setupRegistroForm();
  };

  this.volverLanding = function () {
    $("#loginFormSection").hide();
    $("#registroFormSection").hide();
    $("#landingPage .hero-section").show();
  };

  this.setupLoginForm = function () {
    const cw = this;
    $("#formLogin")
      .off("submit")
      .on("submit", function (e) {
        e.preventDefault();
        const email = $("#emailLogin").val();
        const password = $("#passwordLogin").val();

        rest.loginUsuario(email, password, function (data) {
          if (data && data.nick) {
            document.cookie = "nick=" + data.nick + "; path=/";
            $("#mensajeLogin")
              .removeClass("alert-danger")
              .addClass("alert-success")
              .text("¡Login exitoso! Redirigiendo...")
              .show();
            setTimeout(function () {
              location.reload();
            }, 1000);
          } else {
            $("#mensajeLogin")
              .removeClass("alert-success")
              .addClass("alert-danger")
              .text("Email o contraseña incorrectos")
              .show();
            // Mostrar modal de error en login fallido
            cw.mostrarModal("No se ha podido iniciar sesión");
          }
        });
      });
  };

  this.setupRegistroForm = function () {
    const cw = this;
    $("#formRegistro")
      .off("submit")
      .on("submit", function (e) {
        e.preventDefault();
        const nick = $("#nickRegistro").val();
        const email = $("#emailRegistro").val();
        const password = $("#passwordRegistro").val();

        // Validar nick
        const nickRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!nickRegex.test(nick)) {
          $("#mensajeRegistro")
            .removeClass("alert-success")
            .addClass("alert-danger")
            .text(
              "El nick debe tener entre 3 y 20 caracteres (solo letras, números y guiones bajos)"
            )
            .show();
          return;
        }

        // Validar password
        if (password.length < 6) {
          $("#mensajeRegistro")
            .removeClass("alert-success")
            .addClass("alert-danger")
            .text("La contraseña debe tener al menos 6 caracteres")
            .show();
          return;
        }

        rest.registrarUsuario(nick, email, password, function (data) {
          if (data && data.nick !== -1) {
            $("#mensajeRegistro")
              .removeClass("alert-danger")
              .addClass("alert-success")
              .text(
                "¡Registro exitoso! Se ha enviado un correo de confirmación a " +
                  email
              )
              .show();
            setTimeout(function () {
              cw.volverLanding();
            }, 3000);
          } else if (data.error === "nick") {
            cw.mostrarModal("El nick ya está en uso. Por favor, elige otro.");
          } else if (data.error === "email") {
            cw.mostrarModal("El email ya está registrado. Por favor, inicia sesión.");
          } else {
            cw.mostrarModal("No se ha podido registrar el usuario");
          }
        });
      });
  };

  this.mostrarMensaje = function (msg) {
    $("#au").html(
      '<div class="alert alert-info alert-dismissible fade show" role="alert">' +
        msg +
        '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
        '<span aria-hidden="true">&times;</span>' +
        "</button>" +
        "</div>"
    );
    $("#au").show();
  };

  this.salir = function () {
    //localStorage.removeItem("nick");
    // Eliminar la cookie
    document.cookie = "nick=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    rest.cerrarSesion();
    location.reload();
  };

  this.mostrarRegistro = function () {
    $("#fmRegistro").remove();
    $("#registro").load("registro.html", function (response, status, xhr) {
      if (status == "error") {
        console.log(
          "Error cargando registro.html:",
          xhr.status,
          xhr.statusText
        );
        return;
      }
      console.log("registro.html cargado correctamente");

      $("#btnRegistro").on("click", function (e) {
        e.preventDefault();
        let nick = $("#nick").val().trim();
        let nombre = $("#nombre").val().trim();
        let apellidos = $("#apellidos").val().trim();
        let email = $("#email").val().trim();
        let pwd = $("#pwd").val();

        // Validar campos obligatorios
        if (!nick || !email || !pwd) {
          cw.mostrarMensaje(
            "Por favor, completa los campos obligatorios: nick, email y contraseña"
          );
          return;
        }

        // Validar nick (solo letras, números y guiones bajos, 3-20 caracteres)
        const nickRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!nickRegex.test(nick)) {
          cw.mostrarMensaje(
            "El nick debe tener entre 3 y 20 caracteres (solo letras, números y guiones bajos)"
          );
          return;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          cw.mostrarMensaje("Por favor, introduce un email válido");
          return;
        }

        // Validar longitud de contraseña
        if (pwd.length < 6) {
          cw.mostrarMensaje("La contraseña debe tener al menos 6 caracteres");
          return;
        }

        rest.registrarUsuario(nick, email, pwd);
      });
    });
  };

  this.mostrarLogin = function () {
    if (this.getCookie("nick")) {
      return true;
    }
    $("#fmLogin").remove();
    $("#registro").load("login.html", function () {
      $("#btnLogin").on("click", function () {
        let email = $("#email").val().trim();
        let pwd = $("#pwd").val();

        // Validar campos vacíos
        if (!email || !pwd) {
          cw.mostrarMensaje("Por favor, introduce email y contraseña");
          return;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          cw.mostrarMensaje("Por favor, introduce un email válido");
          return;
        }

        rest.loginUsuario(email, pwd);
      });
    });
  };

  this.limpiar = function () {
    $("#registro").empty();
  };

  this.mostrarModal = function (m) {
    $("#msg").remove();
    let cadena = "<div id='msg'>" + m + "</div>";
    $("#mBody").html(cadena);
    $("#miModal").modal('show');
  };
  
}
