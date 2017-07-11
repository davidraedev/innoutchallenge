var Store = require( "../model/store" );
var Tweet = require( "../model/tweet" );
var db = require( "../app/db" );

function findStoreNearCoords( latitude, longitude ) {

	console.log( "latitude >> ", latitude )
	console.log( "longitude >> ", longitude )

	return new Promise( ( resolve, reject ) => {
		
		Store.findOne({ loc: { $nearSphere: { $geometry: { type: "Point", coordinates: [ longitude, latitude ] }, $maxDistance: 1000 } } }, ( error, store ) => {
		
			if ( error )
				reject( error );

			if ( ! store )
				resolve( null );

			resolve( store );

		});

	});
	
}
/*
db.connect().then( () => {

	Tweet.findOne({ "data.coordinates": { $ne: null } }, ( error, tweet ) => {

		if ( error )
			throw error;

		if ( ! tweet )
			throw new Error( "NO TWEET" )

		console.log( "tweet.data.coordinates.coordinates >> ", tweet.data.coordinates.coordinates )

		findStoreNearCoords( tweet.data.coordinates.coordinates[1], tweet.data.coordinates.coordinates[0] )
			.then( ( store ) => {
				console.log( "store found >> ", store );
				db.close()
			})
			.catch( ( error ) => {
				console.error( "Error >> ", error );
				db.close()
			});
	});
});
*/
module.exports = {
	findStoreNearCoords: findStoreNearCoords,
};