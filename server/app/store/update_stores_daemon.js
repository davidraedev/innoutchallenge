process.env.BASE = process.env.BASE || process.cwd();
if ( process.env.NODE_ENV === "production" ) {
	const fs = require( "fs" );
	const logStream = fs.createWriteStream( process.env.BASE + "/log/update_stores.log" );
	function log( msg ) {
		logStream.write( msg + "\n" );
	}

	log( "["+ new Date() +"] Starting Log" );

	process.on( "uncaughtException", ( error ) => {
		log( error.stack );
	});

	process.once( "SIGTERM", () => {
		log( "["+ new Date() +"] Stopped" );
		logStream.end();
		process.exit( 0 );
	});
}
else {
	function log( msg ) {
		console.log( msg );
	}
}

const db = require( "../db" );
const storeController = require( "../../controller/store" );
const utils = require( "../../controller/utils" );

const fetch_delay = 1000 * 60 * 60 * 24; // once per day

function callback() {

	return new Promise( ( resolve, reject ) => {

		storeController.updateStores()
			.then( () => {
				log( "["+ new Date() +"] loop" );
				resolve();
			})
			.catch( ( error ) => {
				reject( error );
			});
	});

}

db.connect()
	.then(() => {
		log( "DB connected, updateStores looping" );
		utils.loop( callback, fetch_delay );
	})
	.catch( ( error ) => {
		log( error );
		logStream.end();
		db.close();
	});