process.env.BASE = process.env.BASE || process.cwd();
const Logger = require( "../../controller/log" );
const log = new Logger( { path: process.env.BASE + "/log/fetch_tweets.log" } );
const tweetController = require( "../../controller/tweet" );
const db = require( "../db" );
const utils = require( "../../controller/utils" );

const fetch_delay = 1000 * 60; // once per minute

const log_loop_interval = 1000 * 60 * 10; // keepalive log every ten minutes
let last_log = +new Date();

function callback() {
	
	if ( ( +new Date() - log_loop_interval ) > last_log ) {
		log( "loop" );
		last_log = +new Date();
	}

	return new Promise( ( resolve, reject ) => {

		tweetController.getTweetsFromSearchApp()
			.then( () => {
				return tweetController.parseTweets( true, true );
			})
			.then( ( tweets_parsed ) => {
				if ( tweets_parsed )
					log( tweets_parsed +" tweets parsed" );
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