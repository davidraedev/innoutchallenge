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

module.exports.get_approvals = get_approvals;