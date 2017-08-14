const fs = require( "fs" );
let logStream;

function Logger( params ) {

	logStream = fs.createWriteStream( params.path );

	process.on( "uncaughtException", ( error ) => {
		this.writeLog( error.stack );
	});

	process.once( "SIGTERM", () => {
		this.writeLog( "Stopped" );
		logStream.end();
		process.exit( 0 );
	});

	return this.writeLog;
}

Logger.prototype.writeLog = function( message ) {
	logStream.write( "["+ new Date() +"] " + message + "\n" );
};

module.exports = Logger;