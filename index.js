const fs=require("fs");
const express = require('express');
const app = express();
const modelo = require("./Servidor/modelo.js");
const PORT = process.env.PORT || 8080;
app.use(express.json());
// Servir archivos estáticos desde la carpeta Cliente
app.use(express.static(__dirname + "/Cliente"));
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

app.listen(PORT, () => {
console.log(`App está escuchando en el puerto ${PORT}`);
console.log('Ctrl+C para salir');
});
