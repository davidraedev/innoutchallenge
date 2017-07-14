var Twitter = require( "twitter" );
var Tweet = require( "../model/tweet" );
var User = require( "../model/user" );
var Receipt = require( "../model/receipt" );
require( "dotenv" ).config();
var TwitterUser = require( "../model/twitter_user" );
var wordToNumber = require( "word-to-number-node" );
var w2n = new wordToNumber();
var storeController = require( "./store" );

// this won't exit immediately if it error in the foreach, it'll continue the loop
var get_tweets_from_search_app = function() {

	return new Promise( ( resolve, reject ) => {

		get_latest_search_tweet_from_db()
			.then( ( tweet ) => {

				let search_params = { q: "innoutchallenge", count: 100 };

				if ( tweet )
					search_params.since_id = tweet.data.id_str;

				let client = new Twitter({
					consumer_key: process.env.TWITTER_CONSUMER_KEY,
					consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
					bearer_token: process.env.TWITTER_BEARER_TOKEN,
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

function get_latest_search_tweet_from_db() {
	return new Promise( ( resolve, reject ) => {
		Tweet.findOne( { source: 1 }, ( error, tweet ) => {

			if ( error )
				return reject( error );

			return resolve( tweet );

		}).sort({ "data.created_at": "desc" });
	});
}

var get_tweets_from_search_user = function( user ) {

	console.log( "get_tweets_from_search_user [%s]", user.name );

	return new Promise( ( resolve, reject ) => {

		TwitterUser.findOne( { _id: user.twitter_user }, ( error, twitter_user ) => {

			if ( error )
				return reject( error );

			if ( twitter_user === null )
				return reject( "Failed to find TwitterUser" );

			var client = new Twitter({
				consumer_key: process.env.TWITTER_CONSUMER_KEY,
				consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
				access_token_key: twitter_user.oauth_token,
				access_token_secret: twitter_user.oauth_secret,
			});

			client.get( "statuses/user_timeline", { user_id: twitter_user.data.id_str }, ( error, tweets ) => {

				if ( error )
					return reject( error );

				console.log( "tweets >>" );
				console.log( tweets );

				var remaining = tweets.length;

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

var get_tweets_from_lookup_app = function( status_ids_array ) {

	console.log( "get_tweets_from_lookup_app" );

	return new Promise( ( resolve, reject ) => {

		var client = new Twitter({
			consumer_key: process.env.TWITTER_CONSUMER_KEY,
			consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
			bearer_token: process.env.TWITTER_BEARER_TOKEN,
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
	let number = parseForDriveThruDigits( text ) || w2n.parse( text );
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

var parseTweets = function() {

	console.log( "parseTweets" );

	return new Promise( ( resolve, reject ) => {

		Tweet.find({ fetched: true, parsed: false }, ( error, tweets ) => {

			if ( error )
				return reject( error );

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
		});
	});
};

var parseTweet = function( tweet ) {

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

				TwitterUser.findOne( { "data.id_str": tweet.data.user.id_str }, ( error, twitter_user ) => {

					if ( error )
						return reject( error );

					if ( ! twitter_user )
						return reject( "TwitterUser not found ["+ tweet.data.user.id_str +"]" );

					User.findOne( { twitter_user: twitter_user._id }, ( error, user ) => {

						if ( error )
							return reject( error );

						if ( ! user )
							return reject( "User not found ["+ twitter_user._id +"]" );

						receipt.user = user._id;

						storeController.parseTweetForStore( tweet )
							.then( ( store ) => {

								if ( store )
									receipt.store = store._id;

								receipt.save( ( error ) => {

									if ( error )
										return reject( error );

									saveTweet();

								});

							}).catch( ( error ) => {
								return reject( error );
							});
					});
				});
			}
			else {
				saveTweet();
			}
		}
	});
};

module.exports = {
	get_tweets_from_search_app: get_tweets_from_search_app,
	get_tweets_from_search_user: get_tweets_from_search_user,
	get_tweets_from_lookup_app: get_tweets_from_lookup_app,
	parseTweets: parseTweets,
	parseTweet: parseTweet,
};