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
				return User.find({ approved: { $in: [ 0 ] } });
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

module.exports.getApprovals = getApprovals;