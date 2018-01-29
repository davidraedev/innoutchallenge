process.env.BASE = process.env.BASE || process.cwd();
const tweetController = require( "../controller/tweet" );
const db = require( "./db" );
const utils = require( "../controller/utils" );
const path = require( "path" );
const log = require( "../controller/log" )( path.resolve( __dirname, "../../log/fetch_tweets.log" ) );

const fetch_delay = 1000 * 60; // once per minute

log.info( "Starting" );

function callback() {

	return new Promise( ( resolve, reject ) => {
		log.info( "loop" );

		db.connect()
			.then( () => {
				log.info( "getTweetsFromSearchApp" );
				return tweetController.getTweetsFromSearchApp();
			})
			.then( () => {
				log.info( "parseTweets" );
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
	