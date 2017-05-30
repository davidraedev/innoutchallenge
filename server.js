var express = require( "express" );
var app = express();

app.use( "/", require( "./route/all.js" ) );

app.listen( 3000 );