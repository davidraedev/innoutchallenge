var mongoose = require( "mongoose" );

mongoose.Promise = require( "bluebird" );

var host = "mongodb://localhost/test";

function connect( callback ) {
	return mongoose.connect( host )
		.then( function(){
			if ( typeof callback == "function" )
				callback( null );
		})
		.catch( function( error ){
			if ( typeof callback == "function" )
				callback( error );
		});;
}

function close() {
	return mongoose.connection.close();
}

module.exports = {
	connect: connect,
	close: close,
	host: host,
};