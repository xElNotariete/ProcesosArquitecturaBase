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
    console.log("[comprobarSesion] Todas las cookies:", document.cookie);
    let nick = this.getCookie("nick");
    console.log("[comprobarSesion] Nick:", nick);
    if (nick) {
      // Usuario logueado - mostrar dashboard
      $("#landingPage").hide();
      $("#dashboard").show();
      $("#btnSalir").show();

      // Recuperar email de la cookie si existe
      let email = this.getCookie("email");
      console.log("[comprobarSesion] Email de cookie:", email);
      if (email) {
        ws.email = email;
        console.log("[comprobarSesion] Email asignado a ws:", ws.email);
      }

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
            document.cookie = "email=" + data.email + "; path=/";
            ws.email = data.email;
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
    // Eliminar las cookies
    document.cookie = "nick=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
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

  this.mostrarCrearPartida = function () {
    const cw = this;
    let cadena = '<div id="mCP" class="card shadow-sm">';
    cadena += '<div class="card-body">';
    cadena += '<h5 class="card-title"><i class="fas fa-plus-circle"></i> Crear Nueva Partida</h5>';
    cadena += '<p class="card-text text-muted">Crea una partida y espera a que otro jugador se una</p>';
    cadena += '<button id="btnCrearPartida" type="button" class="btn btn-primary btn-block">';
    cadena += '<i class="fas fa-gamepad"></i> Crear Partida</button>';
    cadena += '<div id="esperandoRival" style="display:none;"></div>';
    cadena += '<div id="infoPartida" class="mt-3"></div>';
    cadena += '</div></div>';
    $("#contenido").append(cadena);
    $("#contenido").show();

    $("#btnCrearPartida").on("click", function () {
      ws.crearPartida();
      $("#btnCrearPartida").prop("disabled", true);
      cw.mostrarEsperandoRival();
    });
  };

  this.mostrarEsperandoRival = function () {
    let cadena = '<div class="text-center mt-4">';
    cadena += '<div class="spinner-border text-primary" role="status">';
    cadena += '<span class="sr-only">Cargando...</span>';
    cadena += '</div>';
    cadena += '<h5 class="mt-3 text-primary">Esperando rival...</h5>';
    cadena += '<p class="text-muted">Código de partida: <strong id="codigoPartida"></strong></p>';
    cadena += '</div>';
    $("#esperandoRival").html(cadena);
    $("#esperandoRival").show();
    
    // Actualizar el código cuando esté disponible
    if (ws.codigo) {
      $("#codigoPartida").text(ws.codigo);
    } else {
      setTimeout(function() {
        if (ws.codigo) {
          $("#codigoPartida").text(ws.codigo);
        }
      }, 500);
    }
  };

  this.mostrarListaPartidas = function (listaPartidas) {
    let cadena = '<div id="mLP" class="card shadow-sm mt-3">';
    cadena += '<div class="card-body">';
    cadena += '<h5 class="card-title"><i class="fas fa-list"></i> Partidas Disponibles</h5>';
    cadena += '<p class="card-text text-muted">Selecciona una partida para unirte</p>';
    cadena += '<div id="tablaPartidas"></div>';
    cadena += '</div></div>';
    $("#contenido").append(cadena);
    $("#contenido").show();
    
    this.actualizarListaPartidas(listaPartidas);
  };

  this.actualizarListaPartidas = function (listaPartidas) {
    const cw = this;
    let cadena = "";
    
    if (!listaPartidas || Object.keys(listaPartidas).length === 0) {
      cadena = '<div class="alert alert-info">';
      cadena += '<i class="fas fa-info-circle"></i> No hay partidas disponibles en este momento';
      cadena += '</div>';
    } else {
      cadena = '<div class="table-responsive">';
      cadena += '<table class="table table-hover table-striped">';
      cadena += '<thead class="thead-dark">';
      cadena += '<tr>';
      cadena += '<th>Código</th>';
      cadena += '<th>Jugador</th>';
      cadena += '<th>Acción</th>';
      cadena += '</tr>';
      cadena += '</thead>';
      cadena += '<tbody>';
      
      for (let codigo in listaPartidas) {
        let partida = listaPartidas[codigo];
        cadena += '<tr>';
        cadena += '<td><span class="badge badge-primary">' + codigo + '</span></td>';
        cadena += '<td>' + (partida.owner || 'Usuario') + '</td>';
        cadena += '<td>';
        cadena += '<button class="btn btn-success btn-sm btnUnirse" data-codigo="' + codigo + '">';
        cadena += '<i class="fas fa-sign-in-alt"></i> Unirse';
        cadena += '</button>';
        cadena += '</td>';
        cadena += '</tr>';
      }
      
      cadena += '</tbody>';
      cadena += '</table>';
      cadena += '</div>';
    }
    
    $("#tablaPartidas").html(cadena);
    
    // Asignar eventos a los botones de unirse
    $(".btnUnirse").on("click", function () {
      let codigo = $(this).data("codigo");
      ws.unirAPartida(codigo);
      cw.mostrarMensaje("Uniéndose a la partida " + codigo + "...");
      $(this).prop("disabled", true);
    });
  };

  // =============== NEXUS PROTOCOL - INTERFAZ DE JUEGO ===============
  
  // Estilos CSS para la interfaz NEXUS PROTOCOL
  this.obtenerEstilosNexus = function() {
    return `
      <style>
        .nexus-container {
          background: linear-gradient(135deg, #1a0a2e 0%, #3d1f5c 50%, #1a0a2e 100%);
          min-height: 100vh;
          color: #ff69b4;
          font-family: 'Courier New', monospace;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }
        .nexus-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            repeating-linear-gradient(0deg, rgba(255,105,180,0.03) 0px, transparent 1px, transparent 2px, rgba(255,105,180,0.03) 3px),
            repeating-linear-gradient(90deg, rgba(255,105,180,0.03) 0px, transparent 1px, transparent 2px, rgba(255,105,180,0.03) 3px);
          pointer-events: none;
        }
        .nexus-title {
          text-align: center;
          margin-top: 80px;
          margin-bottom: 60px;
          text-shadow: 0 0 20px #ff69b4, 0 0 40px #ff1493;
        }
        .nexus-title h1 {
          font-size: 72px;
          font-weight: bold;
          letter-spacing: 20px;
          margin: 0;
          color: #ff1493;
          animation: glow 2s ease-in-out infinite alternate;
        }
        .nexus-title h2 {
          font-size: 36px;
          font-weight: 300;
          letter-spacing: 15px;
          margin: 10px 0 0 0;
          color: #ff6b35;
        }
        @keyframes glow {
          from { text-shadow: 0 0 20px #ff69b4, 0 0 30px #ff1493; }
          to { text-shadow: 0 0 30px #ff1493, 0 0 60px #ff1493, 0 0 80px #ff69b4; }
        }
        .nexus-btn {
          background: transparent;
          border: 2px solid #ff69b4;
          color: #ff69b4;
          padding: 15px 40px;
          font-size: 18px;
          font-family: 'Courier New', monospace;
          letter-spacing: 3px;
          cursor: pointer;
          margin: 10px;
          transition: all 0.3s;
          text-transform: uppercase;
          position: relative;
          overflow: hidden;
        }
        .nexus-btn:hover {
          background: #ff69b4;
          color: #1a0a2e;
          box-shadow: 0 0 20px #ff69b4;
          transform: scale(1.05);
        }
        .nexus-btn-secondary {
          border-color: #ff6b35;
          color: #ff6b35;
        }
        .nexus-btn-secondary:hover {
          background: #ff6b35;
          color: #0a0e27;
          box-shadow: 0 0 20px #ff6b35;
        }
        .nexus-menu {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 40px;
        }
        .nexus-mode-selector {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin-top: 60px;
          flex-wrap: wrap;
        }
        .nexus-mode-card {
          background: rgba(255, 105, 180, 0.05);
          border: 2px solid #9d4edd;
          padding: 40px 30px;
          cursor: pointer;
          transition: all 0.3s;
          min-width: 200px;
          text-align: center;
        }
        .nexus-mode-card:hover {
          background: rgba(157, 78, 221, 0.15);
          box-shadow: 0 0 30px rgba(157, 78, 221, 0.5);
          transform: translateY(-10px);
        }
        .nexus-mode-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        .nexus-mode-title {
          font-size: 20px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .nexus-stats-container {
          max-width: 600px;
          margin: 60px auto;
          background: rgba(157, 78, 221, 0.05);
          border: 2px solid #9d4edd;
          padding: 40px;
        }
        .nexus-stat-row {
          display: flex;
          justify-content: space-between;
          padding: 15px 0;
          border-bottom: 1px solid rgba(157, 78, 221, 0.3);
        }
        .nexus-stat-label {
          font-size: 16px;
          color: #ff69b4;
        }
        .nexus-stat-value {
          font-size: 18px;
          font-weight: bold;
          color: #ff6b35;
        }
        .nexus-volume-control {
          position: absolute;
          top: 20px;
          right: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .nexus-volume-label {
          color: #ff69b4;
          font-size: 14px;
          letter-spacing: 2px;
        }
        .nexus-subtitle {
          text-align: center;
          font-size: 18px;
          color: #ff6b35;
          letter-spacing: 3px;
          margin-bottom: 40px;
        }
        .nexus-section-title {
          font-size: 28px;
          text-align: center;
          color: #ff1493;
          letter-spacing: 5px;
          margin-bottom: 30px;
          text-transform: uppercase;
        }
      </style>
    `;
  };

  // Pantalla 1: Menú Principal NEXUS
  this.mostrarMenuNexus = function() {
    const cw = this;
    let cadena = this.obtenerEstilosNexus();
    
    cadena += '<div class="nexus-container">';
    
    // Control de volumen
    cadena += '<div class="nexus-volume-control">';
    cadena += '<span class="nexus-volume-label">MUSIC</span>';
    cadena += '<input type="range" min="0" max="100" value="50" class="slider" id="volumeSlider">';
    cadena += '</div>';
    
    // Título principal con animaciones mejoradas
    cadena += '<div class="nexus-title" style="margin-bottom: 80px; position: relative;">';
    cadena += '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 600px; height: 600px; background: radial-gradient(circle, rgba(255,20,147,0.3) 0%, transparent 70%); animation: pulse 3s ease-in-out infinite; z-index: 0;"></div>';
    cadena += '<h1 style="position: relative; z-index: 1; font-size: 120px; letter-spacing: 25px; margin: 0; background: linear-gradient(45deg, #ff1493, #ff6b35, #9d4edd, #ff1493); background-size: 300% 300%; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: gradientShift 4s ease infinite, float 3s ease-in-out infinite;">NEXUS</h1>';
    cadena += '<h2 style="position: relative; z-index: 1; font-size: 48px; letter-spacing: 15px; margin-top: -10px; color: #00ffff; text-shadow: 0 0 30px #00ffff, 0 0 60px #00ffff; animation: blink 2s ease-in-out infinite;">PROTOCOL</h2>';
    cadena += '<div style="margin-top: 20px; font-size: 14px; color: #9d4edd; letter-spacing: 5px; text-shadow: 0 0 10px #9d4edd;">[ SISTEMA DE COMBATE TÁCTICO ]</div>';
    cadena += '</div>';
    
    // Menú de opciones con diseño mejorado usando imágenes
    cadena += '<div class="nexus-menu" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; max-width: 1200px; margin: 0 auto;">';
    
    // Botones con imágenes
    cadena += '<div style="cursor: pointer; transition: all 0.3s; background: transparent; border: none; padding: 0; text-align: center;" id="btnIniciarPartida"><img src="img/iniciarPartida.png" alt="Iniciar Partida" style="width: 100%; height: auto; filter: drop-shadow(0 0 40px rgba(255,20,147,0.8)); transition: all 0.3s; animation: pulseBorder 2s ease-in-out infinite;"><div style="margin-top: 15px; font-size: 24px; font-weight: bold; color: #ff1493; text-shadow: 0 0 20px #ff1493; letter-spacing: 3px;">INICIAR PARTIDA</div></div>';
    cadena += '<div style="cursor: pointer; transition: all 0.3s; background: transparent; border: none; padding: 0;" id="btnVerTanques"><img src="img/VerTanques.png" alt="Ver Tanques" style="width: 100%; height: auto; filter: drop-shadow(0 0 30px rgba(157,78,221,0.6)); transition: all 0.3s;"></div>';
    cadena += '<div style="cursor: pointer; transition: all 0.3s; background: transparent; border: none; padding: 0;" id="btnVerPowerUps"><img src="img/PowerUps.png" alt="Ver Power-Ups" style="width: 100%; height: auto; filter: drop-shadow(0 0 30px rgba(255,107,53,0.6)); transition: all 0.3s;"></div>';
    
    cadena += '</div>';
    cadena += '<div style="margin-top: 40px; text-align: center;"><button class="nexus-btn nexus-btn-secondary" id="btnSalir" style="padding: 20px 60px; font-size: 18px; opacity: 0.8;">SALIR</button></div>';
    
    // Añadir keyframes para animaciones
    cadena += '<style>@keyframes gradientShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } } @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } } @keyframes pulseBorder { 0%, 100% { box-shadow: 0 0 40px rgba(255,20,147,0.8), inset 0 0 30px rgba(255,255,255,0.2); } 50% { box-shadow: 0 0 60px rgba(255,20,147,1), 0 0 80px rgba(255,107,53,0.8), inset 0 0 40px rgba(255,255,255,0.3); } } @keyframes shine { 0% { left: -50%; } 100% { left: 150%; } }</style>';
    
    cadena += '</div>';
    
    $("#contenido").html(cadena);
    $("#contenido").show();
    
    // Eventos de los botones
    $("#btnIniciarPartida").on("click", function() {
      cw.mostrarSeleccionModo();
    });
    
    $("#btnVerTanques").on("click", function() {
      cw.mostrarTanques();
    });
    
    $("#btnVerPowerUps").on("click", function() {
      cw.mostrarPowerUps();
    });
    
    $("#btnSalir").on("click", function() {
      if (confirm("¿Estás seguro de que quieres salir?")) {
        window.location.href = "/";
      }
    });
    
    // Efectos hover para imágenes del lobby
    $("#btnIniciarPartida, #btnVerTanques, #btnVerPowerUps").hover(
      function() {
        $(this).find('img').css({
          'transform': 'translateY(-10px) scale(1.05)',
          'filter': 'drop-shadow(0 0 60px #ff1493) drop-shadow(0 0 90px #ff6b35)'
        });
      },
      function() {
        $(this).find('img').css({
          'transform': 'translateY(0) scale(1)',
          'filter': ''
        });
      }
    );
    
    // Efecto hover para botón salir
    $("#btnSalir").hover(
      function() {
        $(this).css({
          'transform': 'translateY(-5px) scale(1.02)',
          'box-shadow': '0 0 50px currentColor'
        });
      },
      function() {
        $(this).css({
          'transform': 'translateY(0) scale(1)',
          'box-shadow': ''
        });
      }
    );
  };

  // Pantalla: Opciones Multijugador (Crear o Unirse)
  this.mostrarOpcionesMultijugador = function(modo) {
    const cw = this;
    let cadena = this.obtenerEstilosNexus();
    
    const modoTexto = modo === '1vs1' ? '1 VS 1' : 'TODOS CONTRA TODOS';
    const modoDesc = modo === '1vs1' ? '2 JUGADORES' : '2-4 JUGADORES';
    
    cadena += '<div class="nexus-container">';
    cadena += '<div class="nexus-title">';
    cadena += '<h1 style="font-size: 56px; margin-bottom: 10px; text-shadow: 0 0 30px #ff1493;">MULTIJUGADOR</h1>';
    cadena += '<div class="nexus-subtitle" style="color: #ff6b35; letter-spacing: 4px; font-size: 20px; text-shadow: 0 0 15px #ff6b35;">[ ' + modoTexto + ' - ' + modoDesc + ' ]</div>';
    cadena += '</div>';
    
    cadena += '<div style="display: flex; gap: 40px; justify-content: center; margin: 60px auto; max-width: 900px;">';
    
    // Opción Crear Partida
    cadena += '<div class="nexus-mode-card" id="btnCrearPartida" style="flex: 1; border: 4px solid #ff1493; background: linear-gradient(135deg, rgba(255,20,147,0.2) 0%, rgba(26,10,46,0.9) 100%); cursor: pointer; transition: all 0.3s; position: relative; overflow: hidden;">';
    cadena += '<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle at center, rgba(255,20,147,0.3), transparent); opacity: 0; transition: opacity 0.3s;" class="hover-glow"></div>';
    cadena += '<div style="position: relative; z-index: 1;">';
    cadena += '<div class="nexus-mode-icon" style="color: #ff1493; font-size: 90px; margin-bottom: 20px; text-shadow: 0 0 25px #ff1493;">🎮</div>';
    cadena += '<div class="nexus-mode-title" style="color: #ff1493; font-size: 32px; letter-spacing: 3px; margin-bottom: 15px; text-shadow: 0 0 15px #ff1493;">CREAR PARTIDA</div>';
    cadena += '<p style="font-size: 16px; color: #ff69b4; line-height: 1.6; padding: 0 20px;">Genera un código único y<br>compártelo con tus amigos<br>para jugar juntos</p>';
    cadena += '</div></div>';
    
    // Opción Unirse a Partida
    cadena += '<div class="nexus-mode-card" id="btnUnirsePartida" style="flex: 1; border: 4px solid #9d4edd; background: linear-gradient(135deg, rgba(157,78,221,0.2) 0%, rgba(26,10,46,0.9) 100%); cursor: pointer; transition: all 0.3s; position: relative; overflow: hidden;">';
    cadena += '<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle at center, rgba(157,78,221,0.3), transparent); opacity: 0; transition: opacity 0.3s;" class="hover-glow"></div>';
    cadena += '<div style="position: relative; z-index: 1;">';
    cadena += '<div class="nexus-mode-icon" style="color: #9d4edd; font-size: 90px; margin-bottom: 20px; text-shadow: 0 0 25px #9d4edd;">🔗</div>';
    cadena += '<div class="nexus-mode-title" style="color: #9d4edd; font-size: 32px; letter-spacing: 3px; margin-bottom: 15px; text-shadow: 0 0 15px #9d4edd;">UNIRSE A PARTIDA</div>';
    cadena += '<p style="font-size: 16px; color: #bb86fc; line-height: 1.6; padding: 0 20px;">Introduce el código que<br>te compartió tu amigo<br>y únete a la batalla</p>';
    cadena += '</div></div>';
    
    cadena += '</div>';
    
    cadena += '<div class="nexus-menu" style="margin-top: 40px;">';
    cadena += '<button class="nexus-btn nexus-btn-secondary" id="btnAtrasMulti">ATRÁS</button>';
    cadena += '</div></div>';
    
    cadena += '<style>';
    cadena += '#btnCrearPartida:hover, #btnUnirsePartida:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 0 50px rgba(255,20,147,0.8); }';
    cadena += '#btnCrearPartida:hover .hover-glow, #btnUnirsePartida:hover .hover-glow { opacity: 1; }';
    cadena += '#btnUnirsePartida:hover { box-shadow: 0 0 50px rgba(157,78,221,0.8); }';
    cadena += '</style>';
    
    $("#contenido").html(cadena);
    $("#contenido").show();
    
    $("#btnCrearPartida").on("click", function() {
      cw.mostrarSeleccionTanque(modo, 'crear');
    });
    
    $("#btnUnirsePartida").on("click", function() {
      cw.mostrarFormularioUnirse(modo);
    });
    
    $("#btnAtrasMulti").on("click", function() {
      cw.mostrarSeleccionModo();
    });
  };

  // Pantalla: Formulario para unirse a partida
  this.mostrarFormularioUnirse = function(modo) {
    const cw = this;
    let cadena = this.obtenerEstilosNexus();
    
    cadena += '<div class="nexus-container">';
    cadena += '<div class="nexus-title">';
    cadena += '<h1 style="font-size: 56px; margin-bottom: 10px; text-shadow: 0 0 30px #9d4edd;">UNIRSE A PARTIDA</h1>';
    cadena += '<div class="nexus-subtitle" style="color: #bb86fc; letter-spacing: 3px; font-size: 18px;">Introduce el código de tu amigo</div>';
    cadena += '</div>';
    
    cadena += '<div style="max-width: 600px; margin: 60px auto 0; background: linear-gradient(135deg, rgba(157,78,221,0.15) 0%, rgba(10,5,32,0.95) 100%); border: 4px solid #9d4edd; border-radius: 20px; padding: 50px; box-shadow: 0 0 50px rgba(157,78,221,0.6), inset 0 0 30px rgba(157,78,221,0.1);">';
    
    cadena += '<div style="text-align: center; margin-bottom: 30px;">';
    cadena += '<div style="font-size: 80px; margin-bottom: 20px; text-shadow: 0 0 30px #9d4edd;">🔗</div>';
    cadena += '<label style="color: #ff69b4; font-size: 22px; display: block; margin-bottom: 20px; letter-spacing: 3px; text-shadow: 0 0 10px #ff69b4;">CÓDIGO DE PARTIDA</label>';
    cadena += '</div>';
    
    cadena += '<input type="text" id="inputCodigoPartida" placeholder="GAME-XXXXX" style="width: 100%; padding: 20px 25px; font-size: 28px; background: rgba(26,10,46,0.95); border: 3px solid #ff1493; border-radius: 12px; color: #ff6b35; text-align: center; letter-spacing: 5px; font-family: \'Courier New\', monospace; margin-bottom: 30px; box-shadow: inset 0 0 20px rgba(255,20,147,0.3), 0 0 20px rgba(255,20,147,0.4); transition: all 0.3s; text-transform: uppercase;" />';
    
    cadena += '<button class="nexus-btn" id="btnConfirmarUnirse" style="width: 100%; font-size: 24px; padding: 18px; letter-spacing: 4px; background: linear-gradient(135deg, #9d4edd 0%, #ff1493 100%); border: none; box-shadow: 0 0 30px rgba(157,78,221,0.6);">🚀 UNIRSE AHORA</button>';
    cadena += '</div>';
    
    cadena += '<div class="nexus-menu" style="margin-top: 50px;">';
    cadena += '<button class="nexus-btn nexus-btn-secondary" id="btnAtrasUnirse" style="font-size: 18px;">ATRÁS</button>';
    cadena += '</div></div>';
    
    cadena += '<style>';
    cadena += '#inputCodigoPartida:focus { outline: none; border-color: #ff6b35; box-shadow: inset 0 0 25px rgba(255,107,53,0.4), 0 0 30px rgba(255,107,53,0.6); transform: scale(1.02); }';
    cadena += '#btnConfirmarUnirse:hover { transform: translateY(-3px); box-shadow: 0 0 50px rgba(157,78,221,0.9); }';
    cadena += '</style>';
    
    $("#contenido").html(cadena);
    $("#contenido").show();
    
    // Focus automático en el input
    setTimeout(() => $("#inputCodigoPartida").focus(), 300);
    
    $("#btnConfirmarUnirse").on("click", function() {
      const codigo = $("#inputCodigoPartida").val().trim().toUpperCase();
      if (!codigo) {
        $("#inputCodigoPartida").css('border-color', '#ff0000').addClass('shake');
        setTimeout(() => $("#inputCodigoPartida").css('border-color', '#ff1493').removeClass('shake'), 500);
        return;
      }
      // Ir a selección de tanque con el código
      cw.mostrarSeleccionTanque(modo, 'unirse', codigo);
    });
    
    $("#btnAtrasUnirse").on("click", function() {
      cw.mostrarOpcionesMultijugador(modo);
    });
    
    // Enter para unirse
    $("#inputCodigoPartida").on("keypress", function(e) {
      if (e.which === 13) {
        $("#btnConfirmarUnirse").click();
      }
    });
  };

  this.mostrarTanques = function() {
    const cw = this;
    let cadena = this.obtenerEstilosNexus();
    
    cadena += '<div class="nexus-container">';
    cadena += '<div class="nexus-title"><h1 style="font-size: 48px; margin-bottom: 20px;">ARSENAL TANQUES</h1></div>';
    cadena += '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; max-width: 900px; margin: 0 auto 40px;">';
    
    cadena += '<div class="nexus-tank-card"><div class="tank-icon" style="margin-bottom: 15px;"><img src="img/phantom.png" alt="PHANTOM" style="width: 140px; height: 140px; filter: drop-shadow(0 0 20px #ff1493);"></div><h3 style="color: #ff1493; font-size: 32px; margin-bottom: 10px;">PHANTOM</h3><div style="color: #ff69b4; font-size: 16px;"><p><strong>VELOCIDAD:</strong> ★★★★★</p><p><strong>VIDA:</strong> ★★☆☆☆</p><p><strong>CADENCIA:</strong> ★★★☆☆</p><p style="margin-top: 10px; color: #9d4edd; font-size: 14px;">El más rápido pero frágil</p></div></div>';
    cadena += '<div class="nexus-tank-card"><div class="tank-icon" style="margin-bottom: 15px;"><img src="img/juggernaut.png" alt="JUGGERNAUT" style="width: 140px; height: 140px; filter: drop-shadow(0 0 20px #ff1493);"></div><h3 style="color: #ff1493; font-size: 32px; margin-bottom: 10px;">JUGGERNAUT</h3><div style="color: #ff69b4; font-size: 16px;"><p><strong>VELOCIDAD:</strong> ★★☆☆☆</p><p><strong>VIDA:</strong> ★★★★★</p><p><strong>CADENCIA:</strong> ★★☆☆☆</p><p style="margin-top: 10px; color: #9d4edd; font-size: 14px;">Resistente y poderoso</p></div></div>';
    cadena += '<div class="nexus-tank-card"><div class="tank-icon" style="margin-bottom: 15px;"><img src="img/Striker.png" alt="STRIKER" style="width: 140px; height: 140px; filter: drop-shadow(0 0 20px #ff1493);"></div><h3 style="color: #ff1493; font-size: 32px; margin-bottom: 10px;">STRIKER</h3><div style="color: #ff69b4; font-size: 16px;"><p><strong>VELOCIDAD:</strong> ★★★☆☆</p><p><strong>VIDA:</strong> ★★★☆☆</p><p><strong>CADENCIA:</strong> ★★★★★</p><p style="margin-top: 10px; color: #9d4edd; font-size: 14px;">Disparo rápido y preciso</p></div></div>';
    cadena += '<div class="nexus-tank-card"><div class="tank-icon" style="margin-bottom: 15px;"><img src="img/Shadow.png" alt="SHADOW" style="width: 140px; height: 140px; filter: drop-shadow(0 0 20px #ff1493);"></div><h3 style="color: #ff1493; font-size: 32px; margin-bottom: 10px;">SHADOW</h3><div style="color: #ff69b4; font-size: 16px;"><p><strong>VELOCIDAD:</strong> ★★★☆☆</p><p><strong>VIDA:</strong> ★★★☆☆</p><p><strong>CADENCIA:</strong> ★★★☆☆</p><p style="margin-top: 10px; color: #9d4edd; font-size: 14px;">Equilibrado y versátil</p></div></div>';
    
    cadena += '</div><div class="nexus-menu"><button class="nexus-btn" id="btnVolverMenuTanques">VOLVER</button></div></div>';
    
    cadena += '<style>.nexus-tank-card{background:rgba(10,5,32,0.8);border:3px solid #ff1493;border-radius:15px;padding:25px;text-align:center;transition:all 0.3s;box-shadow:0 0 20px rgba(255,20,147,0.3)}.nexus-tank-card:hover{transform:translateY(-5px);box-shadow:0 0 40px rgba(255,20,147,0.6)}.tank-icon{text-shadow:0 0 20px rgba(255,20,147,0.8)}</style>';
    
    $("#contenido").html(cadena);
    $("#contenido").show();
    $("#btnVolverMenuTanques").on("click", function() { cw.mostrarMenuNexus(); });
  };

  this.mostrarPowerUps = function() {
    const cw = this;
    let cadena = this.obtenerEstilosNexus();
    
    cadena += '<div class="nexus-container">';
    cadena += '<div class="nexus-title"><h1 style="font-size: 48px; margin-bottom: 20px;">POWER-UPS</h1></div>';
    cadena += '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; max-width: 900px; margin: 0 auto 40px;">';
    
    cadena += '<div class="nexus-tank-card"><div class="tank-icon" style="margin-bottom: 15px;"><img src="img/overdrive.png" alt="OVERDRIVE" style="width: 140px; height: 140px; filter: drop-shadow(0 0 20px #ff1493);"></div><h3 style="color: #ff1493; font-size: 32px; margin-bottom: 10px;">OVERDRIVE</h3><div style="color: #ff69b4; font-size: 16px;"><p style="margin-top: 10px; color: #9d4edd; font-size: 14px;">Aumenta tu velocidad de movimiento significativamente</p></div></div>';
    cadena += '<div class="nexus-tank-card"><div class="tank-icon" style="margin-bottom: 15px;"><img src="img/rapidfire.png" alt="RAPIDFIRE" style="width: 140px; height: 140px; filter: drop-shadow(0 0 20px #ff1493);"></div><h3 style="color: #ff1493; font-size: 32px; margin-bottom: 10px;">RAPIDFIRE</h3><div style="color: #ff69b4; font-size: 16px;"><p style="margin-top: 10px; color: #9d4edd; font-size: 14px;">Mejora la cadencia de disparo de tu tanque</p></div></div>';
    cadena += '<div class="nexus-tank-card"><div class="tank-icon" style="margin-bottom: 15px;"><img src="img/regencore.png" alt="REGEN CORE" style="width: 140px; height: 140px; filter: drop-shadow(0 0 20px #ff1493);"></div><h3 style="color: #ff1493; font-size: 32px; margin-bottom: 10px;">REGEN CORE</h3><div style="color: #ff69b4; font-size: 16px;"><p style="margin-top: 10px; color: #9d4edd; font-size: 14px;">Restaura un punto de vida completo</p></div></div>';
    cadena += '<div class="nexus-tank-card"><div class="tank-icon" style="margin-bottom: 15px;"><img src="img/fieldForce.png" alt="FORCE FIELD" style="width: 140px; height: 140px; filter: drop-shadow(0 0 20px #ff1493);"></div><h3 style="color: #ff1493; font-size: 32px; margin-bottom: 10px;">FORCE FIELD</h3><div style="color: #ff69b4; font-size: 16px;"><p style="margin-top: 10px; color: #9d4edd; font-size: 14px;">Te hace invulnerable por 5 segundos</p></div></div>';
    cadena += '<div class="nexus-tank-card"><div class="tank-icon" style="margin-bottom: 15px;"><img src="img/multishot.png" alt="MULTI-SHOT" style="width: 140px; height: 140px; filter: drop-shadow(0 0 20px #ff1493);"></div><h3 style="color: #ff1493; font-size: 32px; margin-bottom: 10px;">MULTI-SHOT</h3><div style="color: #ff69b4; font-size: 16px;"><p style="margin-top: 10px; color: #9d4edd; font-size: 14px;">Dispara 3 proyectiles simultáneos</p></div></div>';
    cadena += '<div class="nexus-tank-card"><div class="tank-icon" style="margin-bottom: 15px;"><img src="img/blastmine.png" alt="BLAST MINE" style="width: 140px; height: 140px; filter: drop-shadow(0 0 20px #ff1493);"></div><h3 style="color: #ff1493; font-size: 32px; margin-bottom: 10px;">BLAST MINE</h3><div style="color: #ff69b4; font-size: 16px;"><p style="margin-top: 10px; color: #9d4edd; font-size: 14px;">Coloca bombas explosivas (presiona B)</p></div></div>';
    
    cadena += '</div><div class="nexus-menu"><button class="nexus-btn" id="btnVolverMenuPowerUps">VOLVER</button></div></div>';
    
    cadena += '<style>.nexus-tank-card{background:rgba(10,5,32,0.8);border:3px solid #ff1493;border-radius:15px;padding:25px;text-align:center;transition:all 0.3s;box-shadow:0 0 20px rgba(255,20,147,0.3)}.nexus-tank-card:hover{transform:translateY(-5px);box-shadow:0 0 40px rgba(255,20,147,0.6)}.tank-icon{text-shadow:0 0 20px rgba(255,20,147,0.8)}</style>';
    
    $("#contenido").html(cadena);
    $("#contenido").show();
    $("#btnVolverMenuPowerUps").on("click", function() { cw.mostrarMenuNexus(); });
  };

  // Pantalla 2: Selección de Modo
  this.mostrarSeleccionModo = function() {
    const cw = this;
    let cadena = this.obtenerEstilosNexus();
    
    cadena += '<div class="nexus-container">';
    
    // Título
    cadena += '<div class="nexus-title">';
    cadena += '<h1 style="font-size: 48px;">SELECT MODE</h1>';
    cadena += '</div>';
    
    // Selector de modos con imágenes
    cadena += '<div class="nexus-mode-selector" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; max-width: 1200px; margin: 0 auto;">';
    
    // Modo Individual
    cadena += '<div class="nexus-mode-card" id="modoIndividual" style="cursor: pointer; transition: all 0.3s; background: transparent; border: none; padding: 0;">';
    cadena += '<img src="img/SoloPlayer.png" alt="Modo Individual" style="width: 100%; height: auto; filter: drop-shadow(0 0 30px #ff1493); transition: all 0.3s;">';
    cadena += '</div>';
    
    // Modo 1vs1
    cadena += '<div class="nexus-mode-card" id="modo1vs1" style="cursor: pointer; transition: all 0.3s; background: transparent; border: none; padding: 0;">';
    cadena += '<img src="img/1VS1.png" alt="1VS1" style="width: 100%; height: auto; filter: drop-shadow(0 0 30px #ff1493); transition: all 0.3s;">';
    cadena += '</div>';
    
    // Modo Todos contra Todos
    cadena += '<div class="nexus-mode-card" id="modoTodosContraTodos" style="cursor: pointer; transition: all 0.3s; background: transparent; border: none; padding: 0;">';
    cadena += '<img src="img/TodosContratodos.png" alt="Todos Contra Todos" style="width: 100%; height: auto; filter: drop-shadow(0 0 30px #ff1493); transition: all 0.3s;">';
    cadena += '</div>';
    
    cadena += '</div>';
    cadena += '<style>.nexus-mode-card:hover img { transform: translateY(-10px) scale(1.05); filter: drop-shadow(0 0 50px #ff1493) drop-shadow(0 0 80px #ff6b35); }</style>';
    
    // Botón atrás
    cadena += '<div class="nexus-menu" style="margin-top: 80px;">';
    cadena += '<button class="nexus-btn nexus-btn-secondary" id="btnAtras">ATRÁS</button>';
    cadena += '</div>';
    
    cadena += '</div>';
    
    $("#contenido").html(cadena);
    
    // Eventos de selección de modo
    $("#modoIndividual").on("click", function() {
      cw.mostrarSeleccionTanque('individual');
    });
    
    $("#modo1vs1").on("click", function() {
      cw.mostrarOpcionesMultijugador('1vs1');
    });
    
    $("#modoTodosContraTodos").on("click", function() {
      cw.mostrarOpcionesMultijugador('todos-contra-todos');
    });
    
    $("#btnAtras").on("click", function() {
      cw.mostrarMenuNexus();
    });
  };

  // Nueva pantalla: Selección de Tanque
  this.mostrarSeleccionTanque = function(modo, accion, codigoPartida) {
    const cw = this;
    accion = accion || 'crear'; // 'crear' o 'unirse'
    codigoPartida = codigoPartida || null;
    let cadena = this.obtenerEstilosNexus();
    
    cadena += '<div class="nexus-container">';
    
    // Título
    cadena += '<div class="nexus-title">';
    cadena += '<h1 style="font-size: 48px;">SELECT TANK</h1>';
    cadena += '<div class="nexus-subtitle" style="color: #ff6b35; letter-spacing: 3px;">[ MODO: ' + modo.toUpperCase() + ' ]</div>';
    cadena += '</div>';
    
    // Selector de tanques
    cadena += '<div class="nexus-mode-selector">';
    
    // Tanque Rápido
    cadena += '<div class="nexus-mode-card" id="tanqueRapido" style="border-color: #ff1493;">';
    cadena += '<div class="nexus-mode-icon"><img src="img/phantom.png" alt="PHANTOM" style="width: 110px; height: 110px; filter: drop-shadow(0 0 15px #ff1493);"></div>';
    cadena += '<div class="nexus-mode-title" style="color: #ff1493;">PHANTOM</div>';
    cadena += '<p style="font-size: 12px; color: #ff69b4; margin-top: 10px;">Veloz y ágil<br>⚡ Velocidad: Alta<br>❤️ Vida: Baja<br>💥 Daño: Medio</p>';
    cadena += '</div>';
    
    // Tanque Pesado
    cadena += '<div class="nexus-mode-card" id="tanquePesado" style="border-color: #9d4edd;">';
    cadena += '<div class="nexus-mode-icon"><img src="img/juggernaut.png" alt="JUGGERNAUT" style="width: 110px; height: 110px; filter: drop-shadow(0 0 15px #9d4edd);"></div>';
    cadena += '<div class="nexus-mode-title" style="color: #9d4edd;">JUGGERNAUT</div>';
    cadena += '<p style="font-size: 12px; color: #9d4edd; margin-top: 10px;">Resistente<br>⚡ Velocidad: Baja<br>❤️ Vida: Alta<br>💥 Daño: Alto</p>';
    cadena += '</div>';
    
    // Tanque Equilibrado
    cadena += '<div class="nexus-mode-card" id="tanqueEquilibrado" style="border-color: #ff6b35;">';
    cadena += '<div class="nexus-mode-icon"><img src="img/Shadow.png" alt="SHADOW" style="width: 110px; height: 110px; filter: drop-shadow(0 0 15px #ff6b35);"></div>';
    cadena += '<div class="nexus-mode-title" style="color: #ff6b35;">SHADOW</div>';
    cadena += '<p style="font-size: 12px; color: #ff6b35; margin-top: 10px;">Balanceado<br>⚡ Velocidad: Media<br>❤️ Vida: Media<br>💥 Daño: Medio</p>';
    cadena += '</div>';
    
    // Tanque Francotirador
    cadena += '<div class="nexus-mode-card" id="tanqueFrancotirador" style="border-color: #ff69b4;">';
    cadena += '<div class="nexus-mode-icon"><img src="img/Striker.png" alt="STRIKER" style="width: 110px; height: 110px; filter: drop-shadow(0 0 15px #ff69b4);"></div>';
    cadena += '<div class="nexus-mode-title" style="color: #ff69b4;">STRIKER</div>';
    cadena += '<p style="font-size: 12px; color: #ff69b4; margin-top: 10px;">Precisión letal<br>⚡ Velocidad: Media<br>❤️ Vida: Baja<br>💥 Daño: Muy Alto</p>';
    cadena += '</div>';
    
    cadena += '</div>';
    
    // Botón atrás
    cadena += '<div class="nexus-menu" style="margin-top: 60px;">';
    cadena += '<button class="nexus-btn nexus-btn-secondary" id="btnAtras">ATRÁS</button>';
    cadena += '</div>';
    
    cadena += '</div>';
    
    $("#contenido").html(cadena);
    
    // Eventos de selección de tanque
    $("#tanqueRapido").on("click", function() {
      cw.iniciarPartidaNexus(modo, 'rapido', accion, codigoPartida);
    });
    
    $("#tanquePesado").on("click", function() {
      cw.iniciarPartidaNexus(modo, 'pesado', accion, codigoPartida);
    });
    
    $("#tanqueEquilibrado").on("click", function() {
      cw.iniciarPartidaNexus(modo, 'equilibrado', accion, codigoPartida);
    });
    
    $("#tanqueFrancotirador").on("click", function() {
      cw.iniciarPartidaNexus(modo, 'francotirador', accion, codigoPartida);
    });
    
    $("#btnAtras").on("click", function() {
      cw.mostrarSeleccionModo();
    });
  };

  // Pantalla 3: Victoria
  this.mostrarVictoriaNexus = function(estadisticas) {
    const cw = this;
    const stats = estadisticas || {
      enemigosNeutralizados: 0,
      tiempo: '00:00',
      datosRecopilados: 100
    };
    
    // Guardar modo y tanque para reintentar
    const urlParams = new URLSearchParams(window.location.search);
    const modo = urlParams.get('modo') || 'individual';
    const tanque = urlParams.get('tanque') || 'equilibrado';
    
    let cadena = this.obtenerEstilosNexus();
    
    cadena += '<div class="nexus-container">';
    
    // Título
    cadena += '<div class="nexus-title">';
    cadena += '<h1 style="font-size: 56px; color: #00ff00;">VICTORIA SUBLIME</h1>';
    cadena += '<div class="nexus-subtitle">MISIÓN EXITOSA. NEXO RECALIBRADO</div>';
    cadena += '</div>';
    
    // Estadísticas
    cadena += '<div class="nexus-stats-container">';
    cadena += '<div class="nexus-section-title">ESTADÍSTICAS DE COMBATE</div>';
    
    cadena += '<div class="nexus-stat-row">';
    cadena += '<span class="nexus-stat-label">ENEMIGOS NEUTRALIZADOS</span>';
    cadena += '<span class="nexus-stat-value">' + stats.enemigosNeutralizados + '</span>';
    cadena += '</div>';
    
    cadena += '<div class="nexus-stat-row">';
    cadena += '<span class="nexus-stat-label">TIEMPO</span>';
    cadena += '<span class="nexus-stat-value">' + stats.tiempo + '</span>';
    cadena += '</div>';
    
    cadena += '<div class="nexus-stat-row">';
    cadena += '<span class="nexus-stat-label">DATOS RECOPILADOS</span>';
    cadena += '<span class="nexus-stat-value">' + stats.datosRecopilados + '%</span>';
    cadena += '</div>';
    
    cadena += '</div>';
    
    // Botones
    cadena += '<div class="nexus-menu">';
    cadena += '<button class="nexus-btn" id="btnReintentar">REINTENTAR</button>';
    cadena += '<button class="nexus-btn nexus-btn-secondary" id="btnVolverMenu">VOLVER AL MENÚ</button>';
    cadena += '</div>';
    
    cadena += '</div>';
    
    $("#contenido").html(cadena);
    $("#contenido").show();
    
    // Eventos
    $("#btnReintentar").on("click", function() {
      window.location.href = '/juego?modo=' + modo + '&tanque=' + tanque;
    });
    
    $("#btnVolverMenu").on("click", function() {
      window.location.href = '/?openMenu=true';
    });
  };

  // Pantalla 4: Derrota
  this.mostrarDerrotaNexus = function(estadisticas) {
    const cw = this;
    const stats = estadisticas || {
      enemigosNeutralizados: 0,
      tiempo: '00:00',
      datosRecopilados: 45
    };
    
    // Guardar modo y tanque para reintentar
    const urlParams = new URLSearchParams(window.location.search);
    const modo = urlParams.get('modo') || 'individual';
    const tanque = urlParams.get('tanque') || 'equilibrado';
    
    let cadena = this.obtenerEstilosNexus();
    
    cadena += '<div class="nexus-container">';
    
    // Título
    cadena += '<div class="nexus-title">';
    cadena += '<h1 style="font-size: 56px; color: #ff0000;">SOLDADO CAÍDO</h1>';
    cadena += '<div class="nexus-subtitle">MISIÓN FALLIDA. NEXO DESCALIBRADO</div>';
    cadena += '</div>';
    
    // Estadísticas
    cadena += '<div class="nexus-stats-container">';
    cadena += '<div class="nexus-section-title">ESTADÍSTICAS FINALES</div>';
    
    cadena += '<div class="nexus-stat-row">';
    cadena += '<span class="nexus-stat-label">ENEMIGOS NEUTRALIZADOS</span>';
    cadena += '<span class="nexus-stat-value">' + stats.enemigosNeutralizados + '</span>';
    cadena += '</div>';
    
    cadena += '<div class="nexus-stat-row">';
    cadena += '<span class="nexus-stat-label">TIEMPO</span>';
    cadena += '<span class="nexus-stat-value">' + stats.tiempo + '</span>';
    cadena += '</div>';
    
    cadena += '<div class="nexus-stat-row">';
    cadena += '<span class="nexus-stat-label">DATOS RECOPILADOS</span>';
    cadena += '<span class="nexus-stat-value">' + stats.datosRecopilados + '%</span>';
    cadena += '</div>';
    
    cadena += '</div>';
    
    // Botones
    cadena += '<div class="nexus-menu">';
    cadena += '<button class="nexus-btn" id="btnIntentarDeNuevo">REINTENTAR</button>';
    cadena += '<button class="nexus-btn nexus-btn-secondary" id="btnSalirMenu">VOLVER AL MENÚ</button>';
    cadena += '</div>';
    
    cadena += '</div>';
    
    $("#contenido").html(cadena);
    $("#contenido").show();
    
    // Eventos
    $("#btnIntentarDeNuevo").on("click", function() {
      window.location.href = '/juego?modo=' + modo + '&tanque=' + tanque;
    });
    
    $("#btnSalirMenu").on("click", function() {
      window.location.href = '/?openMenu=true';
    });
  };

  // Función auxiliar para iniciar partida con modo y tanque seleccionado
  this.iniciarPartidaNexus = function(modo, tipoTanque, accion, codigoPartida) {
    const cw = this;
    accion = accion || 'crear';
    
    // Redirigir a la página de juego con los parámetros
    if (modo === 'individual') {
      window.location.href = '/juego?modo=' + modo + '&tanque=' + tipoTanque;
    } else if (accion === 'unirse') {
      // Unirse a partida existente
      if (!codigoPartida) {
        alert('Error: No se proporcionó código de partida');
        return;
      }
      window.location.href = '/juego?codigo=' + codigoPartida + '&tanque=' + tipoTanque + '&modo=' + modo;
    } else {
      // Crear nueva partida multijugador
      fetch('/crearPartida', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          modo: modo,
          nombre: 'Partida de ' + modo
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.codigo) {
          window.location.href = '/juego?codigo=' + data.codigo + '&tanque=' + tipoTanque + '&modo=' + modo;
        } else {
          alert('Error al crear partida');
          cw.mostrarMenuNexus();
        }
      })
      .catch(err => {
        console.error('Error:', err);
        alert('Error de conexión');
        cw.mostrarMenuNexus();
      });
    }
  };

  // Función auxiliar para calcular tiempo transcurrido
  this.calcularTiempo = function(tiempoInicio) {
    if (!tiempoInicio) return '00:00';
    const ahora = Date.now();
    const diff = Math.floor((ahora - tiempoInicio) / 1000);
    const minutos = Math.floor(diff / 60);
    const segundos = diff % 60;
    return String(minutos).padStart(2, '0') + ':' + String(segundos).padStart(2, '0');
  };
  
}

