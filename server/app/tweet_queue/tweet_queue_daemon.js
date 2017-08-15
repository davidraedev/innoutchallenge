process.env.BASE = process.env.BASE || process.cwd();
const Logger = require( "../../controller/log" );
const log = new Logger( { path: process.env.BASE + "/log/tweet_queue.log" } );
const tweetQueueController = require( "../../controller/tweet_queue" );
const db = require( "../db" );
const utils = require( "../../controller/utils" );

const fetch_delay = 1000 * 20;
const tweets_per_queue = 3;

function callback() {

	return new Promise( ( resolve, reject ) => {

		tweetQueueController.processQueues( tweets_per_queue )
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
		log( "DB connected, starting" );
		utils.loop( callback, fetch_delay );
	})
	.catch( ( error ) => {
		log( error );
		db.close();
	});