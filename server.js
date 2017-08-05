const express = require( "express" );
const app = express();
const session = require( "express-session" );
const db = require( "./app/db" );
require( "dotenv" ).config();
const cors = require( "cors" );
const assert = require( "assert" );
app.use( cors( {
	origin: true,
	credentials: true,
}) );

app.disable( "x-powered-by" );

app.use( "/img", express.static( "public/img" ) );
app.use( "/font", express.static( "public/font" ) );

var MongoDBStore = require( "connect-mongodb-session" )( session );

var store = new MongoDBStore({
	uri: process.env.DB_URL + "/innoutchallenge_sessions",
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

const passport = require( "passport" );
const Strategy = require( "passport-twitter" ).Strategy;

const User = require( "./model/user" );
const TwitterUser = require( "./model/twitter_user" );
const userController = require( "./controller/user" );

passport.use(
	new Strategy(
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

passport.serializeUser( ( user, callback ) => {
	callback( null, user );
});

passport.deserializeUser( ( obj, callback ) => {
	callback ( null, obj );
});

app.use( passport.initialize() );
app.use( passport.session({ secret: process.env.APP_SECRET, cookie: { secure: true } }) );
app.get( "/signin/return/:returnUrl", ( request, response, next ) => { request.session.signinReturnUrl = decodeURIComponent( request.params.returnUrl ); next(); }, passport.authenticate( "twitter" ) );
app.get( "/signin", ( request, response, next ) => { request.session.signinReturnUrl = request.headers.referer; next(); }, passport.authenticate( "twitter" ) );
app.get( "/signout", ( request, response ) => {
	request.logout();
	response.redirect( process.env.FRONTEND_URL );
});
app.get( "/auth/twitter/callback",
	passport.authenticate(
		"twitter",
		{ failureRedirect: "/signin" }),
		( request, response ) => {
			let redirect = ( /^\/signin/.test( request.session.signinReturnUrl ) ) ? process.env.FRONTEND_URL : request.session.signinReturnUrl;
			request.session.signinReturnUrl = null;
			response.redirect( redirect );
		});



app.use( "/", require( "./route/auth.js" ) );


const bodyParser = require( "body-parser" );
const user_controller = require( "./controller/user_view" );
const account_controller = require( "./controller/account_view" );
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
		response.sendFile( __dirname + "/node_modules/innoutchallenge_frontend/build/bundle.js" );
	});
	// need to mirror the client router here, or find a wildcard workaround
	app.get( "/*", checkAuthenticationView, ( request, response ) => {
		response.sendFile( __dirname + "/node_modules/innoutchallenge_frontend/build/index.html" );
	});
}

else {
	app.get( "/", ( request, response ) => {
		response.redirect( 301, process.env.FRONTEND_URL + request.originalUrl );
	});
}

db.connect().then( () => {

	app.listen( process.env.BACKEND_PORT, function( error ) {

		console.log( "Server started at "+ process.env.BACKEND_URL );

		if ( error )
			throw error;

		let uid = parseInt( process.env.SUDO_UID );

		if ( uid )
			process.setuid( uid );

		console.log( "Server's UID is now " + process.getuid() );
	});

}).catch( ( error ) => {
	throw error;
});

