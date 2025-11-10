# 🚀 Sistema de Gestión de Usuarios

Sistema completo de autenticación y gestión de usuarios con Node.js, Express, MongoDB y Passport.

## ✨ Características Principales

### 🔐 Autenticación Completa
- ✅ Registro de usuarios con confirmación por email
- ✅ Login con email y contraseña (cifrado con bcrypt)
- ✅ Login con Google OAuth2
- ✅ Login con Google One Tap
- ✅ Confirmación de cuenta obligatoria
- ✅ Gestión segura de sesiones

### 🛡️ Seguridad
- ✅ Contraseñas cifradas con bcrypt (10 rondas)
- ✅ Rutas protegidas con middleware
- ✅ Validación de formularios
- ✅ Sesiones seguras con express-session
- ✅ Integración con Passport.js

### 📧 Sistema de Correos
- ✅ Envío automático de confirmación
- ✅ HTML estilizado profesional
- ✅ Enlaces únicos por usuario

### 💾 Base de Datos
- ✅ MongoDB Atlas
- ✅ CRUD completo de usuarios
- ✅ Búsquedas optimizadas

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js >= 14
- Cuenta MongoDB Atlas
- Cuenta Google Cloud (para OAuth2)
- Cuenta Gmail (para envío de correos)

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/xElNotariete/ProcesosArquitecturaBase.git
cd ProcesosArquitecturaBase

# Instalar dependencias
npm install

# Configurar variables de entorno
# Crear archivo .env con:
# MONGO_URI=tu_uri_de_mongodb
# GOOGLE_CLIENT_ID=tu_client_id
# GOOGLE_CLIENT_SECRET=tu_client_secret
# PORT=8080

# Iniciar servidor
npm start
```

### Acceso
Abrir navegador en: http://localhost:8080

## 📚 Documentación

### Estructura del Proyecto
```
├── Cliente/              # Frontend
│   ├── index.html       # Página principal
│   ├── login.html       # Formulario login
│   ├── registro.html    # Formulario registro
│   ├── controlWeb.js    # Controlador UI
│   ├── clienteRest.js   # Cliente API REST
│   └── modelo.js        # Modelo cliente
├── Servidor/            # Backend
│   ├── modelo.js        # Lógica de negocio
│   ├── cad.js          # Capa acceso a datos
│   ├── email.js        # Envío de correos
│   └── passport-setup.js # Configuración Passport
├── index.js            # Servidor Express
└── package.json        # Dependencias
```

### Flujo de Registro y Login

1. **Registro**
   - Usuario completa formulario
   - Sistema cifra contraseña con bcrypt
   - Genera key única y marca confirmada=false
   - Envía correo con enlace de confirmación

2. **Confirmación**
   - Usuario hace clic en enlace del correo
   - Sistema verifica email y key
   - Actualiza confirmada=true

3. **Login**
   - Usuario ingresa email y contraseña
   - Sistema verifica con bcrypt
   - Comprueba que cuenta esté confirmada
   - Inicia sesión con Passport

## 🔧 API REST

### Rutas Públicas
- `POST /registrarUsuario` - Registrar nuevo usuario
- `POST /loginUsuario` - Iniciar sesión
- `GET /confirmarUsuario/:email/:key` - Confirmar cuenta
- `GET /auth/google` - Login con Google
- `GET /numeroUsuarios` - Contar usuarios

### Rutas Protegidas (requieren autenticación)
- `GET /obtenerUsuarios` - Listar usuarios activos
- `GET /cerrarSesion` - Cerrar sesión

## 🧪 Pruebas

Ver archivo `GUIA_COMPLETA_PRUEBAS.md` para plan de pruebas detallado.

### Prueba Rápida
```bash
# 1. Iniciar servidor
npm start

# 2. Abrir http://localhost:8080
# 3. Registrar usuario
# 4. Confirmar desde correo
# 5. Iniciar sesión
```

## 📝 Tecnologías Utilizadas

### Backend
- Node.js
- Express.js
- MongoDB + MongoDB Driver
- Passport.js (Local, Google OAuth2, Google One Tap)
- Bcrypt (cifrado)
- Nodemailer (correos)
- express-session

### Frontend
- HTML5
- CSS3 + Bootstrap 4
- JavaScript (ES6+)
- jQuery

## 🔐 Seguridad

### Mejores Prácticas Implementadas
- ✅ Contraseñas nunca en texto plano
- ✅ Bcrypt para hashing
- ✅ Sesiones con secret
- ✅ Rutas protegidas con middleware
- ✅ Validación de entrada
- ✅ CORS configurado
- ✅ Confirmación de email obligatoria

## 📋 Checklist de Funcionalidades

- [x] Registro de usuarios
- [x] Confirmación por email
- [x] Login local
- [x] Login con Google OAuth2
- [x] Login con Google One Tap
- [x] Cerrar sesión
- [x] Cifrado de contraseñas
- [x] Rutas protegidas
- [x] Validación de formularios
- [x] Gestión de usuarios activos
- [x] Base de datos MongoDB
- [x] Interfaz responsive

## 🐛 Solución de Problemas

### Error de conexión a MongoDB
Verificar:
- URI correcta en .env
- IP permitida en MongoDB Atlas
- Credenciales válidas

### No llega correo de confirmación
Verificar:
- Credenciales Gmail en `Servidor/email.js`
- Revisar carpeta spam
- Límites de envío no excedidos

### Error de Bcrypt
```bash
npm uninstall bcrypt
npm install bcrypt
```

## 📖 Documentación Adicional

- `FUNCIONES_IMPLEMENTADAS.md` - Lista completa de funciones
- `GUIA_COMPLETA_PRUEBAS.md` - Plan de pruebas detallado
- `MEJORAS_IMPLEMENTADAS.md` - Changelog de mejoras
- `PRUEBAS_CONFIRMACION.md` - Pruebas de confirmación

## 👥 Autor

Samuel - [@xElNotariete](https://github.com/xElNotariete)

## 📄 Licencia

ISC

## 🙏 Agradecimientos

- MongoDB Atlas
- Google OAuth2
- Passport.js Community
- Bootstrap Team

---


**Última Actualización**: Noviembre 2025