process.env.BASE = process.env.BASE || process.cwd();
const Logger = require( "../../controller/log" );
const log = new Logger( { path: process.env.BASE + "/log/fetch_tweets.log" } );
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
		db.close();
	});