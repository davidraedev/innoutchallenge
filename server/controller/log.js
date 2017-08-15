const fs = require( "fs" );
let logStream;

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

Logger.prototype.writeLog = function( message ) {
	if ( process.env.NODE_ENV === "production" )
		logStream.write( "["+ new Date() +"] " + message + "\n" );
	else
		console.log( "["+ new Date() +"] " + message );
};

module.exports = Logger;