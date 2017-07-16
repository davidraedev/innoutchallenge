const Twitter = require( "twitter" );
const TwitterPlace = require( "../model/twitter_place" );
const Tweet = require( "../model/tweet" );
const Store = require( "../model/store" );
const Receipt = require( "../model/receipt" );
const User = require( "../model/user" );
require( "dotenv" ).config();
const TwitterUser = require( "../model/twitter_user" );
const wordToNumber = require( "word-to-number-node" );
const w2n = new wordToNumber();
const storeController = require( "./store" );
const twitterUserController = require( "./twitter_user" );
const receiptController = require( "./receipt" );
const userController = require( "./user" );
const ObjectId = require( "mongoose" ).Schema.Types.ObjectId;
const utils = require( "../app/utils" );



// this won't exit immediately if it error in the foreach, it'll continue the loop
const getTweetsFromSearchApp = function() {

	return new Promise( ( resolve, reject ) => {

		getLatestSearchTweetFromDb()
			.then( ( tweet ) => {

				let search_params = { q: "innoutchallenge", count: 100 };

				if ( tweet )
					search_params.since_id = tweet.data.id_str;

				let client = new Twitter({
					consumer_key: process.env.TWITTER_CONSUMER_KEY_USER,
					consumer_secret: process.env.TWITTER_CONSUMER_SECRET_USER,
					bearer_token: process.env.TWITTER_BEARER_TOKEN_USER,
				});

				client.get( "search/tweets", search_params, function( error, tweets ) {

					if ( error )
						return reject( error );

					let resolve_val = {
						found: tweets.statuses.length,
						saved: 0,
					};

					if ( ! tweets.statuses.length )
						return resolve( resolve_val );

					let remaining = tweets.statuses.length;

					let stop;
					tweets.statuses.forEach( ( tweet_data ) => {

						if ( stop )
							return;

						Tweet.findOne(
							{ "data.id_str": tweet_data.id_str },
							function( error, tweet ) {

								if ( error ) {
									stop = true;
									return reject( error );
								}

								if ( tweet === null ) {

									new Tweet( { data: tweet_data, source: 1, fetched: true, fetch_date: new Date() } )
										.save( ( error ) => {

											if ( error ) {
												stop = true;
												return reject( error );
											}

											resolve_val.saved++;

											if ( --remaining === 0 )
												resolve( resolve_val );

										});
								}
								else {
									if ( --remaining === 0 )
										resolve( resolve_val );
								}
							}
						);
					});
				});
			})
			.catch( ( error ) => {
				throw error;
			});

	});
};

const getLatestSearchTweetFromDb = function() {
	return new Promise( ( resolve, reject ) => {
		Tweet.findOne( { source: 1 }, ( error, tweet ) => {

			if ( error )
				return reject( error );

			return resolve( tweet );

		}).sort({ "data.created_at": "desc" });
	});
};

const getTweetsFromSearchUser = function( user ) {

	console.log( "getTweetsFromSearchUser [%s]", user.name );

	return new Promise( ( resolve, reject ) => {

		TwitterUser.findOne( { _id: user.twitter_user }, ( error, twitter_user ) => {

			if ( error )
				return reject( error );

			if ( twitter_user === null )
				return reject( "Failed to find TwitterUser" );

			let client = new Twitter({
				consumer_key: process.env.TWITTER_CONSUMER_KEY_USER,
				consumer_secret: process.env.TWITTER_CONSUMER_SECRET_USER,
				access_token_key: twitter_user.oauth_token,
				access_token_secret: twitter_user.oauth_secret,
			});

			client.get( "statuses/user_timeline", { user_id: twitter_user.data.id_str }, ( error, tweets ) => {

				if ( error )
					return reject( error );

				console.log( "tweets >>" );
				console.log( tweets );

				let remaining = tweets.length;

				let stop;
				tweets.forEach( ( tweet_data ) => {

					if ( stop )
						return;

					Tweet.findOne(
						{ "data.id_str": tweet_data.id_str },
						( error, tweet ) => {

							if ( error )
								return reject( error );

							if ( tweet === null ) {
								new Tweet( { data: tweet_data, source: 2 } ).save( ( error ) => {

									if ( error )
										return reject();

									if ( --remaining === 0 )
										resolve();
								});
							}
							else {
								if ( --remaining === 0 )
									resolve();
							}
						}
					);
				});
			});
		});
	});
};

const getTweetsFromLookupApp = function( status_ids_array ) {

	console.log( "getTweetsFromLookupApp" );

	return new Promise( ( resolve, reject ) => {

		let client = new Twitter({
			consumer_key: process.env.TWITTER_CONSUMER_KEY_USER,
			consumer_secret: process.env.TWITTER_CONSUMER_SECRET_USER,
			bearer_token: process.env.TWITTER_BEARER_TOKEN_USER,
		});

		const ids = status_ids_array.join( "," );

		client.get( "statuses/lookup", { id: ids, map: true }, function( error, tweets ) {

			if ( error )
				return reject( error );

			console.log( tweets );

			resolve( tweets );
		});
	});
};

