const Store = require( "../model/store" );
const TwitterPlace = require( "../model/twitter_place" );
const Tweet = require( "../model/tweet" );
const Receipt = require( "../model/receipt" );
const Utils = require( "./utils" );
const innoutLocations = require( "innout_locations" );
const fs = require( "fs" );

const ObjectId = require( "mongoose" ).Schema.Types.ObjectId;

const base = process.env.BASE || process.cwd();

const cached_stores_file = base + "/data/stores/stores.json";

const findStoreNearCoords = function( latitude, longitude ) {
	return Store.findOne({ loc: { $nearSphere: { $geometry: { type: "Point", coordinates: [ longitude, latitude ] }, $maxDistance: 1000 } } } );
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
			if ( ! coords ) {
				return resolve( null );
			}

			findStoreNearCoords( coords.latitude, coords.longitude )
				.then( ( store ) => {

					if ( ! store ) {

						findStoreFromTwitterPlace( tweet )
							.then( ( store ) => {
								return resolve( store );
							});

					}
					else {
						return resolve( store );
					}

				})
				.catch( ( error ) => {
					return reject( error );
				});
		}
		else {
			Store.findOne( { number: store_number } )
				.then( ( store ) => {
					if ( ! store ) {
						return parseTweetForStore( tweet, true )
							.then( ( store ) => {
								resolve( store );
							});
					}

					return resolve( store );
				})
				.catch( ( error ) => {
					return reject( error );
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



/*

Format of the In-N-Out JSON

[ {
	"StoreNumber": 303,
	"Name": "Alameda",
	"StreetAddress": "555 Willie Stargell Ave.",
	"City": "Alameda",
	"State": "CA",
	"ZipCode": 94501,
	"Latitude": 37.78372,
	"Longitude": -122.27728,
	"Distance": 7951.76,
	"DriveThruHours": "10:30 a.m. - 1:00 a.m.",
	"DiningRoomHours": "10:30 a.m. - 1:00 a.m.",
	"OpenDate": "2015-05-14T00:00:00",
	"ImageUrl": "http://www.in-n-out.com/ino-images/default-source/location-store-images/store_303.png",
	"EnglishApplicationUrl": "https://wfa.kronostm.com/index.jsp?locale=en_US&INDEX=0&applicationName=InNOutBurgerNonReqExt&LOCATION_ID=60388278526&SEQ=locationDetails",
	"SpanishApplicationUrl": "https://wfa.kronostm.com/index.jsp?locale=es_PR&INDEX=0&applicationName=InNOutBurgerNonReqExt&LOCATION_ID=60388278526&SEQ=locationDetails",
	"PayRate": null,
	"EmploymentNotes": [],
	"ShowSeparatedHours": false,
	"DiningRoomNormalHours": [],
	"DriveThruNormalHours": [],
	"HasDiningRoom": true,
	"HasDriveThru": true,
	"Directions": null,
	"UnderRemodel": false,
	"UseGPSCoordinatesForDirections": false
}, ]

*/



/*

	parseHours

	The API does not list out the extended weekend hours.
	Nor the full extend of non-standard hours.

	We mark them as non-standard and will have to manually
	grab them from http://locations.in-n-out.com/STORENUMBER,
	which does list out the full hours.

*/
function parseHours( hours_string ) {

	let days = [
		"sunday",
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
		"saturday"
	];

	let all_hours = {};
	days.forEach( ( day ) => {

		let hours = {};

		// regular hours
		if ( hours_string == "10:30 a.m. - 1:00 a.m." ) {
			hours.start = 1030;
			if ( day === "friday" || day === "saturday" )
				hours.end = 130;
			else
				hours.end = 100;
		}
		// non-standard hours
		else {
			hours.manual = true;
		}

		all_hours[ day ] = hours;

	});

	return all_hours;
}

function parseLocation( data ) {

	let location = {};
		location.latitude = data.Latitude;
		location.longitude = data.Longitude;
		location.address = data.StreetAddress;
		location.city = data.City;
		location.state = data.State;
		location.zipcode = Utils.leftPad( String( data.ZipCode ), 5, "0" );
		location.country = "US";

	return location;
}

function parseStore( data ) {

	let store = {};
		store.number = data.StoreNumber;
		store.name = data.Name;
		store.location = parseLocation( data );
		store.dining_room_hours = parseHours( data.DiningRoomHours, "dining_room" );
		store.drive_thru_hours = parseHours( data.DriveThruHours, "drive_thru" );

	// stores without an open date aren't open yet
	let open_date = data.OpenDate || "1900-01-01";
	store.opened = Date.parse( open_date.substring( 0, 10 ) );
	store.under_remodel = data.UnderRemodel;
	store.dining_room = data.HasDiningRoom;
	store.drive_thru = data.HasDriveThru;
	store.remote_image_url = data.ImageUrl;

	store.loc = [ store.location.longitude, store.location.latitude ];

	return store;
}

const updateStores = function() {

	return new Promise( ( resolve, reject ) => {

		innoutLocations.get().then( ( json ) => {

			fs.writeFile( cached_stores_file, JSON.stringify( json ), ( error ) => {
				if ( error )
					throw error;
			});

			let remaining = json.data.length;
			json.data.forEach( ( raw_store ) => {
				let store = parseStore( raw_store );
				Store.update(
					{ number: store.number },
					{ "$set": store },
					{ upsert: true, setDefaultsOnInsert: true },
					( error ) => {
						if ( error )
							throw error;
						if ( --remaining === 0 )
							resolve();
					}
				);
			});

		}).catch( ( error ) => {
			if ( error )
				reject( error );
		});
	});
};

const findStoresFromTweets = function() {

	return new Promise( ( resolve, reject ) => {

		findStoresFromTweetText()
			.then( () => {
				return findStoresFromTweetLocation();
			})
			.then( () => {
				resolve();
			})
			.catch( ( error ) => {
				reject( error );
			});

	});
};

const findStoresFromTweetText = function() {

	return new Promise( ( resolve, reject ) => {

		Tweet.find( { "data.text": /#store\d+/ })
			.then( ( tweets ) => {

				if ( ! tweets.length )
					return reject( "No Tweets found." );

				let tweets_remaining = tweets.length;
				tweets.forEach( ( tweet ) => {
					--tweets_remaining;

					if ( ! tweet.receipt ) {
						console.log( "No receipt id, skipping tweet" );
						if ( tweets_remaining === 0 )
							resolve();
						return;
					}

					let matches;
					let this_receipt;
					Receipt.findOne( { tweet: tweet._id })
						.then( ( receipt ) => {

							if ( ! receipt ) {
								console.log( "Receipt not found" );
								return;
							}

							if ( receipt.store ) {
								console.log( "Store already linked" );
								return;
							}

							matches = tweet.data.text.match( /#store(\d+)/ );
							if ( ! matches ) {
								console.log( "Tweet has no store hashtag" );
								return;
							}

							this_receipt = receipt;

							return Store.findOne( { number: matches[1] } );

						})
						.then( ( store ) => {

							if ( ! store ) {
								console.log( "Store not found [%s]", matches[1] );
								return;
							}

							this_receipt.store = store._id;
							return this_receipt.save();
						})
						.then( () => {
							if ( tweets_remaining === 0 )
								resolve();
						})
						.catch( ( error ) => {
							throw error;
						});
				});
			})
			.catch( ( error ) => {
				reject( error );
			});

	});
};

const findStoresFromTweetLocation = function() {

	return new Promise( ( resolve, reject ) => {

		Receipt.find( { store: { $exists: false } } )
			.then ( ( receipts ) => {

				if ( ! receipts.length )
					throw new Error( "No Receipts found." );

				let receipts_remaining = receipts.length;
				receipts.forEach( ( receipt ) => {
					--receipts_remaining;

					if ( ! receipt.tweet ) {
						console.log( "No tweet id, skipping receipt" );
						return;
					}

					let this_tweet;
					Tweet.findById( receipt.tweet )
						.then( ( tweet ) => {

							if ( ! tweet ) {
								console.log( "Tweet not found" );
								return;
							}

							if ( ! tweet.data.coordinates ) {
								console.log( "Tweet has no coordinates" );
								return;
							}

							return findStoreNearCoords( tweet.data.coordinates.coordinates[1], tweet.data.coordinates.coordinates[0] );
						
						})
						.then( ( store ) => {

							if ( ! store ) {
								if ( this_tweet )
									console.log( "Store not found [%s] [%s] [%s]", this_tweet.data.coordinates.coordinates[1], this_tweet.data.coordinates.coordinates[0], "https://twitter.com/"+ this_tweet.data.user.screen_name +"/statuses/"+ this_tweet.data.id_str );
								return;
							}

							receipt.store = store._id;

							return receipt.save();

						})
						.then( () => {
							if ( receipts_remaining === 0 )
								resolve();
						})
						.catch( ( error ) => {
							throw error;
						});

				});
			})
			.catch( ( error ) => {
				reject( error );
			});

	});
};


module.exports.findStoreNearCoords = findStoreNearCoords;
module.exports.parseTweetForStore = parseTweetForStore;
module.exports.parseTweetsForStores = parseTweetsForStores;
module.exports.findStore = findStore;
module.exports.findStores = findStores;
module.exports.saveTwitterPlace = saveTwitterPlace;
module.exports.updateStores = updateStores;
module.exports.findStoresFromTweets = findStoresFromTweets;
module.exports.findStoresFromTweetText = findStoresFromTweetText;
module.exports.findStoresFromTweetLocation = findStoresFromTweetLocation;