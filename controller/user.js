const User = require( "../model/user" );
const tweetController = require( "./tweet" );
const tweetQueueController = require( "./tweet_queue" );
const receiptController = require( "./receipt" );
const storeController = require( "./store" );
var mongoose = require( "mongoose" );
var ObjectId = mongoose.Schema.Types.ObjectId;

const searchUser = function( name ) {

	return new Promise( ( resolve, reject ) => {

		User.findOne( { state: 1, name: { $regex : new RegExp( name, "i" ) } }, [ "name", "totals" ], ( error, user ) => {

			if ( error )
				reject( error );

			if ( error )
				reject( "User Not Found" );

			resolve( user );

		}).lean();
		
	});

};

const createUser = function( user_data, new_user_tweet ) {

	return new Promise( ( resolve, reject ) => {

		let data = {};
		data.name = user_data.name;
		data.state = user_data.state;

		if ( user_data.join_date )
			data.join_date = user_data.join_date;

		if ( user_data.twitter_user )
			data.twitter_user = user_data.twitter_user;

		User.create( data, ( error, user ) => {

			if ( error )
				return reject( error );

			if ( new_user_tweet ) {
				tweetController.createNewUserTweetParams( data.name, new_user_tweet )
					.then( ( params ) => {
						return tweetQueueController.addTweetToQueue( params );
					})
					.then(() => {
						resolve( user );
					})
					.catch( ( error ) => {
						reject( error );
					});
			}
			else {
				return resolve( user );
			}

		});

	});
};

const findUser = function( query ) {

	return new Promise( ( resolve, reject ) => {

		User.findOne( query, ( error, user ) => {

			if ( error )
				return reject( error );

			resolve( user );

		});
	});
};

const findUsers = function( query ) {

	return new Promise( ( resolve, reject ) => {

		User.find( query, ( error, users ) => {

			if ( error )
				return reject( error );

			resolve( users );

		});
	});
};

const findOrCreateUser = function( query, data, new_user_tweet ) {

	return new Promise( ( resolve, reject ) => {

		findUser( query )
			.then( ( user ) => {
				if ( ! user )
					return createUser( data, new_user_tweet );
				return user;
			})
			.then( ( user ) => {
				resolve( user );
			})
			.catch( ( error ) => {
				reject( error );
			});

	});
};

const updateUserTotals = function( user ) {

	return new Promise( ( resolve, reject ) => {

		let totals = {
			receipts: {
				unique: 0,
				total: 0,
				remaining: 98,
			},
			drivethru: {
				unique: 0,
				total: 0,
				remaining: 999,
			},
			stores: {
				unique: 0,
				total: 0,
			},
			popups: {
				total: 0
			}
		};


		// in-storea and drivethru totals
		let stores_list = {};
		let user_id = user._id.toString();
		receiptController.findReceipts( { user: user_id, type: { $in: [ 1, 2 ] }, approved: 1 } )
			.then( ( receipts ) => {

				if ( ! receipts.length ) {
					console.log( "no receipts found [%s]", user.name );
					return;
				}

				let receipts_list = {};
				let drive_thru_list = {};
				for ( let i = 1; i <= 99; i++ ) {
					if ( i !== 69 )
						receipts_list[ i ] = { amount: 0 };
				}

				receipts.forEach( ( receipt ) => {

					// in_store
					if ( receipt.type === 1 ) {
					
						if ( receipts_list[ receipt.number ].amount === 0 ) {
							totals.receipts.unique++;
							totals.receipts.remaining--;
						}
						totals.receipts.total++;
						receipts_list[ receipt.number ].amount++;

					}

					// drive_thru
					if ( receipt.type === 2 ) {
					
						if ( ! drive_thru_list[ receipt.number ] ) {
							drive_thru_list[ receipt.number ] = { amount: 0 };
							totals.drivethru.unique++;
							totals.drivethru.remaining--;
						}
						totals.drivethru.total++;
						drive_thru_list[ receipt.number ].amount++;

					}

				});

				return;

			})
			.then( () => {
				return storeController.findStores( {}, true );
			})
			.then( ( stores ) => {

				if ( ! stores.length ) {
					console.log( "No Stores found" );
					return;
				}

				totals.stores.remaining = stores.length;

				stores.forEach( ( store ) => {
					stores_list[ store._id ] = { amount: 0 };
				});

				// if we vet our data input correctly, we can take out the store/popup check and rely only on the { type } check
				return receiptController.findReceipts( { user: user._id, approved: 1, store: { $ne: null }, type: { $in: [ 1, 2, 3 ] } }, true );
					
			})
			.then( ( receipts ) => {

				receipts.forEach( ( receipt ) => {

					// popups
					if ( receipt.popup ) {
						totals.popups.total++;
					}

					// stores
					else {
						if ( stores_list[ receipt.store ].amount === 0 ) {
							totals.stores.unique++;
							totals.stores.remaining--;
						}

						totals.stores.total++;
						stores_list[ receipt.store ].amount++;
					}

				});

				user.totals = totals;
				user.save( ( error ) => {
					if ( error )
						throw error;
					resolve();
				});

			})
			.catch( ( error ) => {
				reject( error );
			});
	});
};

const updateAllUsersTotals = function(){

	return new Promise( ( resolve, reject ) => {

		findUsers( { state: 1 } )
			.then( ( users ) => {

				if ( ! users.length ) {
					console.log( "no users to update" );
					resolve();
				}

				let users_remaining = users.length;

				users.forEach( ( user ) => {
					
					updateUserTotals( user )
						.then( () => {
							if ( --users_remaining === 0 )
								resolve();
						})
						.catch( ( error ) => {
							throw error;
						});
				});
			})
			.catch( ( error ) => {
				reject( error );
			});
	});
};

module.exports = {
	searchUser: searchUser,
	createUser: createUser,
	findUser: findUser,
	findOrCreateUser: findOrCreateUser,
	updateUserTotals: updateUserTotals,
	updateAllUsersTotals: updateAllUsersTotals,
};