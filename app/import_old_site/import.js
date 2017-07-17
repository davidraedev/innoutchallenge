const db = require( "../db" );
const axios = require( "axios" );
const https = require( "https" );
const fs = require( "fs" );
require( "dotenv" ).config();

const User = require( "../../model/user" );
const TwitterUser = require( "../../model/twitter_user" );
const Tweet = require( "../../model/tweet" );
const Receipt = require( "../../model/receipt" );
const ObjectId = require( "mongoose" ).Types.ObjectId;

const agent = new https.Agent({
	rejectUnauthorized: false
});

const data_url = "https://innoutchallenge.com/export_data.php?key="+ process.env.INNOUTCHALLENGE_OLD_KEY;
const data_path = "data/old_site.json";
const clear_data = true;
const use_cache = true;

function getRemote( path, callback ) {

	console.log( "Fetching remote data" );

	axios.get( path, { httpsAgent: agent } )
		.then( ( response ) =>  {

			callback( null, response.data );

			fs.writeFile( data_path, JSON.stringify( response.data ), function( error ) {
				if ( error )
					return console.log( error );
				console.log( "Saved Data To Local Cache" );
			});

		})
		.catch( ( error ) =>  {
			callback( error );
		});
}

function getLocal( path, callback ) {

	console.log( "Fetching local cache" );

	fs.readFile( data_path, "utf8", function read( error, data ) {

		if ( error ) {
			console.log( "Failed to read from cache file" );
			return callback( error );
		}

		return callback( null, JSON.parse( data ) );

	});
}

function resetData( callback ) {

	if ( ! clear_data )
		callback();

	//console.log( "resetting data" )

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
				throw error;

			console.log( "dropped collection [%s]", collection_name );
			if ( --count === 0 )
				callback();
		});
	});
}

function processUser( user_data, data ) {

	return new Promise( ( resolve, reject ) => {

		let this_user;
//		let this_twitter_user;
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
//			this_twitter_user = twitter_user;

			this_user.twitter_user = new ObjectId( twitter_user._id );
			this_user.save( ( error ) => {

				if ( error )
					return reject( error );

				let tweets = data.tweets.filter( function( tweet_data ) {
					return ( tweet_data.user_id === twitter_user.data.id_str );
				});
				let tweet_count = tweets.length;
				tweets.forEach( ( tweet_data ) => {

					if ( ! tweet_data.tweet_id.length ) {

						Receipt.create({
							number: tweet_data.receipt,
							date: new Date( tweet_data.tweet_date ),
							type: 1,
							user: new ObjectId( this_user._id ),
							approved: tweet_data.approved,
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

							return Receipt.create({
								number: tweet_data.receipt,
								date: new Date( tweet_data.tweet_date ),
								type: 1,
								tweet: new ObjectId( tweet._id ),
								user: new ObjectId( this_user._id ),
								approved: tweet_data.approved,
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
			});
		})
		.catch( ( error ) => {
			reject( error );
		});
	});
}

function importData( error, data ) {

	if ( error )
		throw error;

	let user_count = data.users.length;
	data.users.forEach( ( user_data ) => {

		processUser( user_data, data )
			.catch( ( error ) => {
				throw error;
			})
			.then( () => {
				if ( --user_count === 0 )
					return Receipt.find({}).count();
				else
					throw new Error( "break" );
			})
			.catch( ( error ) => {
				//if ( error !== "break" ) {}
					// do nothing
			})
			.then( ( count ) => {
				console.log( "Receipts [%s]", count );
				return Tweet.find({}).count();
			})
			.then( ( count ) => {
				console.log( "Tweets [%s]", count );
				return TwitterUser.find({}).count();
			})
			.then( ( count ) => {
				console.log( "TwitterUsers [%s]", count );
				return User.find({}).count();
			})
			.then( ( count ) => {
				console.log( "Users [%s]", count );
				db.close();		
			})
			.catch( ( error ) => {
				throw error;
			});
	});
}



db.connect().then( () => {

	resetData( () => {

		if ( ! use_cache )
			return getRemote( data_url, importData );

		getLocal( data_path, ( error, data ) => {
			if ( error )
				return getRemote( data_url, importData );
			importData( null, data );
		});

	});

}).catch( ( error ) => {
	throw error;
});