const fs = require( "fs" );
let logStream;
const production = ( process.env.NODE_ENV === "production" );

function Logger( params ) {

	if ( process.env.NODE_ENV === "production" ) {

		logStream = fs.createWriteStream( params.path );

		process.on( "uncaughtException", ( error ) => {
			this.writeLog( error.stack );
		});

		process.once( "SIGTERM", () => {
			this.writeLog( "Stopped" );
			logStream.end();
			process.exit( 0 );
		});

	}

	return this.writeLog;
}

Logger.prototype.writeLog = function( message, is_error ) {

	let formatted_message;
	if ( is_error && production )
		formatted_message = "["+ new Date() +"] " + message.toString() + "\n";
	else if ( is_error )
		formatted_message = "["+ new Date() +"] " + message;
	else if ( production )
		formatted_message = "["+ new Date() +"] " + message + "\n";
	else 
		formatted_message = "["+ new Date() +"] " + message;

	if ( production )
		logStream.write( formatted_message );
	else
		console.log( formatted_message );
};

module.exports = Logger;