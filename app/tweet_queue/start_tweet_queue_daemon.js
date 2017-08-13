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
		console.log( "DB connected, looping" );
		utils.loop( callback, fetch_delay );
	})
	.catch( ( error ) => {
		db.close();
		throw error;
	});