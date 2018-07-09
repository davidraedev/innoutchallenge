const adminController = require( "./admin" );

const get_approvals = function( request, response ) {

	adminController.getApprovals()
		.then( ( approvals ) => {
			response.json( approvals );
		})
		.catch( ( error ) => {
			console.log( "error [%s]", error );
			response.status( 500 ).send( error );
		});
};

const update_receipt = function( request, response ) {

	if ( ! request.body.id || ! request.body.receipt )
		return response.status( 500 ).send({ error: "Invalid Data" });

	let data = request.body.receipt;
	let id = request.body.id;

	adminController.updateReceipt( id, data )
		.then( ( updated_receipt ) => {
			response.json({ success: true, receipt: updated_receipt });
		})
		.catch( ( error ) => {
			console.log( "error [%s]", error );
			response.status( 500 ).send( error );
		});
};

const update_user = function( request, response ) {

	if ( ! request.body.id || ! request.body.user )
		return response.status( 500 ).send({ error: "Invalid Data" });

	let data = request.body.user;
	let id = request.body.id;

	adminController.updateUser( id, data )
		.then( ( updated_user ) => {
			response.json({ success: true, user: updated_user });
		})
		.catch( ( error ) => {
			console.log( "error [%s]", error );
			response.status( 500 ).send( error );
		});
};

module.exports.get_approvals = get_approvals;
module.exports.update_receipt = update_receipt;
module.exports.update_user = update_user;