function parseForInStoreReceipt( text ) {
	let number = parseForInStoreDigits( text ) || w2n.parse( text )[0];
	if ( number && number !== 69 && number > 0 && number < 100 )
		return number;
	return false;
}

function parseForDriveThruReceipt( text ) {
	let number = parseForDriveThruDigits( text ) || w2n.parse( text )[0];
	if ( number && number > 3999 && number < 5000 )
		return number;
	return false;
}

function isRetweet( tweet ) {
	if ( tweet.retweet || /^rt\s/i.test( tweet.data.text ) )
		return true;
	return false;
}

function hasIgnoreFlag( tweet ) {
	if ( /\#\!/i.test( tweet.data.text ) )
		return true;
	return false;
}

function isIgnoredUser( tweet ) {
	if ( tweet.data.user.id_str === "584408608" || tweet.data.user.id_str === "1487483659" )
		return true;
	return false;
}

function parseForInStoreDigits( text ) {
	let matches = text.match( /number\s+(\d{1,2})/i );
	if ( ! matches )
		matches = text.match( /(?:^|[\s!.,])(\d{1,2})(?:[\s!.,]|$)/ );
	if ( matches )
		return matches[1].trim();
	return false;
}

function parseForDriveThruDigits( text ) {
	let matches = text.match( /number\s+(4\d{3})/i );
	if ( ! matches )
		matches = text.match( /(?:^|[\s!.,])(4\d{3})(?:[\s!.,]|$)/ );
	if ( matches )
		return matches[1].trim();
	return false;
}

const parseTweets = function( query_params ) {

	console.log( "parseTweets" );

	return new Promise( ( resolve, reject ) => {

		let query = { fetched: true, parsed: false };

		// merge in extra query params
		if ( query_params ) {
			let keys = Object.keys( query_params );
			keys.forEach( ( key ) => {
				if ( ! query_params.hasOwnProperty( key ) )
					return;
				query[ key ] = query_params[ key ];
			});
		}

		console.log( "query >> ", query );
		findTweets( query )
			.then( ( tweets ) => {

				console.log( "tweets >> ", tweets );

				let resolve_val = {
					found: tweets.length,
					parsed: 0,
				};

				if ( ! tweets.length )
					return resolve( resolve_val );

				let remaining = tweets.length;
	 			let stop;
				tweets.forEach( ( tweet ) => {

					if ( stop )
						return;

					parseTweet( tweet )
						.then(() => {
							++resolve_val.parsed;
							if ( --remaining === 0 )
								resolve( resolve_val );
						})
						.catch( ( error ) => {
							stop = true;
							throw error;
						});
				});
			})
			.catch( ( error ) => {
				return reject( error );
			});
	});
};

const parseTweet = function( tweet ) {

	console.log( "parseTweet" );

	return new Promise( ( resolve, reject ) => {

		function saveTweet() {
			tweet.parsed = true;
			tweet.save( ( error ) => {
				if ( error )
					return reject( error );
				return resolve();
			});
		}

		if ( isRetweet( tweet ) || hasIgnoreFlag( tweet ) || isIgnoredUser( tweet ) ) {
			saveTweet();
		}
		else {
			let number = parseForInStoreReceipt( tweet.data.text );
			let receipt = new Receipt();
			receipt.date = new Date( tweet.data.created_at );
			receipt.tweet = tweet._id;

			if ( number ) {
				receipt.type = 1;
			}
			else {
				number = parseForDriveThruReceipt( tweet.data.text );
				receipt.type = 2;
			}

			if ( number ) {

				receipt.number = number;

				twitterUserController.findOrCreateTwitterUser(
						{ "data.id_str": tweet.data.user.id_str, },
						{
							twitter_id: tweet.data.user.id_str,
							screen_name: tweet.data.user.screen_name,
						}
					).then( ( twitter_user ) => {
						return userController.findOrCreateUser(
							{ twitter_user: twitter_user._id },
							{
								name: twitter_user.data.screen_name,
								twitter_user: twitter_user._id,
								state: 0,

							},
							tweet
						);
					})
					.then( ( user ) => {

						receipt.user = user._id;

						return storeController.parseTweetForStore( tweet );

					})
					.then( ( store ) => {

						if ( store )
							receipt.store = store._id;

						return receiptController.findReceipt({
							number: receipt.number,
							date: receipt.date,
							user: receipt.user,
						});

					})
					.then( ( found_receipt ) => {

						if ( ! found_receipt ) {

							receipt.save( ( error ) => {

								if ( error )
									return reject( error );

								saveTweet();

							});
						}
					})
					.catch( ( error ) => {
						reject( error );
					});
			}
			else {
				saveTweet();
			}
		}
	});
};


const sendTweet = function( twitter_user, tweet ) {

	return new Promise( ( resolve, reject ) => {

		if ( ! twitter_user.oauth_token_admin || ! twitter_user.oauth_secret_admin )
			return reject( "Invalid credentials" );

		let client = new Twitter({
			consumer_key: process.env.TWITTER_CONSUMER_KEY_ADMIN,
			consumer_secret: process.env.TWITTER_CONSUMER_SECRET_ADMIN,
			access_token_key: twitter_user.oauth_token_admin,
			access_token_secret: twitter_user.oauth_secret_admin,
		});

		client.post( "statuses/update", tweet, ( error, tweet ) => {

			if ( error )
				return reject( error );

			return resolve( tweet );
		});
	});
};

const createNewReceiptTweetText = function( screen_name, number, remaining ) {

	const phrases = [
		"Congrats",
		"Nice",
		"Sweet",
		"Cool",
		"Great Scott",
		"Perfect",
		"Good Going",
		"Awesome",
		"Stupendous",
		"Woot",
		"Yo",
		"Yeehaw",
		"Hey Hey Hey",
		"WutWut",
		"Yeehaw",
		"Awesome"
	];

	const key = utils.rand( 0, ( phrases.length - 1 ) );
	const intro = phrases[ key ];

	return "@"+ screen_name +" "+ intro +"! You just got "+ number +". Now you only have "+ remaining +" to go!";
};

const createNewUserTweetText = function( screen_name ) {

	const phrases = [
		"Sweet Whole Grilled Onions",
		"Chopped Chili Chili Bang Bang",
		"Neopolitan Nebulas",
		"Three By Meat Madness",
		"Fantastic Root Beer Floatations",
		"Fabulous Animal Fries",
	];

	const key = utils.rand( 0, ( phrases.length - 1 ) );
	const intro = phrases[ key ];

	const user_url = utils.createUserUrl( screen_name );

	return intro +"! @"+ screen_name +" has joined the #innoutChallenge! "+ user_url;
};

const createNewUserTweetParams = function( screen_name, originating_tweet ) {

	return new Promise( ( resolve, reject ) => {

		if ( ! screen_name )
			return reject( "invalid screen_name ["+ screen_name +"]" );

		let params = {
			status: createNewUserTweetText( screen_name ),
		};

		if ( originating_tweet )
			params.in_reply_to_status_id = originating_tweet.data._id;

		if ( originating_tweet.store ) {
			Store.findOne( { _id: originating_tweet.store }, ( error, store ) => {

				if ( error )
					return;

				if ( ! store )
					return;

				params.lat = store.location.latitude;
				params.long = store.location.longitude;

				if ( store.location.twitter_place ) {

					TwitterPlace.findOne( { _id: store.location.twitter_place }, ( error, twitter_place ) => {

						if ( error )
							return; // logerror

						if ( ! twitter_place )
							return;

						params.place = twitter_place.data.id;

						resolve( params );

					});
				}
				else {
					resolve( params );
				}
			});
		}
		else {
			resolve( params );
		} 
	});
};

const sendNewUserTweet = function( params ) {

	return new Promise( ( resolve, reject ) => {

		TwitterUser.findOne({ "data.screen_name": process.env.NEW_USER_TWEET_SCREEN_NAME }, ( error, twitter_user ) => {

			if ( error )
				return reject( error );

			if ( ! twitter_user )
				return reject( "Unable to find twitter_user" );

			sendTweet( twitter_user, params )
				.then( ( tweet ) => {
					resolve( tweet );
				})
				.catch( ( error ) => {
					reject( error );
				});

		});
	});
};

const getUnfetchedTweets = function() {

	return new Promise( ( resolve, reject ) => {

		Tweet.find({ fetched: { $eq: false } }, ( error, tweets ) => {

			if ( error )
				return reject( error );

			if ( ! tweets )
				return reject( "Unable to find any tweets" );

			resolve( tweets );
		});
	});
};

const findTweet = function( query, fields ) {

	return new Promise( ( resolve, reject ) => {

		Tweet.findOne( query, fields, ( error, tweet ) => {

			if ( error )
				return reject( error );

			resolve( tweet );

		});
	});
};

const findTweets = function( query, fields, options ) {

	return new Promise( ( resolve, reject ) => {

		Tweet.find( query, fields, options, ( error, tweets ) => {

			if ( error )
				return reject( error );

			resolve( tweets );

		});
	});
};

module.exports = {
	getTweetsFromSearchApp: getTweetsFromSearchApp,
	getLatestSearchTweetFromDb: getLatestSearchTweetFromDb,
	getTweetsFromSearchUser: getTweetsFromSearchUser,
	getTweetsFromLookupApp: getTweetsFromLookupApp,
	parseTweets: parseTweets,
	parseTweet: parseTweet,
	sendTweet: sendTweet,
	createNewReceiptTweetText: createNewReceiptTweetText,
	createNewUserTweetText: createNewUserTweetText,
	createNewUserTweetParams: createNewUserTweetParams,
	sendNewUserTweet: sendNewUserTweet,
	getUnfetchedTweets: getUnfetchedTweets,
	findTweet: findTweet,
	findTweets: findTweets,
};