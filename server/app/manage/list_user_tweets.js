const db = require( "../db" );
const User = require( "../../model/user" );
const Receipt = require( "../../model/receipt" );
const PromiseEndError = require( "../error/PromiseEndError" );

let three_days_ago = new Date();
	three_days_ago.setDate( three_days_ago.getDate() - 3 );

db.connect().then( () => {

	let name = "daraeman";

	let this_receipts,
		this_tweets;
	User.findOne({ name: name })
		.then( ( user ) => {
			if ( ! user )
				throw new Error( "["+ name +"] not found" );
			return Receipt.find({ user: user._id, date: { $gt: three_days_ago } }).sort({ date: -1 });
		})
		.then( ( receipts ) => {
			if ( ! receipts.length )
				throw new PromiseEndError( "Did not find any receipts" );
			this_receipts = receipts;
			let remaining = receipts.length;
			receipts.forEach( ( receipt ) => {
				Tweet.removeOne({ _id: receipt.tweet })
					.then( () => {
						if ( --remaining === 0 ) {

							let remaining = receipts.length;
							receipts.forEach( ( receipt ) => {
								Receipt.removeOne({ _id: receipt._id })
									.then( () => {
										if ( --remaining === 0 ) {
											console.log( "remaining" );
											db.close();
										}
									});
							});
						}
					});
			});
		})
		.catch( ( error ) => {
			db.close();
			if ( error instanceof PromiseEndError )
				return console.log( error.toString() );
			throw error;
		});
});