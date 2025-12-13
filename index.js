const fs=require("fs");
require('dotenv').config();
const express = require('express');
const app = express();
const httpServer = require('http').Server(app);
const { Server } = require("socket.io");
const cors = require('cors');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const passport=require("passport");
const session=require("express-session");
const { OAuth2Client } = require('google-auth-library');
const LocalStrategy = require('passport-local').Strategy;
require("./Servidor/passport-setup.js");
const modelo = require("./Servidor/modelo.js");
const moduloWS = require("./Servidor/servidorWS.js");
const PORT = process.env.PORT || 8080;

// Cliente OAuth2 para verificar tokens de Google One Tap
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Body parser - solo una vez
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

// Configurar express-session
app.use(session({
    secret: 'Sistema',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

let sistema = new modelo.Sistema();

passport.use(new LocalStrategy({usernameField:"email",passwordField:"password"},
function(email,password,done){
sistema.loginUsuario({"email":email,"password":password},function(user){
if (user && user.email && user.email !== -1) {
return done(null, user);
} else {
return done(null, false);
}
})
}
));

const haIniciado=function(request,response,next){
	if (request.user){
		next();
	}
	else{
		response.redirect("/")
	}
}

app.get("/", function(request,response){
var contenido=fs.readFileSync(__dirname+"/Cliente/index.html");
response.setHeader("Content-type","text/html");
response.send(contenido);
});

app.get("/agregarUsuario/:nick",function(request,response){
let nick=request.params.nick;
let res=sistema.agregarUsuario(nick);
response.json(res);
});

app.get("/obtenerUsuarios",haIniciado,function(request,response){
let usuarios=sistema.obtenerUsuarios();
response.json(usuarios);
});

app.get("/usuarioActivo/:nick",function(request,response){
let nick=request.params.nick;
let res=sistema.usuarioActivo(nick);
response.json(res);
});

app.get("/numeroUsuarios",function(request,response){
let res=sistema.numeroUsuarios();
response.json(res);
});

app.get("/eliminarUsuario/:nick", haIniciado, function(request, response) {
  const nick = request.params.nick;
  
  sistema.eliminarUsuario(nick, function(resultado) {
    if (resultado.ok) {
      // Si el usuario eliminado es el usuario actual, cerrar sesión
      if (request.user && request.user.nick === nick) {
        request.logout(function(err) {
          if (err) {
            console.error('Error al cerrar sesión:', err);
          }
          response.clearCookie('nick');
          response.json({
            ok: true,
            mensaje: resultado.mensaje,
            sesionCerrada: true
          });
        });
      } else {
        response.json(resultado);
      }
    } else {
      response.json(resultado);
    }
  });
});

app.post("/registrarUsuario",function(request,response){
sistema.registrarUsuario(request.body,function(res){
response.send({"nick":res.nick || res.email});
});
});

app.get("/confirmarUsuario/:email/:key",function(request,response){
let email=request.params.email;
let key=request.params.key;
sistema.confirmarUsuario({"email":email,"key":key},function(usr){
if (usr.email!=-1){
response.cookie('nick',usr.nick);
}
response.redirect('/');
});
});

app.post("/guardarNickGoogle",function(request,response){
let email=request.cookies.tempEmail;
let nick=request.body.nick;
let password=request.body.password;

if (!email || !nick || !password){
response.json({success:false, error:"Datos incompletos"});
return;
}

sistema.guardarNickGoogle({"email":email,"nick":nick,"password":password},function(result){
if (result.success){
response.clearCookie('tempEmail');
response.cookie('nick', nick, { path: '/', maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 días
response.cookie('email', email, { path: '/', maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 días

// Agregar usuario a memoria
sistema.agregarUsuario(nick);

// Establecer sesión de Passport para usuarios de Google
request.login({email: email, nick: nick, googleUser: true}, function(err) {
if (err) {
console.error('[guardarNickGoogle] Error al establecer sesión:', err);
}
console.log('[guardarNickGoogle] Sesión establecida para:', nick);
console.log('[guardarNickGoogle] Cookies establecidas: nick=' + nick + ', email=' + email);
});

response.json({success:true, nick:nick, email:email});
}
else{
response.json({success:false, error:result.error});
}
});
});

app.post('/loginUsuario',passport.authenticate("local",{failureRedirect:"/fallo",successRedirect: "/ok"})
);

app.get("/ok",function(request,response){
	// Agregar usuario a la lista de usuarios activos usando el nick
	if (request.user && request.user.nick) {
		sistema.agregarUsuario(request.user.nick);
	}
	response.send({nick:request.user.nick, email:request.user.email})
});

// Rutas de autenticación con Google
app.get('/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    function(req, res) {
        // Autenticación exitosa - verificar si usuario necesita elegir nick
        let email = req.user.emails[0].value;
        sistema.verificarUsuarioGoogle({"email": email}, function(obj) {
            if (obj.necesitaNick) {
                // Usuario nuevo, necesita elegir nick
                res.cookie('tempEmail', email, { maxAge: 300000 }); // 5 minutos
                res.redirect('/?elegirNick=true');
            } else {
                // Usuario existente, continuar normalmente
                res.cookie('nick', obj.nick);
                res.cookie('email', obj.email);
                sistema.agregarUsuario(obj.nick);
                res.redirect('/');
            }
        });
    }
);

// Ruta para manejar Google One Tap callback
app.post('/oneTap/callback', async function(req, res) {
    try {
        console.log('[OneTap] ===== INICIO CALLBACK =====');
        console.log('[OneTap] Body recibido:', req.body);
        const token = req.body.credential;
        
        if (!token) {
            console.log('[OneTap] ERROR: No se recibió token');
            return res.status(400).json({ error: 'No token provided' });
        }
        
        console.log('[OneTap] Verificando token con Google...');
        // Verificar el token con Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        console.log('[OneTap] ✓ Token verificado exitosamente');
        console.log('[OneTap] Email:', payload.email);
        console.log('[OneTap] Nombre:', payload.name);
        
        // Verificar si el usuario existe o necesita registrarse
        sistema.verificarUsuarioGoogle({"email": payload.email}, function(obj) {
            console.log('[OneTap] Resultado verificación:', obj);
            
            if (obj.necesitaNick) {
                // Usuario nuevo, necesita elegir nick
                console.log('[OneTap] Usuario nuevo, redirigiendo a elegir nick');
                res.cookie('tempEmail', payload.email, { maxAge: 300000 }); // 5 minutos
                res.redirect('/?elegirNick=true');
            } else {
                // Usuario existente, continuar normalmente
                console.log('[OneTap] Usuario existente:', obj.nick);
                res.cookie('nick', obj.nick);
                res.cookie('email', obj.email);
                sistema.agregarUsuario(obj.nick);
                res.redirect('/');
            }
        });
        
    } catch (error) {
        console.error('[OneTap] ===== ERROR =====');
        console.error('[OneTap] Error al verificar token:', error.message);
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Ruta /good para manejar login exitoso de One Tap
app.get("/good", function(request, response) {
    let email = request.user.emails ? request.user.emails[0].value : request.user.email;
    if (email) {
        // Verificar si usuario necesita elegir nick (igual que Google OAuth)
        sistema.verificarUsuarioGoogle({"email": email}, function(obj) {
            if (obj.necesitaNick) {
                // Usuario nuevo, necesita elegir nick
                response.cookie('tempEmail', email, { maxAge: 300000 }); // 5 minutos
                response.redirect('/?elegirNick=true');
            } else {
                // Usuario existente, continuar normalmente
                response.cookie('nick', obj.nick);
                response.cookie('email', obj.email);
                sistema.agregarUsuario(obj.nick);
                response.redirect('/');
            }
        });
    } else {
        response.redirect('/');
    }
});

// Ruta /fallo para cuando falla la autenticación
app.get("/fallo", function(request, response) {
    response.status(401).json({nick: -1, mensaje: "Email o contraseña incorrectos. Asegúrate de haber confirmado tu cuenta."});
});

app.get("/cerrarSesion",haIniciado,function(request,response){
	let nick=request.user.email || request.user.nick;
	request.logout(function(err){
		if (err) { 
			console.error("Error al cerrar sesión:", err.message);
			return response.redirect("/"); 
		}
		if (nick){
			sistema.eliminarUsuario(nick);
		}
		response.json({success: true});
	});
});

app.get('/logout', function(req, res) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

// Servir archivos estáticos desde la carpeta Cliente (al final para que no interfiera con las rutas API)
app.use(express.static(__dirname + "/Cliente"));

// Crear instancias de WebSocket Server y Socket.IO
let ws = new moduloWS.ServidorWS();
let io = new Server();

// Lanzar servidores
httpServer.listen(PORT, () => {
	console.log(`App está escuchando en el puerto ${PORT}`);
	console.log('Ctrl+C para salir');
});
io.listen(httpServer);
ws.lanzarServidor(io, sistema);
