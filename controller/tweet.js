const Twitter = require( "twitter-request-queue-node" );
const TwitterPlace = require( "../model/twitter_place" );
const Tweet = require( "../model/tweet" );
const Store = require( "../model/store" );
const User = require( "../model/user" );
const Receipt = require( "../model/receipt" );
require( "dotenv" ).config();
const TwitterUser = require( "../model/twitter_user" );
const wordToNumber = require( "word-to-number-node" );
const w2n = new wordToNumber();
const storeController = require( "./store" );
const userController = require( "./user" );
const tweetQueueController = require( "./tweet_queue" );
const utils = require( "./utils" );
const PromiseBreakError = require( "../app/error/PromiseBreakError" );
const PromiseEndError = require( "../app/error/PromiseEndError" );

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

									createTweet( { data: tweet_data, source: 1, fetched: true, fetch_date: new Date() } )
										.then(() => {

											resolve_val.saved++;

											if ( --remaining === 0 )
												resolve( resolve_val );

										})
										.catch( ( error ) => {
											if ( error ) {
												stop = true;
												return reject( error );
											}
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

const parseTweets = function( do_new_user_tweet, do_new_receipt_tweet ) {
	return new Promise( ( resolve, reject ) => {
		Tweet.find({ fetched: true, parsed: false })
			.then( ( tweets ) => {

				if ( ! tweets.length )
					throw new PromiseEndError( "no tweets" );

				let i = 0;
				let end = ( tweets.length - 1 );
				function parseTweetSync() {
					if ( i === end )
						return resolve();
					parseTweet( tweets[ i++ ], do_new_user_tweet, do_new_receipt_tweet )
						.then( () => {
							parseTweetSync();
						})
						.catch( ( error ) => {
							throw error;
						});
				}

				parseTweetSync();
			})
			.catch( ( error ) => {
				if ( error instanceof PromiseEndError ) {
					resolve();
				}
				else {
					reject( error );
				}
			});
	});
};

const parseTweet = function( tweet, do_new_user_tweet, do_new_receipt_tweet ) {

	let this_twitter_user,
		this_user,
		this_receipt,
		this_totals,
		this_store,
		is_new_in_store,
		is_new_drive_thru,
		is_new_store,
		message_type = 0;

	tweet.parsed = true;
	tweet.data.created_at = new Date( tweet.data.created_at );

	return TwitterUser.findOne( { "data.id_str": tweet.data.user.id_str } )
		.then( ( twitter_user ) => {

			if ( ! twitter_user ) {
				return TwitterUser.create({
					data: {
						id_str: tweet.data.user.id_str,
						screen_name: tweet.data.user.screen_name,
					},
				});
			}
			else {
				return twitter_user;
			}
		})
		.then( ( twitter_user ) => {
			this_twitter_user = twitter_user;
			return User.findOne( { twitter_user: twitter_user._id } );
		})
		.then( ( user ) => {

			if ( ! user ) {
				return User.create({
					name: this_twitter_user.data.screen_name,
					twitter_user: this_twitter_user._id,
					state: 0,
				});
			}
			else {
				return user;
			}
		})
		.then( ( user ) => {
			this_user = user;
			if ( isRetweet( tweet ) || hasIgnoreFlag( tweet ) || isIgnoredUser( tweet ) ) {
				throw new PromiseEndError();
			}
			else {
				let in_store_number = parseForInStoreReceipt( tweet.data.text );
				let receipt = new Receipt();
					receipt.date = new Date( tweet.data.created_at );
					receipt.tweet = tweet._id;
					receipt.user = this_user._id;
					receipt.twitter_user = this_twitter_user._id;

				if ( in_store_number ) {
					receipt.type = 1;
					receipt.number = in_store_number;
					return receipt;
				}
				else {
					let drive_thru_number = parseForDriveThruReceipt( tweet.data.text );
					if ( drive_thru_number ) {
						receipt.type = 2;
						receipt.number = drive_thru_number;
						return receipt;
					}
					else {
						throw new PromiseBreakError( "invalid number" );
					}
				}
			}
		})
		.then( ( receipt ) => {
			this_receipt = receipt;
			return Receipt.findOne({
				number: receipt.number,
				date: receipt.date,
				user: receipt.user,
				approved: ( this_user.state === 1 ) ? 2 : 0,
			});
		})
		.then( ( receipt ) => {
			if ( receipt )
				throw new PromiseBreakError( "receipt exists" );
			else
				return storeController.parseTweetForStore( tweet );
		})
		.then( ( store ) => {
			if ( store )
				this_receipt.store = store._id;

			this_store = store;

			// check if this is a new in_store/drive_thru receipt
			return Receipt.findOne( { number: this_receipt.number, user: this_user._id } );
		})
		.then( ( existing_number_receipt ) => {
			if ( ! existing_number_receipt ) {
				if ( this_receipt.type === 1 )
					is_new_in_store = true;
				else if ( this_receipt.type === 2 )
					is_new_drive_thru = true;
			}

			if ( this_receipt.store )
				return Receipt.findOne( { store: this_receipt.store, user: this_user._id } );
			return false;
		})
		.then( ( existing_store_receipt ) => {
			if ( ! existing_store_receipt )
				is_new_store = true;

			return this_receipt.save();
		})
		.then( () => {
			return userController.updateUserTotals( this_user );
		})
		.then( ( totals ) => {
			this_totals = totals;
			return tweetQueueController.findQueue( { user: this_user._id, type: 1 } );
		})
		.then( ( tweet_queue ) => {

			if ( ! tweet_queue && do_new_receipt_tweet && this_receipt.approved === 2 ) {

				let data = {
					is_new_in_store: is_new_in_store,
					in_store_receipt_number: this_receipt.number,
					in_store_receipts_remaining: this_totals.receipts.remaining,
					is_new_drive_thru: is_new_drive_thru,
					drive_thru_receipt_number: this_receipt.number,
					drive_thru_receipts_remaining: this_totals.drivethru.remaining,
					is_new_store: is_new_store,
					store_number: this_store.number,
					stores_remaining: this_totals.stores.remaining,
				};

				if ( is_new_in_store ) {
					if ( this_user.settings.tweet.unique_numbers ) {
						message_type = 1;
						return createNewReceiptTweetParams( this_twitter_user.data.screen_name, tweet, data );
					}
					else if ( this_user.settings.dm.unique_numbers ) {
						message_type = 2;
						return createNewReceiptDMParams( this_twitter_user.data.screen_name, data );
					}
				}
				else if ( is_new_drive_thru ) {
					if ( this_user.settings.dm.drive_thrus ) {
						message_type = 2;
						return createNewReceiptDMParams( this_twitter_user.data.screen_name, data );
					}
					else
						return;
				}
				else {
					return;
				}
			}
			else {
				return;
			}
		})
		.then( ( params ) => {
			if ( params )
				return tweetQueueController.addTweetToQueue( params, this_user._id, 2, null, message_type );
		})
		.then( () => {

			tweet.save().then(() => {
				throw new PromiseEndError( "none remaining" );
			}).catch( ( error ) => {
				if ( error instanceof PromiseEndError ) {
				}
				else {
					throw error;
				}
			});
		})
		.catch( ( error ) => {
			if ( error instanceof PromiseBreakError || error instanceof PromiseEndError ) {
				tweet.save().then(() => {
					throw new PromiseEndError();
				}).catch(( error ) => {
					if ( error instanceof PromiseEndError ) {

					}
					else {
						throw error;
					}
				});
			}
			else {
				throw error;
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

const sendDM = function( twitter_user, dm ) {

	return new Promise( ( resolve, reject ) => {

		if ( ! twitter_user.oauth_token_admin || ! twitter_user.oauth_secret_admin )
			return reject( "Invalid credentials" );

		let client = new Twitter({
			consumer_key: process.env.TWITTER_CONSUMER_KEY_ADMIN,
			consumer_secret: process.env.TWITTER_CONSUMER_SECRET_ADMIN,
			access_token_key: twitter_user.oauth_token_admin,
			access_token_secret: twitter_user.oauth_secret_admin,
		});

		let data = {
			"user_id": dm.user_id,
			"text": dm.text,
		};

		client.post( "direct_messages/new", data, ( error, tweet ) => {

			if ( error )
				return reject( error );

			return resolve( tweet );
		});
	});
};

const createNewReceiptTweetText = function( screen_name, data ) {

	let in_store_phrases = [
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
	let drive_thru_phrases = in_store_phrases;

	let key;
	let intro;
	if ( data.is_new_in_store ) {
		key = utils.rand( 0, ( in_store_phrases.length - 1 ) );
		intro = in_store_phrases[ key ];
	}
	else if ( data.is_new_drive_thru ) {
		key = utils.rand( 0, ( drive_thru_phrases.length - 1 ) );
		intro = drive_thru_phrases[ key ];
	}

	if ( data.is_new_drive_thru && data.is_new_store )
		return "@"+ screen_name +" "+ intro +"! You just got "+ data.drive_thru_receipt_number +" and store "+ data.store_number +"!. Now you only have "+ data.stores_remaining +" stores to go!";
	else if ( data.is_new_in_store && data.is_new_store )
		return "@"+ screen_name +" "+ intro +"! You just got "+ data.in_store_receipt_number +" and store "+ data.store_number +"!. Now you only have "+ data.in_store_receipts_remaining +" receipts and "+ data.stores_remaining +" stores to go!";
	else if ( data.is_new_drive_thru )
		return "@"+ screen_name +" "+ intro +"! You just got "+ data.drive_thru_receipt_number +".";
	else if ( data.is_new_in_store )
		return "@"+ screen_name +" "+ intro +"! You just got "+ data.in_store_receipt_number +". Now you only have "+ data.in_store_receipts_remaining +" to go!";
};

const createNewReceiptDMText = createNewReceiptTweetText;

/*
	 data = {
		is_new_in_store: (Boolean),
		in_store_receipt_number: (Number),
		in_store_receipts_remaining: (Number),
		is_new_drive_thru: (Boolean),
		drive_thru_receipt_number: (Number),
		drive_thru_receipts_remaining: (Number),
		is_new_store: (Boolean),
		store_number: (Number),
		stores_remaining: (Number),
	}
*/
const createNewReceiptTweetParams = function( screen_name, originating_tweet, data ) {

	return new Promise( ( resolve, reject ) => {

		if ( ! screen_name )
			return reject( "invalid screen_name ["+ screen_name +"]" );

		let params = {
			status: createNewReceiptTweetText( screen_name, data ),
		};

		if ( originating_tweet )
			params.in_reply_to_status_id = originating_tweet.data.id_str;

		if ( data.store_number ) {

			Store.findOne( { number: data.store_number } )
				.then( ( store ) => {

					if ( ! store )
						return resolve( params );

					params.lat = store.location.latitude;
					params.long = store.location.longitude;

					if ( store.location.twitter_place ) {

						TwitterPlace.findOne( { _id: store.location.twitter_place }, ( error, twitter_place ) => {

							if ( error )
								return;

							if ( ! twitter_place )
								return resolve( params );

							params.place = twitter_place.data.id;

							resolve( params );

						});
					}
					else {
						resolve( params );
					}
				})
				.catch( ( error ) => {
					reject( error );
				});
		}
		else {
			resolve( params );
		} 
	});
};

/*
	 data = {
		is_new_in_store: (Boolean),
		in_store_receipt_number: (Number),
		in_store_receipts_remaining: (Number),
		is_new_drive_thru: (Boolean),
		drive_thru_receipt_number: (Number),
		drive_thru_receipts_remaining: (Number),
		is_new_store: (Boolean),
		store_number: (Number),
		stores_remaining: (Number),
	}
*/
const createNewReceiptDMParams = function( screen_name, data ) {

	return new Promise( ( resolve, reject ) => {

		if ( ! screen_name )
			return reject( "invalid screen_name ["+ screen_name +"]" );

		let params = {
			screen_name: screen_name,
			status: createNewReceiptDMText( screen_name, data ),
		};

		resolve( params );
	});
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
			params.in_reply_to_status_id = originating_tweet.data.id_str;

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

		TwitterUser.findOne({ "data.id_str": process.env.NEW_USER_TWEET_USER_ID }, ( error, twitter_user ) => {

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

const createTweet = function( data ) {

	return new Promise( ( resolve, reject ) => {

		data.data = formatTweetData( data.data );

		Tweet.create( data, ( error, tweet ) => {

			if ( error )
				return reject( error );

			resolve( tweet );

		});
	});
};

const formatTweetData = function( data ) {

	if ( data.created_at )
		data.created_at = new Date( data.created_at );

	return data;
};

module.exports.getTweetsFromSearchApp = getTweetsFromSearchApp;
module.exports.getLatestSearchTweetFromDb = getLatestSearchTweetFromDb;
module.exports.getTweetsFromSearchUser = getTweetsFromSearchUser;
module.exports.getTweetsFromLookupApp = getTweetsFromLookupApp;
module.exports.parseTweets = parseTweets;
module.exports.sendTweet = sendTweet;
module.exports.sendDM = sendDM;
module.exports.createNewReceiptTweetText = createNewReceiptTweetText;
module.exports.createNewReceiptTweetParams = createNewReceiptTweetParams;
module.exports.createNewUserTweetText = createNewUserTweetText;
module.exports.createNewUserTweetParams = createNewUserTweetParams;
module.exports.sendNewUserTweet = sendNewUserTweet;
module.exports.getUnfetchedTweets = getUnfetchedTweets;
module.exports.findTweet = findTweet;
module.exports.findTweets = findTweets;
module.exports.createTweet = createTweet;
module.exports.formatTweetData = formatTweetData;