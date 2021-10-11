const User = require( "../model/user" );
const Receipt = require( "../model/receipt" );

const getApprovals = function() {

	return new Promise( ( resolve, reject ) => {

		let this_receipts;
		let this_users;
		Receipt.find({ approved: { $in: [ 0, 2 ] } })
			.populate( "tweet user" )
			.then( ( receipts ) => {
				this_receipts = receipts;
				return User.find({ state: { $in: [ 0, 2, 3 ] } })
							.populate( "twitter_user" );
			})
			.then( ( users ) => {
				this_users = users;
				return resolve({
					users: users,
					receipts: this_receipts,
				});
			})
			.catch( ( error ) => {
				reject( error );
			});
	});

};

const updateReceipt = function( id, data ) {

	return new Promise( ( resolve, reject ) => {

		Receipt.findOne({ _id: id })
			.then( ( receipt ) => {

				if ( ! receipt ) {
					throw new Error( "Receipt does nto exist" );
				}

				for ( let key in data ) {

					if ( ! data.hasOwnProperty( key ) ) {
						continue;
					}

					receipt[ key ] = data[ key ];
				}

				return receipt.save();
			})
			.then( ( receipt ) => {
				return resolve( receipt );
			})
			.catch( ( error ) => {
				reject( error );
			});
	});

};

const updateUser = function( id, data ) {

	return new Promise( ( resolve, reject ) => {

		User.findOne({ _id: id })
			.then( ( user ) => {

				if ( ! user ) {
					throw new Error( "User does nto exist" );
				}

				for ( let key in data ) {

					if ( ! data.hasOwnProperty( key ) ) {
						continue;
					}

					user[ key ] = data[ key ];
				}

				return user.save();
			})
			.then( ( user ) => {
				return resolve( user );
			})
			.catch( ( error ) => {
				reject( error );
			});
	});

};

module.exports.getApprovals = getApprovals;
module.exports.updateReceipt = updateReceipt;
module.exports.updateUser = updateUser;