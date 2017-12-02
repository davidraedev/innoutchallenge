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

function callback() {

	log.info( "loop" );

	return new Promise( ( resolve, reject ) => {

		db.connect()
			.then( () => {
				return tweetQueueController.processQueues( tweets_per_queue );
			})
			.then( ( queues_processed ) => {
				if ( queues_processed )
					log.info( queues_processed +" queues processed" );
				resolve();
				db.close();
			})
			.catch( ( error ) => { 
				log.error( error );
				db.close();
				if ( error.name === "MongoError" || error.name === "MongooseError" )
					resolve( 1000 * 5 );
				else
					reject( error );
			});
	});

}
utils.loop( callback, fetch_delay );
	