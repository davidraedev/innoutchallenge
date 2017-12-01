process.env.BASE = process.env.BASE || process.cwd();
const tweetQueueController = require( "../../controller/tweet_queue" );
const db = require( "../db" );
const utils = require( "../../controller/utils" );
const path = require( "path" );
const log_path = path.resolve( __dirname, "../../../log/tweet_queue.log" );
const winston = require( "winston" );
const tsFormat = () => new Date();
const log = new ( winston.Logger )( {
	transports: [
		new ( winston.transports.Console )( {
			timestamp: tsFormat,
			colorize: true,
			level: "info",
		} ),
		new ( winston.transports.File )( {
			filename: log_path,
			timestamp: tsFormat,
			json: true,
			level: "debug",
			handleExceptions: true
		} ),
	]
});

const fetch_delay = 1000 * 20;
const tweets_per_queue = 3;

const log_loop_interval = 1000 * 60 * 10; // keepalive log every ten minutes
let last_log = +new Date();

function callback() {

	if ( ( +new Date() - log_loop_interval ) > last_log ) {
		log.info( "loop" );
		last_log = +new Date();
	}

	return new Promise( ( resolve, reject ) => {

		tweetQueueController.processQueues( tweets_per_queue )
			.then( ( queues_processed ) => {
				if ( queues_processed )
					log.info( queues_processed +" queues processed" );
				resolve();
			})
			.catch( ( error ) => { 
				reject( error );
			});
	});

}

function start() {

	db.connect()
		.catch( ( error ) => {

			if ( error.name === "MongoError" ) {
				if ( /failed to connect to server/.test( error.message ) ) {
					log.error( "Failed to connect to to database, retrying in 5 seconds" );
					setTimeout( () => {
						start();
					}, 5000 );
				}
				else {
					log.error( "Database Error" );
				}
			}

			throw error;                                                                                                       
		})
		.then(() => {
			log.info( "DB connected, starting" );
			utils.loop( callback, fetch_delay );
		})
		.catch( ( error ) => {
			log.error( error );
			db.close();
		});
}

start();
	