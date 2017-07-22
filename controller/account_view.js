const User = require( "../model/user" );
const accountController = require( "./account" );

const get_account = function( request, response ) {
	accountController.getAccountFromTwitterID( request.user._json.id_str )
		.then( ( user ) => {
			response.json( user );
		})
		.catch( ( error ) => {
			throw error;
		});
};

const update_account = function( request, response ) {
	accountController.updateAccount( request.user._json.id_str, request.body.category, request.body.option, request.body.value )
		.then( ( user ) => {
			response.json( user );
		})
		.catch( ( error ) => {
			throw error;
		});
};

const delete_account = function( request, response ) {

	response.json({ success: 1 });
	return;

	accountController.deleteAccount( request.user._json.id_str )
		.then( () => {
			response.json({ success: 1 });
		})
		.catch( ( error ) => {
			throw error;
		});
};

module.exports.get_account = get_account;
module.exports.update_account = update_account;
module.exports.delete_account = delete_account;