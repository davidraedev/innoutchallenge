const axios = require( "axios" );
const fs = require( "fs" );
const db = require( "../app/db" );
const https = require( "https" );
const agent = new https.Agent({
	rejectUnauthorized: false
});
require( "dotenv" ).config( { path: process.env.ENV_PATH } );
const User = require( "../model/user" );
const TwitterUser = require( "../model/twitter_user" );
const Tweet = require( "../model/tweet" );
const Receipt = require( "../model/receipt" );
const ObjectId = db.mongoose.Types.ObjectId;
const tweetController = require( "./tweet" );

const default_data_path = "data/old_site/old_site.json";
const default_data_url = "https://innoutchallenge.com/export_data.php?key="+ process.env.INNOUTCHALLENGE_OLD_KEY;

const PromiseEndError = require( "../app/error/PromiseEndError" );

const getRemote = function( data_url, data_path ) {

	data_path = data_path || default_data_path;
	data_url = data_url || default_data_url;

	return new Promise( ( resolve, reject ) => {

		axios.get( data_url, { httpsAgent: agent } )
			.then( ( response ) =>  {

				fs.writeFile( default_data_path, JSON.stringify( response.data ), function( error ) {
					if ( error )
						throw error;
					resolve( response.data );
				});

			})
			.catch( ( error ) =>  {
				reject( error );
			});
	});
};

const getLocal = function( data_path ) {

	data_path = data_path || default_data_path;

	return new Promise( ( resolve, reject ) => {

		fs.readFile( data_path, "utf8", function read( error, data ) {

			if ( error )
				return reject( error );

			resolve( JSON.parse( data ) );

		});
	});
};

const resetData = function() {

	return new Promise( ( resolve, reject ) => {

		let collection_names = [
			"tweets",
			"receipts",
			"twitterusers",
			"users",
			"tweetqueues",
		];
		let count = collection_names.length;
		collection_names.forEach( ( collection_name ) => {
			db.mongoose.connection.db.dropCollection( collection_name, ( error ) => {
				
				// mongo throws an error when droppng a non-existent collection, so ignore that
				if ( error && error != "MongoError: ns not found" )
					reject( error );

				if ( --count === 0 )
					resolve();
			});
		});
	});
};

function processUser( user_data, data ) {

	return new Promise( ( resolve, reject ) => {

		let this_user;
		let this_twitter_user;
		User.create({
			name: user_data.user_screenname,
			join_date: null,
			twitter_user: null,
			state: user_data.approved,
		})
		.then( ( user ) => {
			this_user = user;

			return TwitterUser.create({
				oauth_token: user_data.oauthtoken,
				oauth_secret: user_data.oauthtokensecret,
				last_update: new Date( user_data.lastupdate ),
				data: {
					id_str: user_data.user_id,
					screen_name: user_data.user_screenname,
				}
			});

		})
		.then( ( twitter_user ) => {
			this_twitter_user = twitter_user;
			this_user.twitter_user = new ObjectId( twitter_user._id );
			return this_user.save();
		})
		.then( () => {

			let tweets = data.tweets.filter( function( tweet_data ) {
				return ( tweet_data.user_id === this_twitter_user.data.id_str );
			});
			let tweet_count = tweets.length;
			tweets.forEach( ( tweet_data ) => {

				let search = {
					number: tweet_data.receipt,
					date: new Date( tweet_data.tweet_date ),
					type: 1,
					user: new ObjectId( this_user._id ),
				};

				let receipt_data = {
					number: tweet_data.receipt,
					date: new Date( tweet_data.tweet_date ),
					type: 1,
					user: new ObjectId( this_user._id ),
					approved: tweet_data.approved,
				};

				// tweetless receipt
				if ( ! tweet_data.tweet_id.length ) {

					Receipt.findOne( search )
						.then( ( receipt ) => {
							if ( ! receipt )
								return Receipt.create( receipt_data );
							else
								return receipt;
						})
						.then(() => {
							if ( --tweet_count === 0 )
								return resolve();
						})
						.catch( ( error ) => {
							if ( error )
								throw error;
						});
				}
				// tweeted receipt, create tweet
				else {

					Tweet.create( {
							source: 0,
							data: {
								id_str: tweet_data.tweet_id,
								text: tweet_data.tweet_text,
							}
						})
						.then( ( tweet ) => {

							if ( ! tweet_data.receipt.length ) {
								if ( --tweet_count === 0 )
									resolve();
								return;
							}

							Receipt.findOne( { tweet: new ObjectId( tweet._id ) } )
								.then( ( receipt ) => {
									if ( ! receipt ) {
										receipt_data.tweet = new ObjectId( tweet._id );
										return Receipt.create( receipt_data );
									}
									else
										return receipt;
								})
								.then(() => {
									if ( --tweet_count === 0 )
										return resolve();
								})
								.catch( ( error ) => {
									if ( error )
										throw error;
								});

						})
						.then(() => {
							if ( --tweet_count === 0 )
								resolve();
						})
						.catch( ( error ) => {
							throw error;
						});
				}
			});
		})
		.catch( ( error ) => {
			if ( error instanceof PromiseEndError )
				return resolve();
			return reject( error );
		});
	});
}

