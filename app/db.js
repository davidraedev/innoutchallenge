var mongoose = require( "mongoose" );

mongoose.Promise = require( "bluebird" );

var host = "mongodb://localhost/test";

function connect( url, callback ) {
	url = url || host;
	return mongoose.connect( url )
		.then( function(){
			if ( typeof callback == "function" )
				callback();
		});
}

function close() {
	return mongoose.connection.close();
}

module.exports = {
	connect: connect,
	close: close,
	host: host,
};