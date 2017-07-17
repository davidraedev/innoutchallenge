const db = require( "../db" );
const Receipt = require( "../../model/tweet" );

db.connect().then( () => {
	return Receipt.remove( { number: 69, type: 1 } );
}).then( () => {
	return Receipt.update( { approved: 0 }, { $set: { approved: 1 } }, { multi: true } );
}).then( () => {
	console.log( "c" )
	db.close();
}).catch( ( error ) => {
	throw error;
});
