const db = require( "../db.js" );
const storeController = require( "../../controller/store" );

db.connect().then(() => {
	return updateStores();
}).then(() => {
	db.close();
}).catch( ( error ) => {
	if ( error )
		throw error;
});
