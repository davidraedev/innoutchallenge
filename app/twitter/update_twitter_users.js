const db = require( "../db" );
const twitterUserController = require( "../../controller/twitter_user" );

db.connect()
	.then( () => {
		return twitterUserController.updateTwitterUsers();
	})
	.then( () => {
		console.log( "TwitterUsers Updated." );
		db.close();
	})
	.catch( ( error ) => {
		throw error;
	});