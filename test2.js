const db = require( "./app/db" );
const tweetQueueController = require( "./controller/tweet_queue" );
const tweetController = require( "./controller/tweet" );

db.connect()
	.then( () => {
		return tweetController.createNewReceiptTweetParams(
			"genericwinner",
			{
				data: {
					id_str: "893569973385179136",
				},
			},
			{
				is_new_in_store: true,
				in_store_receipt_number: 10,
				in_store_receipts_remaining: 40,
				is_new_drive_thru: false,
				drive_thru_receipt_number: null,
				drive_thru_receipts_remaining: 800,
				is_new_store: true,
				store_number: 20,
				stores_remaining: 100,
			}
		);
	})
	.then( ( params ) => {
		if ( params )
			return tweetQueueController.addTweetToQueue( params, "5984d5be09a7171c5ebf5ca6", 2, null, 1 );
		else
			throw new Error( "no params" );
	})
	.then( () => {
		db.close();
	})
	.catch( ( error ) => {
		db.close();
		console.log( error );
		throw error;
	});