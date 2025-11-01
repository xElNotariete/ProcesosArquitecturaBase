const fs=require("fs");
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require("body-parser");
const passport=require("passport");
const session=require("express-session");
const { OAuth2Client } = require('google-auth-library');
require("./Servidor/passport-setup.js");
const modelo = require("./Servidor/modelo.js");
const PORT = process.env.PORT || 8080;

// Cliente OAuth2 para verificar tokens de Google One Tap
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Body parser - solo una vez
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
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

app.get("/obtenerUsuarios",function(request,response){
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

app.get("/eliminarUsuario/:nick",function(request,response){
let nick=request.params.nick;
let res=sistema.eliminarUsuario(nick);
response.json(res);
});

// Rutas de autenticación con Google
app.get('/auth/google', function(req, res, next) {
    try {
        const strat = passport._strategy && passport._strategy('google');
        const configuredCallback = strat && (strat._callbackURL || (strat._oauth2 && strat._oauth2._redirectUri)) || '<unknown>';
        console.log('[auth/google] request host:', req.headers.host);
        console.log('[auth/google] protocol:', req.protocol);
        console.log('[auth/google] configured callback URL:', configuredCallback);
        console.log('[auth/google] strategy options:', strat && strat._oauth2 && {
            redirectUri: strat._oauth2._redirectUri,
            clientId: strat._oauth2._clientId
        });
    } catch (e) {
        console.error('Error logging passport strategy:', e);
    }
    // proceed with authentication
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    function(req, res) {
        console.log('[callback] Autenticación exitosa, procesando usuario...');
        // Autenticación exitosa - guardar usuario en MongoDB
        let email = req.user.emails[0].value;
        console.log('[callback] Email del usuario:', email);
        sistema.usuarioGoogle({"email": email}, function(obj) {
            console.log('[callback] Usuario guardado en MongoDB:', obj);
            res.cookie('nick', obj.email);
            res.redirect('/');
        });
    }
);

// Ruta para manejar Google One Tap callback usando Passport
app.post('/oneTap/callback',
    passport.authenticate('google-one-tap', { failureRedirect: '/fallo' }),
    function(req, res) {
        console.log('[oneTap/callback] Autenticación exitosa con Passport One Tap');
        // Successful authentication, redirect to /good
        res.redirect('/good');
    }
);

// Ruta /good para manejar login exitoso de One Tap
app.get("/good", function(request, response) {
    let email = request.user.emails ? request.user.emails[0].value : request.user.email;
    console.log('[good] Usuario autenticado:', email);
    if (email) {
        sistema.usuarioGoogle({"email": email}, function(obj) {
            console.log('[good] Usuario guardado en MongoDB:', obj);
            response.cookie('nick', obj.email);
            response.redirect('/');
        });
    } else {
        response.redirect('/');
    }
});

// Ruta /fallo para cuando falla la autenticación
app.get("/fallo", function(request, response) {
    console.log('[fallo] Autenticación fallida');
    response.send({nick: "nook"});
});

app.get('/logout', function(req, res) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

// Servir archivos estáticos desde la carpeta Cliente (al final para que no interfiera con las rutas API)
app.use(express.static(__dirname + "/Cliente"));

app.listen(PORT, () => {
console.log(`App está escuchando en el puerto ${PORT}`);
console.log('Ctrl+C para salir');
});
