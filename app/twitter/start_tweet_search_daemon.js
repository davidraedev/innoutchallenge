const tweetController = require( "../../controller/tweet" );
const db = require( "../db" );
const utils = require( "../../controller/utils" );

const Tweet = require( "../../model/tweet" );
const Receipt = require( "../../model/receipt" );

const fetch_delay = 1000 * 60; // once per minute

function callback() {

	return new Promise( ( resolve, reject ) => {

		tweetController.getTweetsFromSearchApp()
			.then( () => {
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
		console.log( "Removing Tweets" );
		return Tweet.remove({});
	})
	.then(() => {
		console.log( "Removing Receipts" );
		return Receipt.remove({});
	})
	.then(() => {
		console.log( "DB connected, looping" );
		utils.loop( callback, fetch_delay );
	})
	.catch( ( error ) => {
		db.close();
		throw error;
	});