const importData = function( data ) {

	return new Promise( ( resolve, reject ) => {

		let user_count = data.users.length;
		let stop = false;
		data.users.forEach( ( user_data ) => {

			if ( stop )
				return;

			processUser( user_data, data )
				.then( () => {
					if ( --user_count === 0 )
						resolve();
				})
				.catch( ( error ) => {
					stop = true;
					reject( error );
				});
		});
	});
};

const refetchTweets = function() {

	return new Promise( ( resolve, reject ) => {

		tweetController.findTweets( { fetched: false, missing: 0 }, null, { limit: 100 } )
			.then( ( tweets_to_fetch ) => {

				if ( ! tweets_to_fetch || ! tweets_to_fetch.length ) {
					console.log( "no tweets needing fetching found" );
					resolve( true );
					return;
				}

				let status_ids_array = [];
				tweets_to_fetch.forEach( ( tweet ) => {
					status_ids_array.push( tweet.data.id_str );
				});

				return tweetController.getTweetsFromLookupApp( status_ids_array );

			})
			.then( ( tweets ) => {

				let keys = Object.keys( tweets.id );
				let remaining = keys.length;

				if ( ! keys.length )
					return resolve( true );

				let stop = false;
				keys.forEach( ( tweet_id ) => {

					if ( stop )
						return;

					let tweet_data = tweets.id[ tweet_id ];

					tweetController.findTweet( { "data.id_str": tweet_id } )
						.then( ( tweet ) => {

							if ( tweet === null )
								throw new Error( "Existing Tweet was not found [%s]", tweet_data.id_str );

							if ( tweet_data ) {
								tweet.data = tweetController.formatTweetData( tweet_data );
								tweet.fetched = true;
							}
							else {
								tweet.missing = 3;
							}

							tweet.fetch_date = new Date();
							tweet.save().then( () => {
								resolve( ( --remaining === 0 ) );
								stop = true;
							})
							.catch( ( error ) => {
								throw error;
							});
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


const refetchTweetsAll = function() {

	return new Promise( ( resolve, reject ) => {

		function loop( is_done ) {

			if ( is_done ) {
				return resolve();
			}

			setTimeout( () => {
				refetchTweets().then( ( is_done_val ) => {
					loop( is_done_val );
				}).catch( ( error ) => {
					reject( error );
				});
			}, 100 );

		}

		loop();

	});
};

const postCleanup = function() {

	return new Promise( ( resolve, reject ) => {

		Receipt.remove( { number: 69, type: 1 } )
			.then( () => {
				return Receipt.update( { approved: 0 }, { $set: { approved: 1 } }, { multi: true } );
			}).then( () => {
				resolve();
			}).catch( ( error ) => {
				reject( error );
			});
	});
};


module.exports.getRemote = getRemote;
module.exports.getLocal = getLocal;
module.exports.resetData = resetData;
module.exports.importData = importData;
module.exports.refetchTweets = refetchTweets;
module.exports.refetchTweetsAll = refetchTweetsAll;
module.exports.postCleanup = postCleanup;
