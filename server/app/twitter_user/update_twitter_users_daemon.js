process.env.BASE = process.env.BASE || process.cwd();
if ( process.env.NODE_ENV === "production" ) {
	const fs = require( "fs" );
	const logStream = fs.createWriteStream( process.env.BASE + "/log/update_twitter_users.log" );
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

const twitterUsersController = require( "../../controller/twitter_user" );
const db = require( "../db" );
const utils = require( "../../controller/utils" );

const fetch_delay = 1000 * 60;

function callback() {

	return new Promise( ( resolve, reject ) => {

		twitterUsersController.updateTwitterUsers()
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
		log( "DB connected, looping" );
		utils.loop( callback, fetch_delay );
	})
	.catch( ( error ) => {
		log( error );
		logStream.end();
		db.close();
	});