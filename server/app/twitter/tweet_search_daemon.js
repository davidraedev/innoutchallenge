process.env.BASE = process.env.BASE || process.cwd();
const tweetController = require( "../../controller/tweet" );
const db = require( "../db" );
const utils = require( "../../controller/utils" );
const path = require( "path" );
const log_path = path.resolve( __dirname, "../../../log/fetch_tweets.log" );
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

const fetch_delay = 1000 * 60; // once per minute

function callback() {

	return new Promise( ( resolve, reject ) => {
		log.info( "loop" );

		db.connect()
			.then( () => {
				return tweetController.getTweetsFromSearchApp();
			})
			.then( () => {
				return tweetController.parseTweets( true, true );
			})
			.then( ( tweets_parsed ) => {
				if ( tweets_parsed )
					log.info( tweets_parsed +" tweets parsed" );
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
	