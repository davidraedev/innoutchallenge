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


app.use( "/", require( "./route/auth.js" ) );
app.use( "/", require( "./route/all.js" ) );

db.connect(function( error ){
	if ( error )
		throw new Error( error );
	app.listen( 3000 );
});

