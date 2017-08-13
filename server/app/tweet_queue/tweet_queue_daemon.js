const fs = require( "fs" );

const logStream = fs.createWriteStream( process.env.BASE + "/log/tweet_queue.log" );

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

const tweetQueueController = require( "../../controller/tweet_queue" );
const db = require( "../db" );
const utils = require( "../../controller/utils" );

const fetch_delay = 1000 * 20;
const tweets_per_queue = 3;

function callback() {

	return new Promise( ( resolve, reject ) => {

		tweetQueueController.processQueues( tweets_per_queue )
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
		log( "DB connected, processQueues looping" );
		utils.loop( callback, fetch_delay );
	})
	.catch( ( error ) => {
		log( error );
		logStream.end();
		db.close();
	});