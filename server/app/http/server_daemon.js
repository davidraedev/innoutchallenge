const fs = require( "fs" );

const logStream = fs.createWriteStream( process.env.BASE + "/log/http_server.log" );

function log( msg ) {
	logStream.write( msg + "\n" );
}

log( "["+ new Date() +"] Starting Log" );

process.on( "uncaughtException", ( error ) => {
	log( error.stack );
});

process.once( "SIGTERM", () => {
	log( "["+ new Date() +"] Stopped" );
	logStream.end();
	process.exit( 0 );
});


if ( ! process.env.NODE_ENV )
	throw new Error( "NODE_ENV not defined" );
if ( ! process.env.ENV_PATH )
	throw new Error( "ENV_PATH not defined" );


const express = require( "express" );
const app = express();
const session = require( "express-session" );
const cors = require( "cors" );
const assert = require( "assert" );
const passport = require( "passport" );
const TwitterStrategy = require( "passport-twitter" ).Strategy;
const userPassport = new passport.Passport();
const adminPassport = new passport.Passport();
const db = require( "../db" );
const User = require( "../../model/user" );
const TwitterUser = require( "../../model/twitter_user" );
const userController = require( "../../controller/user" );

app.use( cors( {
	origin: true,
	credentials: true,
}) );

app.disable( "x-powered-by" );

app.use( "/img", express.static( process.env.BASE + "/server/public/img" ) );
app.use( "/font", express.static( process.env.BASE + "/server/public/font" ) );

var MongoDBStore = require( "connect-mongodb-session" )( session );


var store = new MongoDBStore({
	uri: process.env.DB_HOST + "/innoutchallenge_sessions",
	collection: "userSessions",
});

store.on( "error", function( error ) {
	assert.ifError( error );
	assert.ok( false );
});

app.use( session({
	secret: process.env.APP_SECRET,
	cookie: {
		maxAge: ( 1000 * 60 * 60 * 1 ) // 1 hour 
	},
	store: store,
	resave: true,
	saveUninitialized: true
}));





userPassport.use(
	new TwitterStrategy(
		{
			consumerKey: process.env.TWITTER_CONSUMER_KEY_USER,
			consumerSecret: process.env.TWITTER_CONSUMER_SECRET_USER,
			callbackURL: process.env.BACKEND_URL + "/auth/twitter/callback"
		},
		( token, secret, profile, callback ) => {
			let new_user = false;
			let this_twitter_user;
			let this_user;
			TwitterUser.findOne({ "data.id_str": profile._json.id_str })
				.then( ( twitter_user ) => {
					if ( ! twitter_user ) {
						new_user = true;
						return TwitterUser.create({
							oauth_token: token,
							oauth_secret: secret,
							last_update: new Date(),
							data: profile._json,
						});
					}
					else {
						twitter_user.oauth_token = token;
						twitter_user.oauth_secret = secret;
						twitter_user.last_update = new Date();
						twitter_user.data = profile._json;
						return twitter_user.save();
					}
				})
				.then( ( twitter_user ) => {
					this_twitter_user = twitter_user;
					return User.findOne({ "twitter_user": twitter_user._id });
				})
				.then( ( user ) => {
					if ( ! user ) {
						new_user = true;
						return User.create({
							name: this_twitter_user.data.name,
							join_date: new Date(),
							twitter_user: this_twitter_user._id,
							state: 1,
						});
					}
					else {
						return user;
					}
				})
				.then( ( user ) => {
					this_user = user;
					if ( new_user ) {
						return userController.updateUserTotals( user );
					}
				})
				.then( () => {
					return callback( null, profile );
				})
				.catch( ( error ) => {
					throw error;
				});
		}
	)
);

userPassport.serializeUser( ( user, callback ) => {
	callback( null, user );
});

userPassport.deserializeUser( ( obj, callback ) => {
	callback ( null, obj );
});

app.use( userPassport.initialize() );
app.use( userPassport.session({ secret: process.env.APP_SECRET, cookie: { secure: true } }) );
app.get( "/signin/return/:returnUrl", ( request, response, next ) => { request.session.signinReturnUrl = decodeURIComponent( request.params.returnUrl ); next(); }, userPassport.authenticate( "twitter" ) );
app.get( "/signin", ( request, response, next ) => { request.session.signinReturnUrl = request.headers.referer; next(); }, userPassport.authenticate( "twitter" ) );
app.get( "/signout", ( request, response ) => {
	request.logout();
	response.redirect( process.env.FRONTEND_URL );
});
app.get( "/auth/twitter/callback",
	userPassport.authenticate(
		"twitter",
		{ failureRedirect: "/signin" }),
		( request, response ) => {
			let redirect = ( request.session.signinReturnUrl === process.env.FRONTEND_URL + "/signin" ) ? process.env.FRONTEND_URL : request.session.signinReturnUrl;
			request.session.signinReturnUrl = null;
			response.redirect( redirect );
		});





