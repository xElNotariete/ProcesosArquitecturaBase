const fs=require("fs");
require('dotenv').config();
const express = require('express');
const app = express();
const passport=require("passport");
const session=require("express-session");
require("./Servidor/passport-setup.js");
const modelo = require("./Servidor/modelo.js");
const PORT = process.env.PORT || 8080;
app.use(express.json());

// Servir archivos estáticos desde la carpeta Cliente
app.use(express.static(__dirname + "/Cliente"));

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
        // Autenticación exitosa
        // Agregar el usuario al sistema
        const nick = req.user.displayName || req.user.email.split('@')[0];
        sistema.agregarUsuario(nick);
        res.redirect('/?user=' + encodeURIComponent(nick));
    }
);

app.get('/logout', function(req, res) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

app.listen(PORT, () => {
console.log(`App está escuchando en el puerto ${PORT}`);
console.log('Ctrl+C para salir');
});
