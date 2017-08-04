const db = require( "../db" );
const userController = require( "../../controller/user" );

db.connect()
	.then( () => {
		return userController.updateUsers();
	})
	.then( () => {
		console.log( "Users Updated." );
		db.close();
	})
	.catch( ( error ) => {
		throw error;
	});