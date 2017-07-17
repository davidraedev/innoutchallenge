const Store = require( "../model/store" );
const TwitterPlace = require( "../model/twitter_place" );
const db = require( "../app/db" );

const ObjectId = db.mongoose.Schema.Types.ObjectId;

const findStoreNearCoords = function( latitude, longitude ) {

	return new Promise( ( resolve, reject ) => {
		
		Store.findOne({ loc: { $nearSphere: { $geometry: { type: "Point", coordinates: [ longitude, latitude ] }, $maxDistance: 1000 } } }, ( error, store ) => {
		
			if ( error )
				return reject( error );

			if ( ! store )
				return resolve( null );

			return resolve( store );

		});
	});
};

function getTweetCoords( tweet ) {

	if ( ! tweet.data.coordinates || ! tweet.data.coordinates.length )
		return false;

	return {
		latitude: tweet.data.coordinates.coordinates[0],
		longitude: tweet.data.coordinates.coordinates[1],
	};
}

function parseStringForStoreHashtag( tweet ) {
	let matches = tweet.match( /\#store(\d+)/ );
	return ( matches ) ? matches[1] : false;
}

function saveTwitterPlace( tweet, store ) {

	return new Promise( ( resolve, reject ) => {

		if ( ! tweet.data.place || ! tweet.data.place.id )
			return resolve( null );

		let twitter_place = new TwitterPlace();
		twitter_place.last_update = new Date();
		twitter_place.data = tweet.data.place;
		twitter_place.save( ( error, twitter_place ) => {

			if ( error )
				return reject( error );

			store.location.twitter_place = twitter_place._id;
			store.save( ( error ) => {

				if ( error )
					return reject( error );

				return resolve( twitter_place );
			});
		});
	});
}

function findSavedTwitterPlace( tweet ) {

	return new Promise( ( resolve, reject ) => {

		if ( ! tweet.data.place || ! tweet.data.place.id )
			return resolve( null );

		TwitterPlace.findOne( { "data.id": tweet.data.place.id }, ( error, twitter_place ) => {

			if ( error )
				return reject( error );

			if ( ! twitter_place )
				return resolve( null );

			return resolve( twitter_place );

		});
	});
}

function findStoreFromTwitterPlace( tweet ) {

	return new Promise( ( resolve, reject ) => {
		findSavedTwitterPlace( tweet ).then( ( twitter_place ) => {

			if ( ! twitter_place )
				return resolve( null );

			Store.findOne( { "location.twitter_place": new ObjectId( twitter_place._id ) }, ( error, store ) => {
				if ( error )
					return reject( error );
				return resolve( store );
			});

		}).catch( ( error ) => {
			reject( error );
		});
	});
}

const parseTweetForStore = function( tweet, ignore_hashtag ) {

	return new Promise( ( resolve, reject ) => {

		let store_number = parseStringForStoreHashtag( tweet.data.text );
		if ( ! store_number || ignore_hashtag ) {

			let coords = getTweetCoords( tweet );
			if ( ! coords )
				resolve( null );

			findStoreNearCoords( coords.latitude, coords.longitude ).then( ( store ) => {

				if ( ! store ) {

					findStoreFromTwitterPlace( tweet ).then( ( store ) => {
						resolve( store );
					}).catch( ( error ) => {
						reject( error );
					});

				}
				else {
					resolve( store );
				}

			}).catch( ( error ) => {
				reject( error );
			});
		}
		else {
			Store.findOne( { number: store_number }, ( error, store ) => {

				if ( error )
					return reject( error );

				if ( ! store )
					return parseTweetForStore( tweet, true );

				resolve( store );
			});
		}

	});
};

const findStores = function( query, lean ) {

	return new Promise( ( resolve, reject ) => {

		let callback = function( error, stores ) {
			if ( error )
				return reject( error );
			resolve( stores );
		};

		if ( lean )
			Store.find( query, callback ).lean();
		else
			Store.find( query, callback );
	});
};

const findStore = function( query, lean ) {

	return new Promise( ( resolve, reject ) => {

		let callback = function( error, store ) {
			if ( error )
				return reject( error );
			resolve( store );
		};

		if ( lean )
			Store.findOne( query, callback ).lean();
		else
			Store.findOne( query, callback );
	});
};
/*
const findOrCreateReceipt = function( query, data ) {

	return new Promise( ( resolve, reject ) => {

		findReceipt( query )
			.then( ( receipt ) => {
				if ( ! receipt )
					return createReceipt( data );
				return receipt;
			})
			.then( ( receipt ) => {
				resolve( receipt );
			})
			.catch( ( error ) => {
				reject( error );
			});

	});
};
*/

const parseTweetsForStores = function( tweets ) {

	return new Promise( ( resolve, reject ) => {

		let remaining = tweets.length;

		if ( ! remaining )
			resolve();

		tweets.forEach( ( tweet ) => {

			parseTweetForStore( tweet )
				.then( () => {
					if ( --remaining === 0 )
						resolve();
				})
				.catch( ( error ) => {
					reject( error );
				});
		});
	});
};



module.exports.findStoreNearCoords = findStoreNearCoords;
module.exports.parseTweetForStore = parseTweetForStore;
module.exports.parseTweetsForStores = parseTweetsForStores;
module.exports.findStore = findStore;
module.exports.findStores = findStores;
module.exports.saveTwitterPlace = saveTwitterPlace;