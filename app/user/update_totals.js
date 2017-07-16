const db = require( "../db" );
const userController = require( "../../controller/user" );

//process.on('unhandledRejection', r => console.log(r));

db.connect().then( () => {

	userController.updateAllUsersTotals()
		.then( () => {
			console.log( "All User Totals Updated." );
			db.close();
		})
		.catch( ( error ) => {
			throw error;
		});
});