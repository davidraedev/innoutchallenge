process.env.BASE = process.env.BASE || process.cwd();
if ( process.env.NODE_ENV === "production" ) {
	const fs = require( "fs" );
	const logStream = fs.createWriteStream( process.env.BASE + "/log/fetch_tweets.log" );
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

const tweetController = require( "../../controller/tweet" );
const db = require( "../db" );
const utils = require( "../../controller/utils" );

const fetch_delay = 1000 * 60; // once per minute

function callback() {

	return new Promise( ( resolve, reject ) => {

		tweetController.getTweetsFromSearchApp()
			.then( () => {
				log( "["+ new Date() +"] loop" );
				return tweetController.parseTweets( true, true );
			})
			.then( () => {
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