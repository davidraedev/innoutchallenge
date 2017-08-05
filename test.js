const db = require( "./app/db" );
const tweetQueueController = require( "./controller/tweet_queue" );

db.connect()
	.then( () => {
		return tweetQueueController.watch( null, 1 );
	})
	.catch( ( error ) => {
		db.close();
		console.log( error );
		throw error;
	});