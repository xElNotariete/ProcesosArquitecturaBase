# Configuración de Google OAuth

## Pasos para obtener las credenciales de Google:

1. Ve a: https://console.cloud.google.com/

2. Crea un nuevo proyecto o selecciona uno existente

3. Ve a "APIs & Services" > "Credentials"

4. Click en "Create Credentials" > "OAuth 2.0 Client ID"

5. Si es la primera vez, configura la pantalla de consentimiento:
   - User Type: External
   - App name: ProcesosArquitecturaBase
   - User support email: tu email
   - Developer contact: tu email
   - Guarda y continúa

6. Crear OAuth Client ID:
   - Application type: Web application
   - Name: ProcesosArquitecturaBase
   - Authorized JavaScript origins:
     * http://localhost:8080
   - Authorized redirect URIs:
     * http://localhost:8080/auth/google/callback
   - Click "Create"

7. Copia el Client ID y Client Secret

8. Pega las credenciales en el archivo `.env`:
   ```
   GOOGLE_CLIENT_ID=tu_client_id_aqui
   GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
   ```

9. Reinicia el servidor: `npm start`

## Probar la autenticación:

1. Abre http://localhost:8080
2. Click en el botón "Sign in with Google"
3. Selecciona tu cuenta de Google
4. Acepta los permisos
5. Serás redirigido de vuelta a la aplicación con tu sesión iniciada
