var express = require( "express" );
var app = express();
var session = require( "express-session" );
var db = require( "./app/db" );

app.use( session({
	resave: false,
	saveUninitialized: true,
	secret: "dsfOsd8nfa9489*#&M(*<*#@M.l(*@#M)@#Y@<(>kl" 
}));

app.set( "view engine", "pug" );
app.set( "views", __dirname + "/view" );

app.use( ( request, response, next ) => {
	response.header( "Access-Control-Allow-Origin", "*" );
	response.header( "Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept" );
	next();
});

app.use( "/", require( "./route/auth.js" ) );
app.use( "/", require( "./route/admin.js" ) );
app.use( "/", require( "./route/all.js" ) );

db.connect().then( () => {

	app.listen( 3000, function(){
		console.log( "Server started at http://127.0.0.1:3000" );
	});

}).catch( ( error ) => {
	throw error;
});