adminPassport.use(
	new TwitterStrategy(
		{
			consumerKey: process.env.TWITTER_CONSUMER_KEY_ADMIN,
			consumerSecret: process.env.TWITTER_CONSUMER_SECRET_ADMIN,
			callbackURL: process.env.BACKEND_URL + "/admin/auth/twitter/callback"
		},
		( token, secret, profile, callback ) => {
			let new_user = false;
			let this_twitter_user;
		//	let this_user;
			TwitterUser.findOne({ "data.id_str": profile._json.id_str })
				.then( ( twitter_user ) => {
					if ( ! twitter_user ) {
						new_user = true;
						return TwitterUser.create({
							oauth_token_admin: token,
							oauth_secret_admin: secret,
							last_update: new Date(),
							data: profile._json,
						});
					}
					else {
						twitter_user.oauth_token_admin = token;
						twitter_user.oauth_secret_admin = secret;
						twitter_user.last_update = new Date();
						twitter_user.data = profile._json;
						return twitter_user.save();
					}
				})
				.then( ( twitter_user ) => {
					this_twitter_user = twitter_user;
					return User.findOne({ "twitter_user": twitter_user._id });
				})
				.then( ( user ) => {
					if ( ! user ) {
						new_user = true;
						return User.create({
							name: this_twitter_user.data.name,
							join_date: new Date(),
							twitter_user: this_twitter_user._id,
							state: 1,
						});
					}
					else {
						return user;
					}
				})
				.then( () => {
					return callback( null, profile );
				})
				.catch( ( error ) => {
					throw error;
				});
		}
	)
);

adminPassport.serializeUser( ( user, callback ) => {
	callback( null, user );
});

adminPassport.deserializeUser( ( obj, callback ) => {
	callback ( null, obj );
});

app.use( adminPassport.initialize() );
app.use( adminPassport.session({ secret: process.env.APP_SECRET, cookie: { secure: true } }) );
app.get( "/admin/signin/return/:returnUrl", ( request, response, next ) => { request.session.signinReturnUrl = decodeURIComponent( request.params.returnUrl ); next(); }, adminPassport.authenticate( "twitter" ) );
app.get( "/admin/signin", ( request, response, next ) => { request.session.signinReturnUrl = request.headers.referer; next(); }, adminPassport.authenticate( "twitter" ) );
app.get( "/admin/signout", ( request, response ) => {
	request.logout();
	response.redirect( process.env.FRONTEND_URL );
});
app.get( "/admin/auth/twitter/callback",
	adminPassport.authenticate(
		"twitter",
		{ failureRedirect: "/admin/signin" }),
		( request, response ) => {
			let redirect = ( request.session.signinReturnUrl === process.env.FRONTEND_URL + "/admin/signin" ) ? process.env.FRONTEND_URL : request.session.signinReturnUrl;
			request.session.signinReturnUrl = null;
			response.redirect( redirect );
		});

















const bodyParser = require( "body-parser" );
const user_controller = require( "../../controller/user_view" );
const account_controller = require( "../../controller/account_view" );
const jsonParser = bodyParser.json();

function checkAuthenticationView( request, response, next ) {
	response.locals.authenticated = ( request.isAuthenticated() ) ? true : false;
	next();
}

function checkAuthenticationApi( request, response, next ) {

	if ( ! request.isAuthenticated() )
		return response.status( 403 ).end();

	response.locals.authenticated = true;
	next();
}

function checkAuthenticationEndpoint( request, response ) {

	let data = { authenticated: false };

	if ( request.isAuthenticated() )
		data.authenticated = true;

	return response.json( data );
}

app.post( "/api/users/list", jsonParser, user_controller.users_list );
app.post( "/api/user/receipts", jsonParser, user_controller.user_instore_receipts );
app.post( "/api/user/stores", jsonParser, user_controller.user_stores );
app.post( "/api/user/drivethru", jsonParser, user_controller.user_drivethru_receipts );

app.post( "/auth/check", checkAuthenticationEndpoint );

app.post( "/api/account/get", checkAuthenticationApi, account_controller.get_account );
app.post( "/api/account/set", checkAuthenticationApi, jsonParser, account_controller.update_account );
app.post( "/api/account/delete", checkAuthenticationApi, account_controller.delete_account );

if ( process.env.NODE_ENV == "production" ) {
	app.get( "/bundle.js", ( request, response ) => {
		response.sendFile( process.env.BASE + "/client/build/bundle.js" );
	});
	app.get( "/*", checkAuthenticationView, ( request, response ) => {
		response.sendFile( process.env.BASE + "/client/build/index.html" );
	});
}
else {
	app.get( "/", ( request, response ) => {
		response.redirect( 301, process.env.FRONTEND_URL + request.originalUrl );
	});
}

db.connect()
	.then( () => {
		// start the server
		return app.listen( process.env.BACKEND_PORT );
	})
	.then( () => {

		log( "Server started at "+ process.env.BACKEND_URL );

		if ( process.env.BACKEND_PORT < 1024 ) {

			// this lets us use sudo to start the server on a privileged port,
			// then drop it down to normal permissions
			let uid = parseInt( process.env.SUDO_UID );

			if ( uid )
				process.setuid( uid );

			log( "Server's UID is now " + process.getuid() );

		}

	})
	.catch( ( error ) => {
		log( error );
		logStream.end();
		db.close();
	});
