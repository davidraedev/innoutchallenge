const Receipt = require( "../model/receipt" );
const tweetController = require( "./tweet" );
const tweetQueueController = require( "./tweet_queue" );
const twitterUserController = require( "./twitter_user" );
const userController = require( "./user" );

const createReceipt = function( receipt_data, new_receipt_tweet ) {

	return new Promise( ( resolve, reject ) => {

		function next() {
			Receipt.create( data, ( error, receipt ) => {

				if ( error )
					return reject( error );

				return resolve( receipt );

			});
		}

		let data = {};
		data.number = receipt_data.number;
		data.user = receipt_data.user;
		data.type = receipt_data.type;

		if ( receipt_data.date )
			data.date = receipt_data.date;

		if ( receipt_data.store )
			data.store = receipt_data.store;

		if ( receipt_data.approved )
			data.approved = receipt_data.approved;

		if ( new_receipt_tweet && data.type === 1 ) {

			let this_receipt;
			let this_user;

			findReceipt({ user: data.user, number: data.number })
				.then( ( receipt ) => {
					this_receipt = receipt;
					if ( ! receipt )
						return userController.findUser({ _id: data.user });
				})
				.then( ( user ) => {
					this_user = user;
					return twitterUserController.findTwitterUser({ _id: user.twitter_user });
				})
				.then( ( twitter_user ) => {
					if ( this_user ) {
						let queue_params = tweetController.createNewReceiptTweetText( twitter_user.data.screen_name, data.number, ( this_user.totals.unique.remaining - 1 ) );
						return tweetQueueController.addTweetToQueue( queue_params );
					}
				})
				.then( () => {
					next();
				})
				.catch( ( error ) => {
					throw error;
				});
		}
		else {
			next();
		}
	});
};

const findReceipts = function( query ) {

	return new Promise( ( resolve, reject ) => {
		
		Receipt.find( query, ( error, receipts ) => {
			if ( error )
				return reject( error );
			resolve( receipts );
		});
	});
};

const findReceipt = function( query ) {

	return new Promise( ( resolve, reject ) => {

		Receipt.findOne( query, ( error, receipt ) => {

			if ( error )
				return reject( error );

			resolve( receipt );

		});
	});
};

const findOrCreateReceipt = function( query, data, new_receipt_tweet ) {

	return new Promise( ( resolve, reject ) => {

		findReceipt( query )
			.then( ( receipt ) => {
				if ( ! receipt )
					return createReceipt( data, new_receipt_tweet );
				return receipt;
			})
			.then( ( receipt ) => {
				resolve( receipt );
			})
			.catch( ( error ) => {
				reject( error );
			});

	});
};

module.exports.createReceipt = createReceipt;
module.exports.findReceipt = findReceipt;
module.exports.findReceipts = findReceipts;
module.exports.findOrCreateReceipt = findOrCreateReceipt;
