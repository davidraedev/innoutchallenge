const User = require( "../model/user" );
const storeController = require( "./store" );
const twitterUtils = require( "./twitter_utils" );

const Receipt = require( "../model/receipt" );

const searchUser = function( name, lazy ) {

	return new Promise( ( resolve, reject ) => {

		let search = ( lazy ) ? { $regex: new RegExp( name, "i" ) } : name ;

		User.findOne( { state: { $in: [ 1, 4 ] }, name: search }, [ "name", "totals" ] ).lean()
			.then( ( user ) => {
				resolve( user );
			})
			.catch( ( error ) => {
				reject( error );
			});
	});

};

const createUser = function( user_data ) {

	return new Promise( ( resolve, reject ) => {

		let data = {};
		data.name = user_data.name;
		data.state = user_data.state;

		if ( user_data.twitter_user ) {
			data.twitter_user = user_data.twitter_user;
			if ( user_data.twitter_user.profile_image_url_https ) {
				data.settings = { avatar: twitterUtils.convertProfileImageUrl( user_data.twitter_user.profile_image_url_https, "full" ) };
			}
		}

		User.create( data, ( error, user ) => {

			if ( error )
				return reject( error );

			return resolve( user );

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

function findUsers( query ) {

	return new Promise( ( resolve, reject ) => {

		User.find( query, ( error, users ) => {

			if ( error )
				return reject( error );

			resolve( users );

		});
	});
}

const findOrCreateUser = function( query, data ) {

	return new Promise( ( resolve, reject ) => {

		findUser( query )
			.then( ( user ) => {
				if ( ! user )
					return createUser( data );
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


		// in-store and drivethru totals
		let stores_list = {};
		let user_id = user._id.toString();
		let query = { user: user_id, type: { $in: [ 1, 2 ] }, approved: { $in: [ 1, 2 ] } };
		Receipt.find( query )
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
					return [];
				}

				totals.stores.remaining = stores.length;

				stores.forEach( ( store ) => {
					stores_list[ store._id.toString() ] = { amount: 0 };
				});

				// if we vet our data input correctly, we can take out the store/popup check and rely only on the { type } check
				return Receipt.find( { user: user._id, approved: 1, store: { $ne: null }, type: { $in: [ 1, 2, 3 ] } } );
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
					resolve( user.totals );
				});

			})
			.catch( ( error ) => {
				reject( error );
			});
	});
};

const updateAllUsersTotals = function(){

	return new Promise( ( resolve, reject ) => {

		findUsers( { state: { $in: [ 1, 4 ] } } )
			.then( ( users ) => {

				if ( ! users.length ) {
					console.log( "no users to update" );
					resolve();
				}

				let i = 0;
				let end = ( users.length - 1 );
				function updateUserTotalsLoop() {

					if ( i >= end )
						return resolve();

					updateUserTotals( users[ i++ ] )
						.then( () => {
							updateUserTotalsLoop();
						})
						.catch( ( error ) => {
							throw error;
						});
				}

				updateUserTotalsLoop();
			})
			.catch( ( error ) => {
				reject( error );
			});
	});
};

module.exports.searchUser = searchUser;
module.exports.createUser = createUser;
module.exports.findUser = findUser;
module.exports.findOrCreateUser = findOrCreateUser;
module.exports.updateUserTotals = updateUserTotals;
module.exports.updateAllUsersTotals = updateAllUsersTotals;