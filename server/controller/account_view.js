const accountController = require( "./account" );

const get_account = function( request, response ) {
	accountController.getAccountFromUserID( request.user )
		.then( ( user ) => {
			response.json( user );
		})
		.catch( ( error ) => {
			console.log( "error [%s]", error );
			if ( error == "Error: user not found" )
				response.status( 401 ).send();
			else
				response.status( 500 ).send( error );
		});
};

const update_account = function( request, response ) {
	accountController.updateAccount( request.user, request.body )
		.then( ( user ) => {
			response.json( user );
		})
		.catch( ( error ) => {
			response.status( 500 ).send( error );
		});
};

const delete_account = function( request, response ) {

	response.json({ success: 1 });
	return;

	accountController.deleteAccount( request.user )
		.then( () => {
			response.json({ success: 1 });
		})
		.catch( ( error ) => {
			response.status( 500 ).send( error );
		});
};

module.exports.get_account = get_account;
module.exports.update_account = update_account;
module.exports.delete_account = delete_account;