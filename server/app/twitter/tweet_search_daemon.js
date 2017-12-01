process.env.BASE = process.env.BASE || process.cwd();
const tweetController = require( "../../controller/tweet" );
const db = require( "../db" );
const utils = require( "../../controller/utils" );
const path = require( "path" );
const log_path = path.resolve( __dirname, "../../../log/fetch_tweets.log" );
const winston = require( "winston" );
const tsFormat = () => new Date();
const logger = new ( winston.Logger )( {
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

const fetch_delay = 1000 * 60; // once per minute

const log_loop_interval = 1000 * 60 * 10; // keepalive log every ten minutes
let last_log = +new Date();

function callback() {
	
	if ( ( +new Date() - log_loop_interval ) > last_log ) {
		log.info( "loop" );
		last_log = +new Date();
	}

	return new Promise( ( resolve, reject ) => {

		tweetController.getTweetsFromSearchApp()
			.then( () => {
				return tweetController.parseTweets( true, true );
			})
			.then( ( tweets_parsed ) => {
				if ( tweets_parsed )
					log.info( tweets_parsed +" tweets parsed" );
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
	