const nodemailer = require('nodemailer');

// Detectar automáticamente: 
// 1. Si hay APP_URL en env, úsala
// 2. Si no, usa localhost:8080
const url = process.env.APP_URL || "http://localhost:8080";
// Asegurar que termine con /
const baseURL = url.endsWith('/') ? url : url + '/';

console.log('[email] URL base configurada:', baseURL);

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_USER || 'tu-email@gmail.com',
		pass: process.env.EMAIL_PASS || 'tu-app-password'
	}
});

//send();
module.exports.enviarEmail=async function(direccion, key, men) {
	const confirmURL = `${baseURL}confirmarUsuario/${direccion}/${key}`;
	console.log('[email] Enviando email a:', direccion);
	console.log('[email] URL de confirmación:', confirmURL);
	
	const result = await transporter.sendMail({
		from: process.env.EMAIL_USER || 'samuelnotario100@gmail.com',
		to: direccion,
		subject: men,
		text: 'Pulsa aquí para confirmar cuenta: ' + confirmURL,
		html: `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="UTF-8">
			<style>
				body { font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; }
				.container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
				h2 { color: #333; }
				p { color: #666; line-height: 1.6; }
				.button { display: inline-block; padding: 12px 30px; background-color: #667eea; color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0; }
				.button:hover { background-color: #5568d3; }
				.link { color: #667eea; word-break: break-all; }
			</style>
		</head>
		<body>
			<div class="container">
				<h2>Bienvenido a Sistema</h2>
				<p>Gracias por registrarte. Para activar tu cuenta, haz clic en el siguiente botón:</p>
				<a href="${confirmURL}" class="button" target="_blank" rel="noopener">Confirmar cuenta</a>
				<p>O copia y pega este enlace en tu navegador donde ya tienes abierta la aplicación:</p>
				<p class="link">${confirmURL}</p>
				<p style="margin-top: 30px; font-size: 12px; color: #999;">Si no solicitaste este registro, ignora este correo.</p>
			</div>
		</body>
		</html>
		`
	});
	
	console.log('[email] Email enviado correctamente');
}
