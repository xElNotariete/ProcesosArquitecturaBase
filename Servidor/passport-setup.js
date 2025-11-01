const passport=require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GoogleOneTapStrategy = require("passport-google-one-tap").GoogleOneTapStrategy;

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
	callbackURL: 'http://localhost:8080/auth/google/callback'
},
function(accessToken, refreshToken, profile, done) {
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

module.exports = passport;
