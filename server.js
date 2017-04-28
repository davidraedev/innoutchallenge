var express = require( "express" );
var app = express();

// routes
var routes = require( "./routes.js" );
app.use( "/", routes );

app.listen( 3000 );