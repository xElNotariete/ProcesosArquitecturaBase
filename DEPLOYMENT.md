# 🚀 Guía de Despliegue en Google Cloud Run

## 📋 Prerrequisitos

1. Cuenta de Google Cloud Platform
2. Google Cloud SDK instalado (`gcloud`)
3. Docker instalado (opcional, Cloud Run lo maneja automáticamente)

## 🔧 Configuración de Variables de Entorno

### Local (Desarrollo)

1. Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Edita `.env` con tus credenciales reales:
```env
GOOGLE_CLIENT_ID=145905119803-2bftmurjt68oacbojb4ra1vm01nubqs2.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-tu-client-secret-real
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password-de-gmail
APP_URL=http://localhost:8080
```

### Producción (Google Cloud Run)

Las variables de entorno se configuran en Cloud Run. **NO se suben al repositorio**.

## 📦 Despliegue en Google Cloud Run

### Opción 1: Desde la Consola Web

1. Ve a: https://console.cloud.google.com/run
2. Click en "CREATE SERVICE"
3. Selecciona "Continuously deploy from a repository (source or function)"
4. Conecta tu repositorio de GitHub
5. Configura las variables de entorno:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `MONGO_URI`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `APP_URL` (la URL que te proporcionará Cloud Run)
6. Click en "CREATE"

### Opción 2: Desde la Terminal

```bash
# 1. Autenticarse en Google Cloud
gcloud auth login

# 2. Configurar proyecto
gcloud config set project TU_PROJECT_ID

# 3. Desplegar (primera vez)
gcloud run deploy procesos-arquitectura-base \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_CLIENT_ID=145905119803-2bftmurjt68oacbojb4ra1vm01nubqs2.apps.googleusercontent.com" \
  --set-env-vars "GOOGLE_CLIENT_SECRET=TU_SECRET_REAL" \
  --set-env-vars "MONGO_URI=TU_MONGO_URI" \
  --set-env-vars "EMAIL_USER=TU_EMAIL" \
  --set-env-vars "EMAIL_PASS=TU_APP_PASSWORD" \
  --set-env-vars "APP_URL=https://procesos-arquitectura-base-xxxxx.run.app"

# 4. Actualizar APP_URL después del primer despliegue
# Cloud Run te dará una URL como: https://procesos-arquitectura-base-xxxxx-ew.a.run.app
# Actualiza la variable:
gcloud run services update procesos-arquitectura-base \
  --region europe-west1 \
  --set-env-vars "APP_URL=https://TU-URL-REAL.run.app"
```

## 🔑 Configuración de Google OAuth

### Configurar URIs Autorizadas

1. Ve a: https://console.cloud.google.com/apis/credentials
2. Selecciona tu OAuth 2.0 Client ID
3. En **"Orígenes de JavaScript autorizados"** añade:
   - `http://localhost:8080` (desarrollo)
   - `https://tu-servicio.run.app` (producción)

4. En **"URIs de redireccionamiento autorizadas"** añade:
   - `http://localhost:8080/auth/google/callback` (desarrollo)
   - `https://tu-servicio.run.app/auth/google/callback` (producción)

5. **Guarda** los cambios

⚠️ **Importante**: Espera 5 minutos para que Google propague los cambios.

## 📧 Configuración de Email (Gmail)

1. Ve a: https://myaccount.google.com/apppasswords
2. Genera una "contraseña de aplicación" para "Correo"
3. Usa esa contraseña en `EMAIL_PASS` (NO tu contraseña normal de Gmail)

## 🗄️ Configuración de MongoDB Atlas

1. Ve a: https://cloud.mongodb.com
2. En "Network Access", añade:
   - Para desarrollo: Tu IP actual
   - Para producción: `0.0.0.0/0` (permitir todas las IPs)
3. Copia tu connection string y úsala en `MONGO_URI`

## ✅ Verificación

### Local
```bash
npm start
# Visita: http://localhost:8080
```

### Producción
```bash
# Obtener la URL de tu servicio
gcloud run services describe procesos-arquitectura-base --region europe-west1 --format 'value(status.url)'

# Visita la URL en tu navegador
```

## 🔄 Actualizar Despliegue

```bash
# Commit y push tus cambios a GitHub
git add .
git commit -m "Update"
git push

# Si configuraste despliegue automático, Cloud Run se actualizará automáticamente
# Si no, vuelve a ejecutar:
gcloud run deploy procesos-arquitectura-base --source . --region europe-west1
```

## 🐛 Solución de Problemas

### Error: "Email no llega"
- Verifica `EMAIL_USER` y `EMAIL_PASS`
- Asegúrate de usar contraseña de aplicación, no tu contraseña normal
- Verifica `APP_URL` esté correcta

### Error: "Google One Tap no aparece"
- Verifica que `http://localhost:8080` o tu URL de producción esté en los orígenes autorizados
- Borra las cookies del navegador
- Espera 5 minutos después de cambiar configuración en Google Cloud Console

### Error: "MongoDB connection failed"
- Verifica que `MONGO_URI` sea correcta
- Asegúrate de permitir la IP de Cloud Run en MongoDB Atlas (usa `0.0.0.0/0`)

### Ver logs en producción
```bash
gcloud run services logs read procesos-arquitectura-base --region europe-west1 --limit 50
```

## 🔒 Seguridad

- ✅ Archivo `.env` está en `.gitignore` (NO se sube a GitHub)
- ✅ Usa `.env.example` como plantilla (sin secretos reales)
- ✅ Variables sensibles se configuran en Cloud Run
- ✅ Las contraseñas se cifran con bcrypt
- ✅ Las sesiones usan cookies seguras

## 📚 Recursos

- [Google Cloud Run Docs](https://cloud.google.com/run/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Google OAuth2 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
