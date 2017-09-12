process.env.BASE = process.env.BASE || process.cwd();
const Logger = require( "../../controller/log" );
const log = new Logger( { path: process.env.BASE + "/log/tweet_queue.log" } );
const tweetQueueController = require( "../../controller/tweet_queue" );
const db = require( "../db" );
const utils = require( "../../controller/utils" );

const fetch_delay = 1000 * 20;
const tweets_per_queue = 3;

const log_loop_interval = 1000 * 60 * 10; // keepalive log every ten minutes
let last_log = +new Date();

function callback() {

	if ( ( +new Date() - log_loop_interval ) > last_log ) {
		log( "loop" );
		last_log = +new Date();
	}

	return new Promise( ( resolve, reject ) => {

		tweetQueueController.processQueues( tweets_per_queue )
			.then( ( queues_processed ) => {
				if ( queues_processed )
					log( queues_processed +" queues processed" );
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