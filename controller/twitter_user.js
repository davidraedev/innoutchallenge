var Twitter = require( "twitter" );
var TwitterUser = require( "../model/twitter_user" );
require( "dotenv" ).config();

// need to add in rate limiting

// this won't exit immediately if it error in the foreach, it'll continue the loop
var refresh_user = function( user, callback ) {

	TwitterUser.findOne( { _id: user.twitter_user }, function( error, twitter_user ) {

		console.log( "twitter_user" );
		console.log( twitter_user );

		if ( error )
			throw error;

		if ( twitter_user === null )
			throw new Error( "Failed to find Twitter user ["+ user.twitter_user + "]" );

		let client_params = {
			consumer_key: process.env.TWITTER_CONSUMER_KEY,
			consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
		};

		if ( twitter_user.oauth_token && twitter_user.oauth_secret ) {
			console.log( "using saved twitter user credentials" );
			client_params.access_token_key = twitter_user.oauth_token;
			client_params.access_token_secret = twitter_user.oauth_secret;
		}
		else {
			console.log( "no user credentials found, using ap bearer token" );
			client_params.bearer_token = process.env.TWITTER_BEARER_TOKEN;
		}

		let client = new Twitter( client_params );

		client.get( "users/show", { user_id: twitter_user.data.id_str }, function( error, twitter_user_object ) {

			if ( error )
				return callback( error );

			console.log( "twitter_user_object" );
			console.log( twitter_user_object );

			twitter_user.data = twitter_user_object;
			twitter_user.last_update = new Date();
			twitter_user.save( function( error ){

				if ( error )
					throw error;

				console.log( "successfully updated twitter user" );

			});

		});

	});

};

var createTwitterUser = function( user_data ) {

	return new Promise( ( resolve, reject ) => {

		let data = {};
		data.data = {};
		data.data.id_str = user_data.twitter_id;
		data.data.screen_name = user_data.screen_name;

		if ( user_data.oauth_token )
			data.oauth_token = user_data.oauth_token;

		if ( user_data.oauth_secret )
			data.oauth_secret = user_data.oauth_secret;

		if ( user_data.last_update )
			data.last_update = user_data.last_update;

		TwitterUser.create( data, ( error, twitter_user ) => {

			if ( error )
				return reject( error );

			return resolve( twitter_user );

		});

	});
};

var findTwitterUser = function( query, lean ) {

	return new Promise( ( resolve, reject ) => {

		let callback = function( error, twitter_user ) {
			if ( error )
				return reject( error );
			resolve( twitter_user );
		};

		if ( lean )
			TwitterUser.findOne( query, callback ).lean();
		else
			TwitterUser.findOne( query, callback );
	});
};

var findOrCreateTwitterUser = function( query, data ) {

	return new Promise( ( resolve, reject ) => {

		findTwitterUser( query )
			.then( ( twitter_user ) => {
				if ( ! twitter_user )
					return createTwitterUser( data );
				return twitter_user;
			})
			.then( ( twitter_user ) => {
				resolve( twitter_user );
			})
			.catch( ( error ) => {
				reject( error );
			});

	});
};

module.exports.refresh_user = refresh_user;
module.exports.createTwitterUser = createTwitterUser;
module.exports.findTwitterUser = findTwitterUser;
module.exports.findOrCreateTwitterUser = findOrCreateTwitterUser;