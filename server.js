var express = require( "express" );
var app = express();

// models
var Bear = require( "./models/bear" );

// routes
var routes = require( "./routes.js" );
app.use( "/", routes );

app.listen( 3000 );