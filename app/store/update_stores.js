const db = require( "../db.js" );
const storeController = require( "../../controller/store" );

db.connect()
	.then( () => {
		return storeController.updateStores();
	})
	.then( () => {
		db.close();
	});
