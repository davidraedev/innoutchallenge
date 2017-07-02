const db = require( "../db" );
const axios = require( "axios" );
const https = require( "https" );
const fs = require( "fs" );
require( "dotenv" ).config()

const User = require( "../../model/user" );
const TwitterUser = require( "../../model/twitter_user" );
const Tweet = require( "../../model/tweet" );
const Store = require( "../../model/store" );
const Receipt = require( "../../model/receipt" );

const ObjectId = require( "mongoose" ).Types.ObjectId;

const agent = new https.Agent({  
	rejectUnauthorized: false
});

const use_cache = true;

const data_url = "https://innoutchallenge.com/export_data.php?key="+ process.env.INNOUTCHALLENGE_OLD_KEY;
const data_path = "data//old_site.json"

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

db.connect().then( () => {

	if ( ! use_cache )
		return getRemote( data_url, importData );

	getLocal( data_path, ( error, data ) => {
		if ( error )
			return getRemote( data_url, importData )
		importData( null, data );
	});

}).catch( ( error ) => {
	throw error;
});

function processUser( user_data, data, callback ) {

	User.create({
		name: user_data.user_screenname,
		join_date: null,
		twitter_user: null,
		state: user_data.approved,
	}, ( error, user ) => {

		if ( error )
			throw error;

		TwitterUser.create({
			oauth_token: user_data.oauthtoken,
			oauth_secret: user_data.oauthtokensecret,
			last_update: new Date( user_data.lastupdate ),
			data: {
				id_str: user_data.user_id,
				screen_name: user_data.user_screenname,
			}
		}, ( error, twitter_user ) => {

			if ( error )
				throw error;

			user.twitter_user = new ObjectId( twitter_user._id );
			user.save( ( error ) => {

				if ( error )
					throw error;
			
				
				let tweets = data.tweets.filter( function( tweet_data ) {
					return ( tweet_data.user_id === twitter_user.data.id_str );
				});
				let tweet_count = tweets.length;
				tweets.forEach( ( tweet_data ) => {
						Tweet.create({
							source: "old_site",
							data: {
								id_str: tweet_data.tweet_id,
								text: tweet_data.tweet_text,
							}
						}, ( error, tweet ) => {

							if ( error )
								throw error;

							if ( ! tweet_data.receipt.length ) {
								if ( --tweet_count === 0 )
									callback();
								return;
							}

							Receipt.create({
								number: tweet_data.receipt,
								date: new Date( tweet_data.tweet_date ),
							//	location: ObjectId,
								tweet: new ObjectId( tweet._id ),
								user: new ObjectId( user._id ),
								approved: tweet_data.approved,
							}, ( error, receipt ) => {

								if ( error )
									throw error;
								if ( --tweet_count === 0 )
									callback();

							})
						})
				})
			})
		})
	})
}

function importData( error, data ) {

	if ( error )
		throw error;

	let user_count = data.users.length;
	data.users.forEach( ( user_data ) => {
		console.log( user_data.user_id )

		processUser( user_data, data, () => {
			console.log( "user_count [%s]", ( user_count - 1 ) )
			if ( --user_count === 0 )
				db.close();
		});
	})
}