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
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

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
