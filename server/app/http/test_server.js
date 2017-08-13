const fs = require( "fs" );

const logStream = fs.createWriteStream( process.cwd() + "/test_app.log" );

function log( msg ) {
	logStream.write( msg + "\n" );
}

log( "Daemon Started" );

let i = 0;
setInterval( () => {
	log( ++i );
}, 1000 );

process.on( "uncaughtException", ( error ) => {
	log( error.stack );
});

process.once( "SIGTERM", () => {
	fs.close();
	log( "Stopped" );
	process.exit( 0 );
});