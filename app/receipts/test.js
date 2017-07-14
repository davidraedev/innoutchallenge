const WordToNumber = require( "word-to-number-node" );
const w2n = new WordToNumber();
const db = require( "../db" );

const Receipt = require( "../../model/receipt" );
const Tweet = require( "../../model/tweet" );
const ObjectId = db.mongoose.Types.ObjectId;

const tweetController = require( "../../controller/tweet.js" );

db.connect().then(() => {

	Receipt.find({ tweet: { $ne: null } }, ( error, receipts ) => {

		if ( error )
			throw error;

		if ( ! receipts.length )
			throw new Error( "No Receipts Found" );

		let remaining_receipts = receipts.length;
		let matched = 0;
		let did_not_match = 0;

		receipts.forEach( ( receipt ) => {

			Tweet.findOne({ _id: new ObjectId( receipt.tweet ) }, ( error, tweet ) => {

				if ( error )
					throw error;

				if ( ! tweet )
					throw new Error( "Tweet Not Found" );

				let original = receipt.number;
				let parsed = tweetController.parseForInStoreReceipt( tweet.data.text );
				//console.log( "parsed >> ", parsed );
				if ( +parsed !== original ) {
					matches = 
					did_not_match++;
					console.log( "[%s] [%s] [%s]", receipt.number, w2n.parse( tweet.data.text ), tweet.data.text );
				}
				else {
					matched++;
				}

				if ( --remaining_receipts === 0 ) {
					console.log( "Matched: %s, Failed: %s, Fail Percent: %s\%", matched, did_not_match, ( did_not_match / ( matched + did_not_match ) ) )
					db.close();
				}

			});
		});

	});

}).catch( ( error ) => {
	throw error;
});
