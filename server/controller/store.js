const Store = require( "../model/store" );
const TwitterPlace = require( "../model/twitter_place" );
const Tweet = require( "../model/tweet" );
const Receipt = require( "../model/receipt" );
const Utils = require( "./utils" );
const innoutLocations = require( "innout_locations" );
const fs = require( "fs" );

const base = process.env.BASE || process.cwd();
const cached_stores_file = base + "/data/stores/stores.json";
const enable_logging = false;

function log() {
	if ( enable_logging ) {
		console.log.apply( console, arguments );
	}
}

const findStoreNearCoords = function(
	latitude,
	longitude,
	distance = 1000
) {
	log( "findStoreNearCoords", latitude, longitude, distance )
	return Store.findOne({
		loc: {
			$nearSphere: {
				$geometry: {
					type: "Point",
					coordinates: [ longitude, latitude ]
				},
				$maxDistance: distance
			}
		}
	});
};

function getTweetCoords( tweet ) {

	if ( ! tweet.data.coordinates
		|| ! tweet.data.coordinates.coordinates.length
	) {
		return false;
	}

	return {
		latitude: tweet.data.coordinates.coordinates[1],
		longitude: tweet.data.coordinates.coordinates[0],
	};
}

function parseStringForStoreHashtag( tweet ) {
	let matches = tweet.match( /\#store(\d+)/ );
	return ( matches ) ? matches[1] : false;
}

function saveTwitterPlace( raw_twitter_place, store ) {

	return new Promise( ( resolve, reject ) => {

		if ( ! raw_twitter_place ) {
			return resolve( null );
		}

		let this_twitter_place;
		TwitterPlace.create({
				last_update: new Date(),
				data: raw_twitter_place,
			})
				.then( ( twitter_place ) => {
					this_twitter_place = twitter_place;
					store.location.twitter_place = twitter_place._id;
					return store.save();
				})
				.then( () => {
					return resolve( this_twitter_place );
				})
				.catch( ( error ) => {
					return reject( error );
				});
	});
}

function boundingBoxCenter( bounding_box ) {

	let lat_min = Infinity,
		long_min = Infinity,
		lat_max = -Infinity,
		long_max = -Infinity;

	bounding_box.forEach( ( val ) => {
		lat_min = Math.min( lat_min, val[1] );
		long_min = Math.min( long_min, val[0] );
		lat_max = Math.max( lat_max, val[1] );
		long_max = Math.max( long_max, val[0] );
	});

	return {
		longitude: ( ( long_min + long_max ) / 2 ),
		latitude: ( ( lat_min + lat_max ) / 2 )
	};
}

function findSavedTwitterPlace( raw_twitter_place ) {

	return new Promise( ( resolve, reject ) => {

		if ( ! raw_twitter_place ) {
			return resolve( null );
		}

		TwitterPlace.findOne( { "data.id": raw_twitter_place.id } )
			.then( ( twitter_place ) => {

				if ( ! twitter_place ) {
					return resolve( null );
				}

				return resolve( twitter_place );
			})
			.catch( ( error ) => {
				return reject( error );
			});
	});
}

function findStoreFromTwitterPlace( tweet ) {
	log( "findStoreFromTwitterPlace" )

	return new Promise( ( resolve, reject ) => {

		let raw_twitter_place = tweet.data.place;
		let is_new_twitter_place = false;

		log( "raw_twitter_place", raw_twitter_place )

		if ( ! raw_twitter_place ) {
			return resolve();
		}

		findSavedTwitterPlace( raw_twitter_place )
			.then( async ( twitter_place ) => {
				log( "twitter_place", twitter_place )
				if ( ! twitter_place ) {
					is_new_twitter_place = true;
					let coords = boundingBoxCenter( raw_twitter_place.bounding_box.coordinates[0] );
					log( "coords 2", coords )
					return findStoreNearCoords( coords.latitude, coords.longitude );
				}
				else {
					log( "twitter_place 2", twitter_place )
					const store = await Store.findOne( { "location.twitter_place": twitter_place._id });
					if ( store ) {
						return store;
					}
					else {
						is_new_twitter_place = true;
						let coords = boundingBoxCenter( raw_twitter_place.bounding_box.coordinates[0] );
						log( "coords 2", coords )
						return findStoreNearCoords( coords.latitude, coords.longitude );
					}
				}
			})
			.then( ( store ) => {
				this_store = store;

				if ( is_new_twitter_place && store ) {
					return saveTwitterPlace( raw_twitter_place, store );
				}

				return null;
			})
			.then( () => {
				return resolve( this_store );
			})
			.catch( ( error ) => {
				reject( error );
			});
	});
}

const parseTweetForStore = function( tweet, ignore_hashtag ) {

	return new Promise( ( resolve, reject ) => {

		let store_number = parseStringForStoreHashtag( tweet.data.text );
		log( "store_number", store_number )
		if ( ! store_number
			|| ignore_hashtag
		) {

			let coords = getTweetCoords( tweet );
			log( "coords", coords )
			if ( ! coords ) {
				findStoreFromTwitterPlace( tweet )
					.then( ( store ) => {
						return resolve( store );
					});
			}
			else {
				findStoreNearCoords(
					coords.latitude,
					coords.longitude
				)
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
		}
		else {
			Store.findOne( {
				number: store_number,
				opened: { $ne: null }
			} )
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
			if ( error ) {
				return reject( error );
			}
			resolve( stores );
		};

		if ( lean ) {
			Store.find( query, callback ).lean();
		}
		else {
			Store.find( query, callback );
		}
	});
};

const findStore = function( query, lean ) {

	return new Promise( ( resolve, reject ) => {

		let callback = function( error, store ) {
			if ( error ) {
				return reject( error );
			}
			resolve( store );
		};

		if ( lean ) {
			Store.findOne( query, callback ).lean();
		}
		else {
			Store.findOne( query, callback );
		}
	});
};

const parseTweetsForStores = function( tweets ) {

	return new Promise( ( resolve, reject ) => {

		let remaining = tweets.length;

		if ( ! remaining ) {
			resolve();
		}

		tweets.forEach( ( tweet ) => {

			parseTweetForStore( tweet )
				.then( () => {
					if ( --remaining === 0 ) {
						resolve();
					}
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
			if ( day === "friday" || day === "saturday" ) {
				hours.end = 130;
			}
			else {
				hours.end = 100;
			}
			hours.manual = false;
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
	store.opened = ( data.OpenDate ) ? Date.parse( data.OpenDate.substring( 0, 10 ) ) : null;
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
							resolve( json.data.length );
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
						log( "No receipt id, skipping tweet" );
						if ( tweets_remaining === 0 )
							resolve();
						return;
					}

					let matches;
					let this_receipt;
					Receipt.findOne( { tweet: tweet._id })
						.then( ( receipt ) => {

							if ( ! receipt ) {
								log( "Receipt not found" );
								return;
							}

							if ( receipt.store ) {
								log( "Store already linked" );
								return;
							}

							matches = tweet.data.text.match( /#store(\d+)/ );
							if ( ! matches ) {
								log( "Tweet has no store hashtag" );
								return;
							}

							this_receipt = receipt;

							return Store.findOne( { number: matches[1], opened: { $ne: null } } );

						})
						.then( ( store ) => {

							if ( ! store ) {
								log( "Store not found [%s]", matches[1] );
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
						log( "No tweet id, skipping receipt" );
						return;
					}

					let this_tweet;
					Tweet.findById( receipt.tweet )
						.then( ( tweet ) => {

							if ( ! tweet ) {
								log( "Tweet not found" );
								return;
							}

							if ( ! tweet.data.coordinates ) {
								log( "Tweet has no coordinates" );
								return;
							}

							return findStoreNearCoords( tweet.data.coordinates.coordinates[1], tweet.data.coordinates.coordinates[0] );
						
						})
						.then( ( store ) => {

							if ( ! store ) {
								if ( this_tweet )
									log( "Store not found [%s] [%s] [%s]", this_tweet.data.coordinates.coordinates[1], this_tweet.data.coordinates.coordinates[0], "https://twitter.com/"+ this_tweet.data.user.screen_name +"/statuses/"+ this_tweet.data.id_str );
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