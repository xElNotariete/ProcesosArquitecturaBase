const passport=require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GoogleOneTapStrategy = require("passport-google-one-tap").GoogleOneTapStrategy;
const LocalStrategy = require('passport-local').Strategy;
const modelo = require("./modelo.js");

let sistema = new modelo.Sistema();

passport.serializeUser(function(user, done) {
 done(null, user);
});

passport.deserializeUser(function(user, done) {
 done(null, user);
});

passport.use(new GoogleStrategy({
	// Use environment variables so secrets are not stored in the repository
	clientID: process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID',
	clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET',
	callbackURL: 'https://procesos2526-145905119803.europe-west1.run.app/auth/google/callback',
	proxy: true
},
function(accessToken, refreshToken, profile, done) {
	console.log('[GoogleStrategy] Usuario autenticado:', profile.emails[0].value);
	return done(null, profile);
}
));

// Google One Tap Strategy
passport.use(
	new GoogleOneTapStrategy(
		{
			client_id: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			verifyCsrfToken: false, // whether to validate the csrf token or not
		},
		function (profile, done) {
			return done(null, profile);
		}
	)
);

// Local Strategy for email/password login
passport.use(new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password'
},
function(email, password, done) {
	console.log('[LocalStrategy] Intentando login con:', email);
	sistema.loginUsuario({email: email, password: password}, function(user) {
		if (user.email === -1) {
			console.log('[LocalStrategy] Login fallido');
			return done(null, false);
		}
		console.log('[LocalStrategy] Login exitoso:', user.email);
		return done(null, user);
	});
}
));

module.exports = passport;
